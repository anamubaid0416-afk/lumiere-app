// /api/analyze.js
// Vercel serverless function — runs on the server, NOT in the browser.
// Your API key stays SECRET because it lives in Vercel environment variables.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from Vercel environment (secure!)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Set ANTHROPIC_API_KEY in Vercel.' });
  }

  try {
    const { images, occasion, glam } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const imageBlocks = images.map((dataUrl) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: dataUrl.split(',')[1],
      },
    }));

    const prompt = `You are a world-class professional makeup artist with 20 years of experience. You have been given ${images.length} photo(s) of the same person's face from different angles. Use ALL photos to perform a complete 360° facial analysis — face shape, profile, jawline, cheekbone projection, forehead proportions, nose shape, lip shape, eye shape, and skin tone in different lights.

Occasion: "${occasion || 'General'}"
Glam intensity: "${glam || 'medium'}"

Reply ONLY in valid JSON, no markdown, no extra text:
{"faceShape":"oval|round|square|heart|diamond|oblong","skinTone":"fair|light|medium|tan|deep","undertone":"warm|cool|neutral","eyeShape":"almond|round|hooded|monolid|upturned|downturned","jawline":"soft|defined|angular|rounded","cheekbones":"high|prominent|soft|wide","features":["distinctive feature 1","distinctive feature 2","distinctive feature 3"],"tutorial":{"step1":{"title":"Skin Prep & Primer","instruction":"2+ sentence instruction specific to this exact face and occasion"},"step2":{"title":"Foundation & Concealer","instruction":"2+ sentence instruction"},"step3":{"title":"Contour & Sculpt","instruction":"2+ sentence instruction specific to their face shape from multiple angles"},"step4":{"title":"Blush Placement","instruction":"2+ sentence instruction specific to their cheekbone position"},"step5":{"title":"Eye Makeup","instruction":"2+ sentence instruction specific to their eye shape"},"step6":{"title":"Brow Shaping","instruction":"2+ sentence instruction"},"step7":{"title":"Lips","instruction":"2+ sentence instruction specific to their lip shape"},"step8":{"title":"Setting & Finish","instruction":"2+ sentence instruction"}},"products":[{"name":"Foundation","shade":"specific shade","why":"reason"},{"name":"Contour","shade":"specific shade","why":"reason"},{"name":"Blush","shade":"specific shade","why":"reason"},{"name":"Lip Color","shade":"specific shade","why":"reason"}],"proTip":"One powerful specific tip","lookName":"Creative evocative look name","time":"X mins","level":"Beginner|Intermediate|Advanced"}`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [...imageBlocks, { type: 'text', text: prompt }],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({
        error: 'Anthropic API error',
        details: errText.slice(0, 500),
      });
    }

    const data = await anthropicRes.json();
    const txt = data.content?.find((b) => b.type === 'text')?.text || '';
    const cleaned = txt.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Could not parse AI response', raw: cleaned.slice(0, 500) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
