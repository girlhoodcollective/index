import { getStore } from '@netlify/blobs';

const QUESTIONS = {
  weekend: ['Nov 14', 'Nov 21', 'Either one'],
  budget: ['~$300 per person', '~$500 per person', 'Either one'],
  drive: ['3 hours or less', 'Up to 6 hours', 'Either one'],
};

export default async (req) => {
  const store = getStore('girls-trip-votes');

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
    if (!name) return jsonResponse({ error: 'Name is required' }, 400);

    for (const [key, options] of Object.entries(QUESTIONS)) {
      if (!options.includes(body[key])) {
        return jsonResponse({ error: `Invalid value for ${key}` }, 400);
      }
    }

    const entry = {
      name,
      weekend: body.weekend,
      budget: body.budget,
      drive: body.drive,
      submittedAt: new Date().toISOString(),
    };

    const key = `vote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, entry);

    return jsonResponse({ ok: true });
  }

  if (req.method === 'GET') {
    const { blobs } = await store.list();
    const votes = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })));
    return jsonResponse({ votes: votes.filter(Boolean) });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const config = { path: '/api/votes' };
