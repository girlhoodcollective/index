import type { Context, Config } from '@netlify/functions';
import { getStore, getDeployStore } from '@netlify/blobs';

const QUESTIONS: Record<string, string[]> = {
  weekend: ['Nov 14', 'Nov 21', 'Either one'],
  budget: ['~$300 per person', '~$500 per person', 'Either one'],
  drive: ['3 hours or less', 'Up to 6 hours', 'Either one'],
};

function getVotesStore() {
  if (Netlify.context?.deploy.context === 'production') {
    return getStore('girls-trip-votes');
  }
  return getDeployStore('girls-trip-votes');
}

export default async (req: Request, context: Context) => {
  const store = getVotesStore();

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
    if (!name) return jsonResponse({ error: 'Name is required' }, 400);

    for (const [key, options] of Object.entries(QUESTIONS)) {
      if (!options.includes(body[key] as string)) {
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

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const config: Config = { path: '/api/votes' };
