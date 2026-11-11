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

function send(res, message) {
  try { res.write(`data: ${JSON.stringify(message)}\n\n`); }
  catch { clients.delete(res); }
}
function broadcast(message) { for (const res of clients) send(res, message); }
function state() { return {type:'state', username:USERNAME, configured:!!USERNAME, status}; }
function updateStatus(next) { status = next; broadcast(state()); console.log('TikTok durumu:', status); }
function scheduleRetry() {
  if (!USERNAME || retryTimer) return;
  retryTimer=setTimeout(() => { retryTimer=null; void connectTikTok(); }, 25000);
}
async function connectTikTok() {
  if (!USERNAME || connecting) return;
  connecting = true;
  updateStatus('connecting');
  try {
    if (connection) { try { connection.removeAllListeners(); await connection.disconnect(); } catch {} }
    const next = new TikTokLiveConnection(USERNAME, {});
    connection = next;
    next.on(WebcastEvent.CHAT, data => {
      const user=data.user || {};
      const id=String(user.uniqueId || data.uniqueId || '').trim();
      if (!id) return;
      const name=String(user.nickname || user.uniqueId || id).slice(0,28);
      const comment=String(data.comment || '').slice(0,70);
      if (!comment.trim()) return;
      const event={type:'chat',id,name,comment};
      if (!joined.has(id) && joined.size<5000) joined.set(id,event);
      else if (joined.has(id)) joined.set(id,event);
      broadcast(event);
    });
    next.on('disconnected', () => {
      if (connection!==next) return;
      updateStatus('waiting');scheduleRetry();
    });
    next.on('streamEnd', () => {
      if (connection!==next) return;
      updateStatus('waiting');scheduleRetry();
    });
    next.on('error', err => { console.error('TikTok hata:',err?.message||err); });
    await next.connect();
    if (connection===next) updateStatus('connected');
  } catch(err) {
    console.error('TikTok bağlantısı kurulamadı:', err?.message||err);
    updateStatus('waiting');scheduleRetry();
  } finally {connecting=false;}
}

const server=http.createServer((req,res)=>{
  const url=(req.url||'/').split('?')[0];
  if(url==='/events') {
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no','Access-Control-Allow-Origin':'*'});
    send(res,state());
    if(joined.size)send(res,{type:'history',events:[...joined.values()]});
    clients.add(res);
    req.on('close',()=>clients.delete(res));
    return;
  }
  if(url==='/api/health') {
    res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify({ok:true,configured:!!USERNAME,status,participants:joined.size}));
    return;
  }
  if(url==='/' || url==='/index.html') {
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});
    fs.createReadStream(HTML_FILE).pipe(res);
    return;
  }
  res.writeHead(404);res.end('Not found');
});
setInterval(()=>{for(const client of clients){try{client.write(': heartbeat\n\n')}catch{clients.delete(client)}}},20000).unref();
server.listen(PORT,'0.0.0.0',()=>{
 console.log(`Renk İstilası: http://localhost:${PORT}`);
 if(!USERNAME)console.log('Demo modu. Canlıya bağlamak için TIKTOK_USERNAME ortam değişkenini ayarlayın.');
 else void connectTikTok();
});
