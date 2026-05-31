import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join } from 'path';
import type { RequestHandler } from './$types';

// POST /api/codex/flags — upload an SVG flag file into static/flags/.
// Dev-only (Codex gate). Static segment so it beats /api/codex/[entity].
export const POST: RequestHandler = async ({ request }) => {
  if (!dev) return new Response('Not Found', { status: 404 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
    return json({ message: 'No file provided.' }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith('.svg')) {
    return json({ message: 'Only SVG files are supported.' }, { status: 400 });
  }

  const filename = file.name.toLowerCase().replace(/\s+/g, '-');
  const flagsDir = fileURLToPath(new URL('../../../../../static/flags', import.meta.url));

  await mkdir(flagsDir, { recursive: true });
  await writeFile(join(flagsDir, filename), Buffer.from(await file.arrayBuffer()));

  return json({ path: `/flags/${filename}` });
};
