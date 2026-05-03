export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { images, occasion, glam, faceDNA } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "No images received" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key is missing in Vercel environment variables" });
    }

    const systemPrompt = `
You are Lumière Face DNA Engine.

Analyze the uploaded 5 facial angles as a structured beauty analysis, not generic compliments.

Rules:
- If any image is blurry, poorly lit, cropped, or missing facial visibility, state that accuracy is limited.
- Do not claim medical, dermatological, ethnicity, or exact age certainty.
- Do not identify the person.
- Use cautious language: appears, suggests, likely, best estimate.
- Return JSON only. No markdown. No extra explanation.

Analyze:
1. Face shape
2. Facial orientation and balance
3. Eye structure
4. Brow balance
5. Lip structure
6. Skin tone depth and undertone estimate
7. Best placement map
8. Palette family
9. Four outcomes:
   - Natural Enhancement Look
   - Occasion Optimized Look
   - Feature Highlight Look
   - Future Trend Look

Return exactly this JSON structure:

{
  "lookName": "",
  "faceDNA": {
    "scanQuality": "",
    "faceShape": {"value": "", "confidence": "", "reason": ""},
    "orientation": {"front": "", "left": "", "right": "", "up": "", "down": ""},
    "eyeStructure": {"value": "", "makeupImplication": ""},
    "browStructure": {"value": "", "makeupImplication": ""},
    "lipStructure": {"value": "", "makeupImplication": ""},
    "skinTone": {"depth": "", "undertone": "", "confidence": ""},
    "placementMap": {
      "contour": "",
      "blush": "",
      "highlight": "",
      "eyeshadow": "",
      "brows": "",
      "lips": ""
    },
    "paletteFamily": ["", "", "", "", ""]
  },
  "fourOutcomes": {
    "naturalEnhancement": "",
    "occasionOptimized": "",
    "featureHighlight": "",
    "futureTrend": ""
  },
  "tutorial": {
    "step1": {"title": "Skin Prep", "instruction": ""},
    "step2": {"title": "Foundation", "instruction": ""},
    "step3": {"title": "Contour", "instruction": ""},
    "step4": {"title": "Blush", "instruction": ""},
    "step5": {"title": "Eye Makeup", "instruction": ""},
    "step6": {"title": "Brows", "instruction": ""},
    "step7": {"title": "Lips", "instruction": ""},
    "step8": {"title": "Setting", "instruction": ""}
  }
}
`;

    const imageBlocks = images.map((img) => {
      const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: match ? match[1] : "image/jpeg",
          data: match ? match[2] : img,
        },
      };
    });

    const userText = `
Occasion: ${occasion || "General"}
Glam level: ${glam || "medium"}

Frontend Face DNA context:
${JSON.stringify(faceDNA || {}, null, 2)}

Analyze all uploaded facial angles together and create a precise structured Face DNA makeup recommendation.
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
        max_tokens: 4000,
        temperature: 0.4,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              ...imageBlocks,
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Anthropic API request failed",
      });
    }

    const text = data?.content?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.error("Raw AI response:", text);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(500).json({
          error: "AI returned invalid JSON",
          rawResponse: text,
        });
      }
    }

    console.log("Lumière Face DNA parsed response:");
    console.log(JSON.stringify(parsed, null, 2));

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Analyze API error:", error);
    return res.status(500).json({
      error: error.message || "Server error in analyze API",
    });
  }
}
