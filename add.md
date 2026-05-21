# Medical Report Analysis — AI Prompt Guide

> Use this prompt inside your app when sending a medical PDF to the Claude API.
> Replace the `[PLACEHOLDERS]` with dynamic values from your app.

---

## How to Use This File

1. Copy the **System Prompt** (Section 1) into the `system` field of your API call.
2. Copy the **User Prompt** (Section 2) into the `user` message, attaching the PDF as a base64 document.
3. Follow the **API Call Template** (Section 3) exactly.
4. Use the **Response Schema** (Section 4) to parse and render the structured JSON output.

---

## Section 1 — System Prompt

Paste this verbatim as the `system` parameter in your `/v1/messages` call:

```
You are MedScan AI, an expert medical report analyst with deep knowledge across all medical specialties including pathology, radiology, haematology, biochemistry, microbiology, cardiology, and endocrinology.

Your job is to read an uploaded medical report (PDF or image) and produce a THOROUGH, STRUCTURED, PLAIN-LANGUAGE analysis. You must never return vague or empty results. Even if a field is partially unreadable, make a best-effort extraction and flag it.

CRITICAL RULES:
1. Always extract EVERY test, parameter, or finding present in the document — do not skip any.
2. For every numeric result, compare it against the standard reference range (use the range printed in the report if available; otherwise use internationally accepted norms).
3. Classify each result as: NORMAL | LOW | HIGH | CRITICAL_LOW | CRITICAL_HIGH | ABNORMAL (for qualitative findings).
4. Write patient-friendly plain-English explanations for every abnormal finding.
5. Never say "Error analyzing report" — if something is unclear, describe what you can see and flag the uncertainty.
6. Always respond with a single valid JSON object matching the schema provided in the user message. No markdown fences, no preamble, no extra text — pure JSON only.
7. Do not provide a diagnosis. Provide observations, flag abnormal values, and recommend next steps.
8. Always include a disclaimer at the end of the summary.

TONE: Professional but accessible. A patient with no medical background should understand your explanations.
```

---

## Section 2 — User Prompt Template

Paste this as the `content` of the `user` message (with the PDF attached):

```
Analyze the attached medical report PDF completely and thoroughly.

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
      "plainExplanation": "string — what this test measures and what the result means in plain English. Only required if status is not NORMAL — otherwise use empty string.",
      "clinicalSignificance": "string — potential clinical implications if abnormal (e.g. 'May indicate anaemia or iron deficiency'). Empty string if NORMAL.",
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
```

---

## Section 3 — Full API Call Template (JavaScript)

```javascript
async function analyzeMedicalReport(base64PdfData) {
  const systemPrompt = `[Paste Section 1 system prompt here]`;

  const userPrompt = `[Paste Section 2 user prompt here]`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // API key is injected automatically in Claude Artifacts — do not add it manually
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,  // increase from 1000 to handle large reports
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64PdfData
              }
            },
            {
              type: "text",
              text: userPrompt
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();

  // Extract text from response
  const rawText = data.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("\n");

  // Strip any accidental markdown fences
  const clean = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("JSON parse failed. Raw response:", rawText);
    throw new Error("AI returned invalid JSON. Raw: " + rawText.slice(0, 300));
  }
}
```

---

## Section 4 — Response Schema Reference

| Field | Type | Description |
|---|---|---|
| `meta.reportType` | string | Type of medical report detected |
| `meta.patientName` | string/null | Patient name from report |
| `meta.reportDate` | string/null | Date of report |
| `meta.facility` | string/null | Lab or hospital name |
| `summary` | string | 3–5 sentence plain-English overview |
| `overallStatus` | enum | `NORMAL` / `MOSTLY_NORMAL` / `ATTENTION_NEEDED` / `URGENT` |
| `findings[]` | array | One entry per test parameter |
| `findings[].status` | enum | `NORMAL` / `LOW` / `HIGH` / `CRITICAL_LOW` / `CRITICAL_HIGH` / `ABNORMAL` |
| `findings[].plainExplanation` | string | Plain-English meaning (non-empty if abnormal) |
| `abnormalCount` | integer | Number of out-of-range results |
| `criticalCount` | integer | Number of critical-level results |
| `keyInsights[]` | string[] | Top 5 important observations |
| `recommendations[]` | string[] | Actionable next steps |
| `urgencyFlags[]` | object[] | Critical parameters needing immediate attention |
| `lifestyle[]` | string[] | Diet/lifestyle suggestions |
| `disclaimer` | string | Medical disclaimer |

---

## Section 5 — UI Display Recommendations

Map the JSON response to your UI like this:

| JSON Field | UI Component |
|---|---|
| `meta.*` | Report metadata header (name, date, facility, doctor) |
| `overallStatus` | Coloured badge: green / yellow / orange / red |
| `summary` | Summary card at the top |
| `findings[]` | Table or card list — colour-code rows by status |
| `abnormalCount` + `criticalCount` | Stats bar below summary |
| `keyInsights[]` | Highlighted insight cards |
| `recommendations[]` | Action list with icons |
| `urgencyFlags[]` | Red alert banner if criticalCount > 0 |
| `lifestyle[]` | Lifestyle tips section at the bottom |
| `disclaimer` | Footer note in small muted text |

### Status Colour Coding

```
NORMAL         → green  (#22c55e)
LOW            → blue   (#3b82f6)
HIGH           → amber  (#f59e0b)
CRITICAL_LOW   → red    (#ef4444)
CRITICAL_HIGH  → red    (#ef4444)
ABNORMAL       → orange (#f97316)
```

---

## Section 6 — Common Failure Modes & Fixes

| Problem | Cause | Fix |
|---|---|---|
| "Error analyzing report" shown | AI returned non-JSON or empty | Use `max_tokens: 4000`, check PDF is valid base64 |
| Empty `findings[]` | PDF is image-only (scanned) | Add note to user: "Scanned PDFs may have reduced accuracy" |
| JSON parse error | AI added markdown fences | Strip ` ```json ` before `JSON.parse()` (already handled in template) |
| Missing test sections | Prompt too short | Ensure full user prompt is sent — do not truncate |
| `reportType: Unknown` | AI can't read PDF | Verify PDF is not password-protected or corrupted |
| Slow response | Large report | Increase timeout, show loading skeleton per section |

---

## Section 7 — Security & Privacy Notes

- **Never log or store** patient PDF data on your server.
- The PDF is sent directly from the browser to Anthropic's API — no server-side storage needed.
- Display the disclaimer (`findings[].disclaimer`) prominently on every result page.
- Add a consent checkbox before upload: *"I confirm this is my own medical report and I understand this is an AI analysis, not a medical diagnosis."*

---