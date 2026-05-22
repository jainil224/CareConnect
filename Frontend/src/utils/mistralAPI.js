import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyCfyDOrHyCvsFKJkhjQCOf5Wba-p-IaVuk";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// We keep the name "getMistralResponse" so we don't break the imports in AIAssistant and MedBotChatWidget,
// but it is now fully powered by Gemini!
export async function getMistralResponse(prompt, systemPrompt = "", maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt || undefined
      });
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Error calling Gemini AI in chat:", error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export async function extractTextFromDocument(base64Data, mediaType, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Ensure the base64 string doesn't have the data URL prefix
      let cleanBase64 = base64Data;
      if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.split('base64,')[1];
      }

      // We use Gemini 1.5 Flash for blazing fast OCR
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = "Please carefully read this medical document and extract ALL text, numbers, and tables from it exactly as they appear. Do not summarize yet, just transcribe it completely.";
      
      const imageParts = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mediaType
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      return result.response.text();
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Error calling Gemini OCR API after max retries:", error);
        throw error;
      }
      const delay = Math.pow(2, attempt) * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("OCR API request failed: Max retries exceeded");
}

export async function analyzeMedicalReport(reportText) {
  const systemPrompt = `You are MedScan AI, an expert medical report analyst with deep knowledge across all medical specialties including pathology, radiology, haematology, biochemistry, microbiology, cardiology, and endocrinology.

Your job is to read an uploaded medical report and produce a THOROUGH, STRUCTURED, PLAIN-LANGUAGE analysis. You must never return vague or empty results. Even if a field is partially unreadable, make a best-effort extraction and flag it.

CRITICAL RULES:
1. Always extract EVERY test, parameter, or finding present in the document — do not skip any.
2. For every numeric result, compare it against the standard reference range (use the range printed in the report if available; otherwise use internationally accepted norms).
3. Classify each result as: NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH | ABNORMAL (for qualitative findings).
4. Write patient-friendly plain-English explanations for every abnormal finding.
5. Never say "Error analyzing report" — if something is unclear, describe what you can see and flag the uncertainty.
6. Always respond with a single valid JSON object matching the schema provided in the user message. No markdown fences, no preamble, no extra text — pure JSON only.
7. Do not provide a diagnosis. Provide observations, flag abnormal values, and recommend next steps.
8. Always include a disclaimer at the end of the summary.

TONE: Professional but accessible. A patient with no medical background should understand your explanations.`;
  
  const userPrompt = `Analyze the attached medical report completely and thoroughly.

Return ONLY a single JSON object with this exact schema (no markdown, no explanation outside JSON):

{
  "meta": {
    "reportType": "string — e.g. Complete Blood Count, Lipid Profile, MRI Brain, Urine Routine, etc.",
    "patientName": "string or null if not found",
    "patientAge": "string or null",
    "patientGender": "string or null",
    "reportDate": "string (DD-MM-YYYY) or null",
    "referredBy": "string (doctor name) or null",
    "facility": "string (lab/hospital name) or null",
    "sampleType": "string — e.g. Venous Blood, Urine, Serum, etc. or null"
  },

  "summary": "string — 3 to 5 sentence plain-English summary of the overall report. Mention the most important findings (both normal and abnormal). End with: 'This report is for informational purposes only. Please consult your doctor for medical advice.'",

  "overallStatus": "NORMAL | MOSTLY_NORMAL | ATTENTION_NEEDED | URGENT — based on severity of findings",

  "findings": [
    {
      "testName": "string — exact name of the test/parameter as printed",
      "value": "string — reported value with unit (e.g. '13.5 g/dL')",
      "referenceRange": "string — normal range (e.g. '12.0 – 16.0 g/dL') — use report's range or standard norms",
      "unit": "string",
      "status": "NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH | ABNORMAL",
      "plainExplanation": "string — what this test measures and what your specific result means in simple plain English. ALWAYS provide this, even if the result is NORMAL.",
      "clinicalSignificance": "string — potential clinical implications. ALWAYS provide this, even if the result is NORMAL.",
      "section": "string — category/section heading from the report (e.g. 'Haematology', 'Liver Function', 'Thyroid Profile')"
    }
  ],

  "abnormalCount": "integer — total number of abnormal/out-of-range findings",
  "criticalCount": "integer — total number of CRITICAL_LOW or CRITICAL_HIGH findings",

  "keyInsights": [
    "string — up to 5 most important observations from the report, written in plain English"
  ],

  "recommendations": [
    "string — specific, actionable next steps (e.g. 'Repeat CBC after 4 weeks', 'Consult haematologist for low haemoglobin', 'Increase dietary iron intake', 'Monitor blood pressure')"
  ],

  "urgencyFlags": [
    {
      "parameter": "string — name of the critical parameter",
      "value": "string — the reported value",
      "reason": "string — why this is urgent in plain English"
    }
  ],

  "lifestyle": [
    "string — 3 to 5 diet, exercise, or lifestyle suggestions relevant to the findings"
  ],

  "disclaimer": "This AI-generated analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider regarding your medical results."
}

IMPORTANT REMINDERS BEFORE YOU RESPOND:
- Extract EVERY single test listed in the report into the findings array.
- Do not group multiple tests into one finding entry.
- If the report has multiple sections (e.g. CBC + LFT + TFT), include ALL sections.
- If a value is handwritten and unclear, set status to "ABNORMAL" and note "Value unclear — manual verification needed" in plainExplanation.
- Never return an empty findings array. If the PDF has no readable tests, explain what you see in the summary.

Here is the extracted text from the medical report:
${reportText}`;

  // We use Gemini 1.5 Pro for the deep medical analysis
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: systemPrompt
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });
  
  const responseText = result.response.text();
  return JSON.parse(responseText);
}