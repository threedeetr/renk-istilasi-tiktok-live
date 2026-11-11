import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const PORT = Number(process.env.PORT || 3000);
const USERNAME = String(process.env.TIKTOK_USERNAME || '').trim().replace(/^@/, '');
const HTML_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.html');
const clients = new Set();
const joined = new Map();
let connection = null;
let retryTimer = null;
let connecting = false;
let status = USERNAME ? 'connecting' : 'unconfigured';
let receivedComments = 0;
let forwardedComments = 0;
let ignoredComments = 0;
let lastChatAt = null;
let lastError = '';

function send(res, message) {
  if (res.destroyed || res.writableEnded) { clients.delete(res); return; }
  try { res.write(`data: ${JSON.stringify(message)}\n\n`); }
  catch { clients.delete(res); }
}
function broadcast(message) { for (const res of clients) send(res, message); }
function state() {
  return { type: 'state', username: USERNAME, configured: !!USERNAME, status };
}
function updateStatus(next) {
  status = next;
  broadcast(state());
  console.log('TikTok durumu:', status);
}
function scheduleRetry() {
  if (!USERNAME || retryTimer) return;
  retryTimer = setTimeout(() => { retryTimer = null; void connectTikTok(); }, 25000);
}
function textValue(...options) {
  for (const option of options) {
    if (option !== undefined && option !== null && String(option).trim())
      return String(option).trim();
  }
  return '';
}
function onChat(data) {
  receivedComments += 1;
  lastChatAt = new Date().toISOString();
  const user = data?.user || data?.author || {};
  const comment = textValue(data?.comment, data?.content).slice(0, 70);
  const id = textValue(user.uniqueId, data?.uniqueId, user.userId, data?.userId, user.secUid, data?.secUid, user.id);
  const name = textValue(user.nickname, user.uniqueId, data?.uniqueId, id).slice(0, 28);
  if (!comment || !id) {
    ignoredComments += 1;
    console.warn('TikTok yorum atlandı:', !comment ? 'boş yorum' : 'kullanıcı kimliği yok',
      'alanlar:', Object.keys(data || {}).join(','), 'user alanları:', Object.keys(user).join(','));
    return;
  }
  const event = { type: 'chat', id, name, comment };
  // Aynı kullanıcı tekrar yorum yaparsa topu çoğaltma; yalnızca yorumunu güncelle.
  if (joined.has(id) || joined.size < 5000) joined.set(id, event);
  forwardedComments += 1;
  broadcast(event);
  console.log(`TikTok yorum #${receivedComments}: @${id} / oyun ekranı: ${clients.size} / toplam kişi: ${joined.size}`);
}
async function connectTikTok() {
  if (!USERNAME || connecting) return;
  connecting = true;
  updateStatus('connecting');
  try {
    if (connection) {
      try { connection.removeAllListeners(); await connection.disconnect(); } catch {}
    }
    const next = new TikTokLiveConnection(USERNAME, {});
    connection = next;
    next.on(WebcastEvent.CHAT, onChat);
    next.on('disconnected', () => {
      if (connection !== next) return;
      updateStatus('waiting'); scheduleRetry();
    });
    next.on('streamEnd', () => {
      if (connection !== next) return;
      updateStatus('waiting'); scheduleRetry();
    });
    next.on('error', err => {
      lastError = String(err?.message || err).slice(0, 160);
      console.error('TikTok hata:', lastError);
    });
    await next.connect();
    if (connection === next) { lastError = ''; updateStatus('connected'); }
  } catch (err) {
    lastError = String(err?.message || err).slice(0, 160);
    console.error('TikTok bağlantısı kurulamadı:', lastError);
    updateStatus('waiting'); scheduleRetry();
  } finally { connecting = false; }
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', 'Access-Control-Allow-Origin': '*'
    });
    clients.add(res);
    send(res, state());
    if (joined.size) send(res, { type: 'history', events: [...joined.values()] });
    console.log('Oyun ekranı SSE bağlandı. Açık ekran:', clients.size);
    // Yanıtın kapanmasını izle; isteğin bitmesi SSE bağlantısının bittiği anlamına gelmez.
    res.on('close', () => {
      clients.delete(res);
      console.log('Oyun ekranı SSE ayrıldı. Açık ekran:', clients.size);
    });
    return;
  }
  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({
      ok: true, configured: !!USERNAME, status, participants: joined.size,
      commentsReceived: receivedComments, commentsForwarded: forwardedComments,
      commentsIgnored: ignoredComments, connectedScreens: clients.size,
      lastChatAt, lastError
    }));
    return;
  }
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    fs.createReadStream(HTML_FILE).pipe(res);
    return;
  }
  res.writeHead(404); res.end('Not found');
});
setInterval(() => {
  for (const client of clients) {
    if (client.destroyed) { clients.delete(client); continue; }
    try { client.write(': heartbeat\n\n'); } catch { clients.delete(client); }
  }
}, 20000).unref();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Renk İstilası: http://localhost:${PORT}`);
  console.log('TikTok yayın hesabı:', USERNAME ? '@' + USERNAME : '(ayarlanmadı)');
  if (!USERNAME) console.log('Demo modu. TIKTOK_USERNAME ayarlanmadı.');
  else void connectTikTok();
});
