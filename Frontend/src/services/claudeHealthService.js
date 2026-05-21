/**
 * Claude AI Health Report Analysis Service
 * Calls Anthropic Claude directly from the browser.
 * For production, replace with a backend proxy endpoint.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are an expert medical report analyzer. When given a health/lab report (as an image or PDF), extract and return a single, strictly valid JSON object — no markdown, no explanation, just raw JSON.

The JSON must match this exact schema:
{
  "reportType": "string",
  "detectedDate": "string",
  "patientName": "string or null",
  "overallScore": number (0–100),
  "scoreLevel": "good" | "caution" | "risk",
  "overallLabel": "string",
  "overallSummary": "2-sentence summary",
  "parameters": [
    {
      "name": "string",
      "value": "string",
      "referenceRange": "string",
      "status": "normal" | "high" | "low" | "caution",
      "category": "string"
    }
  ],
  "risks": [
    {
      "title": "string",
      "description": "string",
      "level": "high" | "medium" | "low",
      "relatedParameter": "string"
    }
  ],
  "recommendations": [
    {
      "text": "string",
      "priority": "high" | "medium" | "low",
      "type": "diet" | "test" | "medication" | "lifestyle" | "specialist" | "other"
    }
  ]
}

Rules:
- overallScore: 0 = worst health, 100 = perfect health
- Sort risks: high first, then medium, then low
- Sort recommendations: high priority first
- If a field cannot be determined, use null for strings or empty array [] for arrays
- Return ONLY the JSON object, no other text`;

/**
 * Analyze a health report file using Claude AI.
 * @param {string} base64Data - Base64-encoded file content (no data URL prefix)
 * @param {string} mediaType - MIME type: "application/pdf" | "image/jpeg" | "image/png" | "image/webp"
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<object>} Parsed analysis result
 */
export async function analyzeHealthReport(base64Data, mediaType, apiKey) {
  const isPdf = mediaType === 'application/pdf';

  // Build the content block based on file type
  const contentBlock = isPdf
    ? {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      }
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      };

  const body = {
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          contentBlock,
          {
            type: 'text',
            text: 'Analyze this health report and return the structured JSON as instructed.',
          },
        ],
      },
    ],
  };

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text || '';

  // Strip possible markdown code fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}
