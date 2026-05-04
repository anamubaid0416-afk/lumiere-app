const DEFAULT_TUTORIAL = {
  step1: { title: "Skin Prep", instruction: "Cleanse, moisturize, and prime according to the visible skin finish and the selected glam level." },
  step2: { title: "Foundation", instruction: "Apply thin layers from the center of the face outward, keeping coverage natural where the skin already appears even." },
  step3: { title: "Contour", instruction: "Use the face shape and side-angle structure to place soft contour under cheekbones, around the hairline, and near the jaw." },
  step4: { title: "Blush", instruction: "Blend blush upward from the cheek area that lifts most naturally in the front angle." },
  step5: { title: "Eye Makeup", instruction: "Shape the eye look around the visible eye structure, adding depth at the outer corner and brightness where it opens the eye." },
  step6: { title: "Brows", instruction: "Brush brows upward, softly fill sparse areas, and keep the brow shape balanced with the eye and forehead proportions." },
  step7: { title: "Lips", instruction: "Define the lip line softly, then apply the chosen lip shade in thin layers for control and symmetry." },
  step8: { title: "Setting", instruction: "Set shine-prone areas lightly and mist the face so the final look stays blended and fresh." },
};

const ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

function normalizeAnalysis(parsed) {
  const faceDNA = parsed?.faceDNA || {};
  const skinTone = faceDNA.skinTone || {};
  const placement = faceDNA.placementMap || {};
  const palette = Array.isArray(faceDNA.paletteFamily) ? faceDNA.paletteFamily : [];

  return {
    ...parsed,
    lookName: parsed?.lookName || "Personalized Lumiere Look",
    faceDNA,
    tutorial: parsed?.tutorial && Object.keys(parsed.tutorial).length ? parsed.tutorial : DEFAULT_TUTORIAL,
    faceShape: parsed?.faceShape || faceDNA.faceShape?.value || "",
    skinTone: parsed?.skinTone || [skinTone.depth, skinTone.undertone].filter(Boolean).join(" ") || "",
    undertone: parsed?.undertone || skinTone.undertone || "",
    eyeShape: parsed?.eyeShape || faceDNA.eyeStructure?.value || "",
    jawline: parsed?.jawline || placement.contour || "",
    cheekbones: parsed?.cheekbones || placement.blush || "",
    features: parsed?.features || [
      faceDNA.eyeStructure?.value && `Eyes: ${faceDNA.eyeStructure.value}`,
      faceDNA.browStructure?.value && `Brows: ${faceDNA.browStructure.value}`,
      faceDNA.lipStructure?.value && `Lips: ${faceDNA.lipStructure.value}`,
    ].filter(Boolean),
    products: parsed?.products || palette.slice(0, 4).map((shade) => ({
      name: "Palette shade",
      shade,
      why: "Selected from the facial analysis palette family.",
    })),
    proTip: parsed?.proTip || parsed?.fourOutcomes?.featureHighlight || placement.highlight || "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  try {
    const { images, occasion, glam, faceDNA } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: "No images received. Please complete the face scan again.",
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "Anthropic API key is missing in Vercel environment variables.",
      });
    }

    const systemPrompt = `
You are Lumière Face DNA Engine.

Analyze the uploaded 5 facial angles as a structured beauty analysis, not generic compliments.

Rules:
- If any image is blurry, poorly lit, cropped, or missing facial visibility, state that accuracy is limited.
- Do not claim medical, dermatological, ethnicity, identity, or exact age certainty.
- Do not identify the person.
- Use cautious language: appears, suggests, likely, best estimate.
- Return JSON only. No markdown. No extra explanation.

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
      const match =
        typeof img === "string"
          ? img.match(/^data:(image\/\w+);base64,(.+)$/)
          : null;

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
        model: ANTHROPIC_MODEL,
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: userText }, ...imageBlocks],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      const anthropicMessage = data?.error?.message || "";
      const isInvalidApiKey =
        response.status === 401 ||
        data?.error?.type === "authentication_error" ||
        /invalid x-api-key/i.test(anthropicMessage);
      const isInvalidModel =
        response.status === 404 ||
        data?.error?.type === "not_found_error" ||
        /model:/i.test(anthropicMessage);

      return res.status(response.status).json({
        error: isInvalidApiKey
          ? "Anthropic API key is invalid. Update ANTHROPIC_API_KEY in Vercel environment variables, then redeploy."
          : isInvalidModel
            ? `Anthropic model is unavailable: ${ANTHROPIC_MODEL}.`
          : anthropicMessage || "Anthropic API request failed",
        details: data,
      });
    }

    const text = (data?.content || [])
      .filter((block) => block?.type === "text" && block.text)
      .map((block) => block.text)
      .join("\n")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.error("Raw AI response:", text);

      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (secondError) {
          return res.status(500).json({
            error: "AI returned invalid JSON",
            rawResponse: text,
          });
        }
      } else {
        return res.status(500).json({
          error: "AI returned invalid JSON",
          rawResponse: text,
        });
      }
    }

    parsed = normalizeAnalysis(parsed);

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
