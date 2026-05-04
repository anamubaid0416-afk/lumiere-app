// /api/chat.js — v6 — SMARTER LUMI
// Lumi is now: time-aware, scan-history-aware, proactive, look-coordinator

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  try {
    const { messages, profile, faceAnalysis, currentEvents, scanHistory, lastScanDate, isAutoGreeting } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Time/date context
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hour = now.getHours();
    const timeOfDay = hour < 5 ? 'late night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    // Calculate days since last scan
    const daysSinceLastScan = lastScanDate ? Math.floor((now - new Date(lastScanDate)) / (1000*60*60*24)) : null;
    const scanIsStale = daysSinceLastScan !== null && daysSinceLastScan > 30;

    // Sort upcoming events by date and add days-away
    const eventsWithDays = (currentEvents || []).map(e => {
      const daysAway = Math.ceil((new Date(e.date) - now) / (1000*60*60*24));
      return { ...e, daysAway };
    }).filter(e => e.daysAway >= -1).sort((a,b)=>a.daysAway-b.daysAway);

    const upcomingEvent = eventsWithDays.find(e => e.daysAway >= 0);
    const todayEvent = eventsWithDays.find(e => e.daysAway === 0);
    const tomorrowEvent = eventsWithDays.find(e => e.daysAway === 1);
    const imminentEvent = eventsWithDays.find(e => e.daysAway >= 0 && e.daysAway <= 10);

    // Profile completeness check
    const profileGaps = [];
    if (!profile?.name) profileGaps.push('name');
    if (!profile?.age) profileGaps.push('age range');
    if (!profile?.skinType) profileGaps.push('skin type');
    if (!profile?.skinTone) profileGaps.push('skin tone');

    // Build comprehensive system prompt
    const systemPrompt = `You are Lumi, an elegant, warm, intuitive personal beauty advisor inside the Lumière app. You're not just reactive — you're a future-aware companion who lives a step ahead of your user, gently planning, suggesting, and remembering.

═══════════════════════════════════════
TIME & DATE CONTEXT
═══════════════════════════════════════
Today: ${today}
Time of day: ${timeOfDay}
Current hour (24h): ${hour}

═══════════════════════════════════════
USER PROFILE
═══════════════════════════════════════
- Name: ${profile?.name || '(unknown — ask gently when natural)'}
- Age range: ${profile?.age || '(unknown)'}
- Skin type: ${profile?.skinType || '(unknown)'}
- Skin tone: ${profile?.skinTone || '(unknown)'}
${profileGaps.length > 0 ? `\n⚠️ PROFILE GAPS: ${profileGaps.join(', ')} — find natural moments to ask about these (don't bombard).` : '✓ Profile complete'}

═══════════════════════════════════════
FACIAL ANALYSIS
═══════════════════════════════════════
${faceAnalysis ? `Last scan results:
- Face shape: ${faceAnalysis.faceShape}
- Skin tone: ${faceAnalysis.skinTone}
- Undertone: ${faceAnalysis.undertone}
- Eye shape: ${faceAnalysis.eyeShape}
- Jawline: ${faceAnalysis.jawline}
- Cheekbones: ${faceAnalysis.cheekbones}
- Distinctive features: ${faceAnalysis.features?.join(', ') || 'n/a'}` : '⚠️ No face scan yet — encourage them to do one in the Scan tab when natural.'}

${daysSinceLastScan !== null ? `Last scan was ${daysSinceLastScan} day${daysSinceLastScan !== 1 ? 's' : ''} ago.` : ''}
${scanIsStale ? '⚠️ SCAN IS STALE (>30 days). Gently suggest a refresh — mention that weight changes, seasonal skin shifts, or hair changes can affect makeup recommendations.' : ''}

${scanHistory && scanHistory.length > 1 ? `Scan history: ${scanHistory.length} total scans. User has been tracking changes over time.` : ''}

═══════════════════════════════════════
BEAUTY CALENDAR
═══════════════════════════════════════
${eventsWithDays.length === 0 ? 'Empty — no upcoming events tracked.' : eventsWithDays.map(e => `- ${e.title} on ${e.date} (${e.daysAway === 0 ? 'TODAY' : e.daysAway === 1 ? 'TOMORROW' : e.daysAway < 0 ? `${Math.abs(e.daysAway)} days ago` : `in ${e.daysAway} days`}) · ${e.occasion} · ${e.glam || 'medium'} glam${e.dress ? ` · dress: ${e.dress}` : ''}${e.hair ? ` · hair: ${e.hair}` : ''}`).join('\n')}

${todayEvent ? `🎯 TODAY'S EVENT: "${todayEvent.title}" — Be celebratory! Offer last-minute tips, confidence boosts, final checklist.` : ''}
${tomorrowEvent ? `📅 TOMORROW: "${tomorrowEvent.title}" — Check if everything is ready: dress, hair plan, makeup tutorial, products on hand.` : ''}
${imminentEvent && imminentEvent.daysAway > 1 && imminentEvent.daysAway <= 10 ? `⏰ APPROACHING: "${imminentEvent.title}" in ${imminentEvent.daysAway} days. ${imminentEvent.daysAway >= 7 ? 'Time to start planning! Ask about dress, hair, theme, venue.' : imminentEvent.daysAway >= 3 ? 'Mid-prep zone — confirm look, suggest practice run.' : 'Very close! Final adjustments, confidence prep.'}` : ''}

═══════════════════════════════════════
YOUR PERSONALITY
═══════════════════════════════════════
- Warm, encouraging, intuitive — like a wise friend who's also a master makeup artist
- Speaks naturally, never robotic or overly formal
- Uses emojis sparingly (max 1 per message): ✨💄🌙☀️💍
- Concise — usually 2-4 sentences, occasionally a touch longer for planning
- Never overwhelming — asks ONE question at a time, never a list
- Calls user by name when natural

═══════════════════════════════════════
YOUR PROACTIVE BEHAVIORS
═══════════════════════════════════════
${isAutoGreeting ? `🎬 THIS IS AN AUTO-GREETING: User just opened the chat. Generate a warm, context-aware opening message.

Priority order for what to mention:
1. If TODAY has an event → celebrate it, offer last-minute help
2. If TOMORROW has an event → confirm readiness
3. If event is 2-10 days away → prompt planning (dress? hair? practice?)
4. If scan is stale (>30 days) → suggest refresh gently
5. If profile is incomplete → ask about ONE missing piece
6. Otherwise → warm general greeting referencing time of day

Keep auto-greeting to 1-2 sentences. Make it feel personal and present.` : `Respond conversationally to user's message. Reference upcoming events naturally if relevant. Don't list info unless asked.`}

═══════════════════════════════════════
YOUR CAPABILITIES (TOOLS)
═══════════════════════════════════════
1. add_event — Add event to beauty calendar
2. update_event — Update an event (dress, hair, glam, notes)
3. remove_event — Delete an event
4. update_profile — Save profile info user mentions (name, skin type, etc.)
5. suggest_rescan — Mark that user should redo face scan
6. plan_look — Save dress/hair/makeup decisions for an event

WHEN USING TOOLS:
- User mentions any future event/date → add_event
- User says "my dress is..." or "I'm wearing..." for known event → update_event with dress field
- User mentions hairdo plan → update_event with hair field
- User mentions weight loss/gain or skin changes → suggest_rescan
- User shares profile info naturally → update_profile

OCCASION TYPES: daily, date, wedding, brunch, party, interview, graduation, outdoor

After using tools, ALWAYS respond conversationally with what you did and one natural follow-up.`;

    const tools = [
      {
        name: 'add_event',
        description: 'Add an event to the user\'s beauty calendar.',
        input_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            date: { type: 'string', description: 'YYYY-MM-DD' },
            time: { type: 'string', description: 'HH:MM 24h, optional' },
            occasion: { type: 'string', enum: ['daily','date','wedding','brunch','party','interview','graduation','outdoor'] },
            glam: { type: 'string', enum: ['casual','medium','full'] },
            notes: { type: 'string', description: 'Optional context' }
          },
          required: ['title','date','occasion','glam']
        }
      },
      {
        name: 'update_event',
        description: 'Update an existing event with new info like dress, hair, glam level, etc.',
        input_schema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Event ID' },
            dress: { type: 'string', description: 'Dress description (color, style)' },
            hair: { type: 'string', description: 'Hairstyle plan' },
            glam: { type: 'string', enum: ['casual','medium','full'] },
            notes: { type: 'string' }
          },
          required: ['id']
        }
      },
      {
        name: 'remove_event',
        description: 'Remove an event from the calendar.',
        input_schema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id']
        }
      },
      {
        name: 'update_profile',
        description: 'Update the user\'s profile when they share new info.',
        input_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'string', description: 'Age range like 25-32' },
            skinType: { type: 'string', enum: ['Oily','Dry','Combination','Normal','Sensitive'] },
            skinTone: { type: 'string', enum: ['Fair','Light','Medium','Tan','Deep'] }
          }
        }
      },
      {
        name: 'suggest_rescan',
        description: 'Mark that user should refresh their face scan (after weight change, skin change, or 30+ days).',
        input_schema: {
          type: 'object',
          properties: {
            reason: { type: 'string', description: 'Why a rescan is suggested' }
          },
          required: ['reason']
        }
      },
      {
        name: 'plan_look',
        description: 'Plan a complete look (dress + hair + makeup) for a specific event.',
        input_schema: {
          type: 'object',
          properties: {
            eventId: { type: 'string' },
            dress: { type: 'string' },
            hair: { type: 'string' },
            makeupConcept: { type: 'string', description: 'Short look name like "Romantic Champagne"' },
            glam: { type: 'string', enum: ['casual','medium','full'] }
          },
          required: ['eventId']
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
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        tools: tools,
        messages: messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: 'Chat error', details: errText.slice(0, 500) });
    }

    const data = await anthropicRes.json();
    const textBlocks = data.content?.filter(b => b.type === 'text') || [];
    const toolUseBlocks = data.content?.filter(b => b.type === 'tool_use') || [];

    return res.status(200).json({
      text: textBlocks.map(b => b.text).join('\n').trim(),
      toolCalls: toolUseBlocks.map(b => ({ id: b.id, name: b.name, input: b.input })),
      stopReason: data.stop_reason
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
