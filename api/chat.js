// /api/chat.js
// Lumi — agentic conversational beauty advisor
// Handles natural conversation + tool calls (add_event, suggest_look, list_events)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  try {
    const { messages, profile, faceAnalysis, currentEvents } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // System prompt — gives Lumi her personality and knowledge
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `You are Lumi, an elegant, warm, and knowledgeable personal beauty advisor inside the Lumière app. You speak like a trusted friend who happens to be a world-class makeup artist.

Today is ${today}.

USER PROFILE:
- Name: ${profile?.name || 'Beauty'}
- Age range: ${profile?.age || 'unknown'}
- Skin type: ${profile?.skinType || 'unknown'}
- Skin tone: ${profile?.skinTone || 'unknown'}

${faceAnalysis ? `LAST FACE ANALYSIS:
- Face shape: ${faceAnalysis.faceShape}
- Skin tone: ${faceAnalysis.skinTone}
- Undertone: ${faceAnalysis.undertone}
- Eye shape: ${faceAnalysis.eyeShape}
- Jawline: ${faceAnalysis.jawline}
- Cheekbones: ${faceAnalysis.cheekbones}` : 'NOTE: User has not done a face scan yet. Encourage them to do one in the Scan tab when relevant.'}

${currentEvents && currentEvents.length > 0 ? `CURRENT EVENTS IN BEAUTY CALENDAR:
${currentEvents.map(e => `- ${e.title} on ${e.date} (${e.occasion}, ${e.glam || 'medium'} glam)`).join('\n')}` : 'BEAUTY CALENDAR is empty.'}

YOUR PERSONALITY:
- Warm, encouraging, never pushy
- Uses elegant language ("lovely", "darling", "absolutely") sparingly
- Occasionally uses small ✨💄🌙 emojis (max 1 per message)
- Gives specific, actionable advice
- Asks ONE follow-up question when needed
- Keeps responses concise — 2-4 sentences usually

YOUR CAPABILITIES:
1. Beauty advice: makeup, skincare, products, technique
2. Add events to the user's beauty calendar (use add_event tool)
3. Suggest looks for occasions
4. List upcoming events (use list_events tool)
5. Remove events (use remove_event tool)

WHEN TO USE TOOLS:
- User mentions any upcoming event, party, wedding, date, meeting → add_event
- User asks "what's coming up" / "my schedule" → list_events
- User says cancel / remove an event → remove_event

OCCASION TYPES: daily, date, wedding, brunch, party, interview, graduation, outdoor

Always respond conversationally first, even after using tools.`;

    // Define the tools Lumi can use
    const tools = [
      {
        name: 'add_event',
        description: 'Adds an event to the user\'s beauty calendar. Use when user mentions an upcoming event, occasion, or date.',
        input_schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Event name (e.g. "Sara\'s wedding", "Office party")' },
            date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
            time: { type: 'string', description: 'Optional time HH:MM (24h format)' },
            occasion: {
              type: 'string',
              enum: ['daily', 'date', 'wedding', 'brunch', 'party', 'interview', 'graduation', 'outdoor'],
              description: 'Best matching occasion type for theme/look suggestion'
            },
            glam: {
              type: 'string',
              enum: ['casual', 'medium', 'full'],
              description: 'Suggested glam intensity'
            },
            notes: { type: 'string', description: 'Any extra context (optional)' }
          },
          required: ['title', 'date', 'occasion', 'glam']
        }
      },
      {
        name: 'list_events',
        description: 'Lists all upcoming events in user\'s beauty calendar.',
        input_schema: { type: 'object', properties: {} }
      },
      {
        name: 'remove_event',
        description: 'Removes an event from the calendar by its ID.',
        input_schema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Event ID to remove' }
          },
          required: ['id']
        }
      }
    ];

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: tools,
        messages: messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({
        error: 'Chat error',
        details: errText.slice(0, 500),
      });
    }

    const data = await anthropicRes.json();

    // Extract text and tool calls from response
    const textBlocks = data.content?.filter(b => b.type === 'text') || [];
    const toolUseBlocks = data.content?.filter(b => b.type === 'tool_use') || [];

    return res.status(200).json({
      text: textBlocks.map(b => b.text).join('\n').trim(),
      toolCalls: toolUseBlocks.map(b => ({
        id: b.id,
        name: b.name,
        input: b.input
      })),
      stopReason: data.stop_reason,
      raw: data.content
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
