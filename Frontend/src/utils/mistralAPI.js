const MISTRAL_API_KEY = process.env.REACT_APP_MISTRAL_API_KEY || "JiwCQ4DdGoUSkmuLeSsMoK8RgEX8AhcA";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function getMistralResponse(prompt, systemPrompt = "", maxRetries = 3) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt
    });
  }
  
  messages.push({
    role: "user",
    content: prompt
  });
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: messages,
          temperature: 0.1,
          max_tokens: 16000,
          response_format: { type: "json_object" }
        })
      });
      
      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 2000;
        console.warn(`Mistral 429 Rate Limit. Retrying in ${delay}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Error calling Mistral API after max retries:", error);
        throw error;
      }
      const delay = Math.pow(2, attempt) * 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("API request failed: Max retries exceeded");
}

export async function extractTextFromDocument(base64Data, mediaType, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistral-ocr-latest",
          document: {
            type: "document_url",
            document_url: `data:${mediaType};base64,${base64Data}`
          }
        })
      });
      
      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 2000;
        console.warn(`OCR 429 Rate Limit. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`OCR API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.pages.map(page => page.markdown).join('\n\n');
      
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error("Error calling Mistral OCR API after max retries:", error);
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

  const response = await getMistralResponse(userPrompt, systemPrompt);
  
  // Extract JSON block even if AI includes conversational text before/after
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in response");
  }
  
  return JSON.parse(jsonMatch[0]);
}