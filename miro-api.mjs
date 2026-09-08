import 'dotenv/config';

const TOKEN = process.env.MIRO_API_TOKEN;
const BOARD_ID = process.env.MIRO_BOARD_ID;
const BASE = `https://api.miro.com/v2/boards/${BOARD_ID}`;

if (!TOKEN || !BOARD_ID) {
  console.error('Error: MIRO_API_TOKEN and MIRO_BOARD_ID must be set in .env');
  process.exit(1);
}

// --- Shared fetch helper ---

async function miroFetch(method, path, body = null) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  let resp = await fetch(url, opts);

  // Retry once on rate limit
  if (resp.status === 429) {
    const retryAfter = parseInt(resp.headers.get('Retry-After') || '5', 10);
    console.error(`Rate limited. Waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    resp = await fetch(url, opts);
  }

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`API error ${resp.status}: ${text}`);
    process.exit(1);
  }

  const contentType = resp.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return resp.json();
  }
  return resp.text();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

// --- Subcommands ---

async function listFrames() {
  const items = [];
  let cursor = null;
  do {
    const qs = new URLSearchParams({ type: 'frame', limit: '50' });
    if (cursor) qs.set('cursor', cursor);
    const data = await miroFetch('GET', `/items?${qs}`);
    for (const item of data.data || []) {
      items.push({
        id: item.id,
        title: item.data?.title || '',
        x: item.position?.x,
        y: item.position?.y,
        width: item.geometry?.width,
        height: item.geometry?.height,
      });
    }
    cursor = data.cursor || null;
  } while (cursor);
  return items;
}

async function listItemsInFrame(frameId, typeFilter) {
  const items = [];
  let cursor = null;
  do {
    const qs = new URLSearchParams({ parent_item_id: frameId, limit: '50' });
    if (typeFilter) qs.set('type', typeFilter);
    if (cursor) qs.set('cursor', cursor);
    const data = await miroFetch('GET', `/items?${qs}`);
    for (const item of data.data || []) {
      items.push({
        id: item.id,
        type: item.type,
        content: item.data?.content ? stripHtml(item.data.content) : (item.data?.title || ''),
        x: item.position?.x,
        y: item.position?.y,
        width: item.geometry?.width,
        height: item.geometry?.height,
        color: item.style?.fillColor || null,
      });
    }
    cursor = data.cursor || null;
  } while (cursor);
  return items;
}

async function getSticky(itemId) {
  const data = await miroFetch('GET', `/sticky_notes/${itemId}`);
  return {
    id: data.id,
    content: stripHtml(data.data?.content || ''),
    color: data.style?.fillColor || null,
    x: data.position?.x,
    y: data.position?.y,
    width: data.geometry?.width,
    height: data.geometry?.height,
  };
}

async function findTextInFrame(frameId, searchText) {
  const items = await listItemsInFrame(frameId, 'text');
  const needle = searchText.toLowerCase();
  const found = items.find(item => item.content.toLowerCase().includes(needle));
  if (!found) {
    console.error(`Text "${searchText}" not found in frame ${frameId}`);
    process.exit(1);
  }
  return found;
}

async function createSticky(frameId, content, opts = {}) {
  const body = {
    data: { content: `<p>${content}</p>`, shape: 'square' },
    position: { x: opts.x || 0, y: opts.y || 0, origin: 'center' },
    geometry: { width: 199 },
    parent: { id: frameId },
  };
  if (opts.color) {
    body.style = { fillColor: opts.color };
  }
  const data = await miroFetch('POST', '/sticky_notes', body);
  return { id: data.id, content, x: body.position.x, y: body.position.y };
}

async function createStickiesBelowLabel(frameId, labelText, questions, color) {
  // Find the label position
  const label = await findTextInFrame(frameId, labelText);

  const stickyWidth = 199;
  const stickyHeight = 228;  // approximate height for square sticky at width 199
  const cols = 2;
  const colSpacing = stickyWidth + 20;    // 20px horizontal gap between stickies
  const rowSpacing = stickyHeight + 20;   // 20px vertical gap between stickies
  // Gap from label center to first sticky center:
  // label half-height + sticky half-height + padding
  const gap = (label.height || 50) / 2 + stickyHeight / 2 + 40;

  const startY = label.y + gap;
  const results = [];

  for (let i = 0; i < questions.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // Left-align columns starting from label.x
    const x = label.x + (col - (cols - 1) / 2) * colSpacing;
    const y = startY + row * rowSpacing;

    const text = typeof questions[i] === 'string' ? questions[i] : (questions[i]?.text || String(questions[i]));
    const result = await createSticky(frameId, text, { x, y, color });
    results.push(result);

    // Small delay to avoid rate limiting
    if (i < questions.length - 1) await sleep(200);
  }

  return results;
}

async function updateStickyColor(itemId, color) {
  const data = await miroFetch('PATCH', `/sticky_notes/${itemId}`, {
    style: { fillColor: color },
  });
  return {
    id: data.id,
    content: stripHtml(data.data?.content || ''),
    color: data.style?.fillColor,
  };
}

async function updateStickiesColor(frameId, itemIds, color) {
  const results = [];
  for (const id of itemIds) {
    const result = await updateStickyColor(id, color);
    results.push(result);
    if (results.length < itemIds.length) await sleep(200);
  }
  return results;
}

async function getItem(itemId) {
  const data = await miroFetch('GET', `/items/${itemId}`);
  return {
    id: data.id,
    type: data.type,
    x: data.position?.x,
    y: data.position?.y,
    width: data.geometry?.width,
    height: data.geometry?.height,
  };
}

async function deleteItem(itemId) {
  await miroFetch('DELETE', `/items/${itemId}`);
  return { id: itemId, deleted: true };
}

async function moveItem(itemId, x, y) {
  const data = await miroFetch('PATCH', `/items/${itemId}`, {
    position: { x, y, origin: 'center' },
  });
  return {
    id: data.id,
    type: data.type,
    x: data.position?.x,
    y: data.position?.y,
  };
}

async function getPositionBesideItem(itemId, side = 'right', gap = 40) {
  const item = await getItem(itemId);
  const w = item.width || 400;
  const h = item.height || 400;

  // doc_format items always report 400×400 via API but render much wider on canvas.
  // Use a minimum effective half-width of 350px (= 700px full width) for docs to prevent overlap.
  const isDoc = item.type === 'doc_format' || item.type === 'document';
  const halfW = isDoc ? Math.max(Math.round(w / 2), 490) : Math.round(w / 2);

  let x, y;
  if (side === 'right') {
    x = Math.round(item.x + halfW + gap + halfW);
    y = Math.round(item.y);
  } else {
    // below
    x = Math.round(item.x);
    y = Math.round(item.y + h / 2 + gap + 150); // 150 = half of typical table height
  }

  return { item_id: itemId, side, x, y, source: { x: item.x, y: item.y, width: w, height: h } };
}

async function resizeFrame(frameId, width, height, posX, posY) {
  const body = { geometry: { width, height } };
  if (posX !== undefined && posY !== undefined) {
    body.position = { x: posX, y: posY, origin: 'center' };
  }
  const data = await miroFetch('PATCH', `/frames/${frameId}`, body);
  return {
    id: data.id,
    title: data.data?.title || '',
    x: data.position?.x,
    y: data.position?.y,
    width: data.geometry?.width,
    height: data.geometry?.height,
  };
}

async function getFrameBottom(frameId) {
  const items = await listItemsInFrame(frameId);
  if (items.length === 0) {
    return {
      frame_id: frameId,
      item_count: 0,
      max_bottom_y: 0,
      suggested_y: 150,
      miro_url: `${process.env.MIRO_BOARD_URL}?moveToWidget=${frameId}`,
    };
  }
  let maxBottom = -Infinity;
  for (const item of items) {
    const rawH = item.height || 0;
    // doc_format always reports 400px height regardless of content; use 600 minimum to avoid overlap
    const isDoc = item.type === 'doc_format' || item.type === 'document';
    const effectiveH = isDoc ? Math.max(rawH, 600) : rawH;
    const bottom = (item.y || 0) + effectiveH / 2;
    if (bottom > maxBottom) maxBottom = bottom;
  }
  return {
    frame_id: frameId,
    item_count: items.length,
    max_bottom_y: Math.round(maxBottom),
    suggested_y: Math.round(maxBottom + 150),
    miro_url: `${process.env.MIRO_BOARD_URL}?moveToWidget=${frameId}`,
  };
}

async function getPositionBelowLabel(frameId, labelText) {
  const label = await findTextInFrame(frameId, labelText);
  const gap = (label.height || 50) / 2 + 250;
  return {
    frame_id: frameId,
    label: label.content,
    x: Math.round(label.x),
    y: Math.round(label.y + gap),
    miro_url: `${process.env.MIRO_BOARD_URL}?moveToWidget=${frameId}`,
  };
}

// --- CLI argument parsing ---

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const positional = [];
  const flags = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      flags[key] = args[i + 1] || '';
      i++;
    } else {
      positional.push(args[i]);
    }
  }
  return { command, positional, flags };
}

// --- Main ---

async function main() {
  const { command, positional, flags } = parseArgs();

  let result;

  switch (command) {
    case 'list-frames':
      result = await listFrames();
      break;

    case 'list-items-in-frame': {
      const frameId = positional[0];
      if (!frameId) { console.error('Usage: list-items-in-frame <frame_id> [--type TYPE]'); process.exit(1); }
      result = await listItemsInFrame(frameId, flags.type || null);
      break;
    }

    case 'get-sticky': {
      const itemId = positional[0];
      if (!itemId) { console.error('Usage: get-sticky <item_id>'); process.exit(1); }
      result = await getSticky(itemId);
      break;
    }

    case 'find-text-in-frame': {
      const frameId = positional[0];
      const text = positional[1];
      if (!frameId || !text) { console.error('Usage: find-text-in-frame <frame_id> "<text>"'); process.exit(1); }
      result = await findTextInFrame(frameId, text);
      break;
    }

    case 'create-sticky': {
      const frameId = positional[0];
      const content = positional[1];
      if (!frameId || !content) { console.error('Usage: create-sticky <frame_id> "<content>" [--x N] [--y N] [--color COLOR]'); process.exit(1); }
      result = await createSticky(frameId, content, {
        x: flags.x ? parseFloat(flags.x) : 0,
        y: flags.y ? parseFloat(flags.y) : 0,
        color: flags.color || null,
      });
      break;
    }

    case 'create-stickies-below-label': {
      const frameId = positional[0];
      const labelText = positional[1];
      const questionsJson = positional[2];
      if (!frameId || !labelText || !questionsJson) {
        console.error('Usage: create-stickies-below-label <frame_id> "<label>" \'<json_array>\'');
        process.exit(1);
      }
      let questions;
      try {
        questions = JSON.parse(questionsJson);
      } catch {
        console.error('Error: third argument must be a valid JSON array of strings');
        process.exit(1);
      }
      const color = flags.color || 'light_yellow';
      result = await createStickiesBelowLabel(frameId, labelText, questions, color);
      break;
    }

    case 'delete-item': {
      const itemId = positional[0];
      if (!itemId) { console.error('Usage: delete-item <item_id>'); process.exit(1); }
      result = await deleteItem(itemId);
      break;
    }

    case 'move-item': {
      const itemId = positional[0];
      if (!itemId || !flags.x || !flags.y) { console.error('Usage: move-item <item_id> --x N --y N'); process.exit(1); }
      result = await moveItem(itemId, parseFloat(flags.x), parseFloat(flags.y));
      break;
    }

    case 'update-sticky-color': {
      const itemId = positional[0];
      const color = positional[1] || flags.color;
      if (!itemId || !color) { console.error('Usage: update-sticky-color <item_id> <color>'); process.exit(1); }
      result = await updateStickyColor(itemId, color);
      break;
    }

    case 'update-stickies-color': {
      const frameId = positional[0];
      const color = positional[1] || flags.color;
      const idsJson = positional[2];
      if (!frameId || !color || !idsJson) {
        console.error('Usage: update-stickies-color <frame_id> <color> \'<json_array_of_ids>\'');
        process.exit(1);
      }
      let ids;
      try { ids = JSON.parse(idsJson); } catch { console.error('Error: third argument must be a valid JSON array of IDs'); process.exit(1); }
      result = await updateStickiesColor(frameId, ids, color);
      break;
    }

    case 'get-position-beside-item': {
      const itemId = positional[0];
      if (!itemId) { console.error('Usage: get-position-beside-item <item_id> [--side right|below] [--gap N]'); process.exit(1); }
      const side = flags.side || 'right';
      const gap = flags.gap ? parseInt(flags.gap) : 40;
      result = await getPositionBesideItem(itemId, side, gap);
      break;
    }

    case 'resize-frame': {
      const frameId = positional[0];
      if (!frameId || !flags.width || !flags.height) { console.error('Usage: resize-frame <frame_id> --width N --height N [--x N --y N]'); process.exit(1); }
      const posX = flags.x !== undefined ? parseFloat(flags.x) : undefined;
      const posY = flags.y !== undefined ? parseFloat(flags.y) : undefined;
      result = await resizeFrame(frameId, parseFloat(flags.width), parseFloat(flags.height), posX, posY);
      break;
    }

    case 'get-frame-bottom': {
      const frameId = positional[0];
      if (!frameId) { console.error('Usage: get-frame-bottom <frame_id>'); process.exit(1); }
      result = await getFrameBottom(frameId);
      break;
    }

    case 'get-position-below-label': {
      const frameId = positional[0];
      const labelText = positional[1];
      if (!frameId || !labelText) {
        console.error('Usage: get-position-below-label <frame_id> "<label>"');
        process.exit(1);
      }
      result = await getPositionBelowLabel(frameId, labelText);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Available commands:');
      console.error('  list-frames');
      console.error('  list-items-in-frame <frame_id> [--type TYPE]');
      console.error('  get-sticky <item_id>');
      console.error('  find-text-in-frame <frame_id> "<text>"');
      console.error('  create-sticky <frame_id> "<content>" [--x N] [--y N] [--color COLOR]');
      console.error('  create-stickies-below-label <frame_id> "<label>" \'<json_array>\' [--color COLOR]');
      console.error('  move-item <item_id> --x N --y N');
      console.error('  update-sticky-color <item_id> <color>');
      console.error('  update-stickies-color <frame_id> <color> \'<json_array_of_ids>\'');
      console.error('  resize-frame <frame_id> --width N --height N');
      console.error('  get-frame-bottom <frame_id>');
      console.error('  get-position-beside-item <item_id> [--side right|below] [--gap N]');
      console.error('  get-position-below-label <frame_id> "<label>"');
      process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
