'use strict';
function build(statusCode, contentType, data) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  };
}
var HTML = `<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><title>FC诊断v2</title>
<style>body{font-family:"PingFang SC",sans-serif;background:#07070f;color:#e8e8f0;padding:40px;max-width:600px;margin:0 auto}.card{background:rgba(12,12,25,0.75);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin:12px 0}.btn{background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:15px;cursor:pointer;width:100%;margin-top:8px}.btn:disabled{opacity:0.35}.out{background:rgba(8,8,18,0.9);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-top:12px;min-height:40px;white-space:pre-wrap;font-size:14px}.green{color:#2dd4bf}.red{color:#fb7185}</style></head>
<body><h2>FC诊断v2 · 加了 Content-Disposition: inline</h2>
<div class="card"><p><b>页面加载:</b> <span class="green">GET通了 ✅</span></p></div>
<div class="card"><p style="font-weight:600;margin-bottom:8px">测试POST</p><button class="btn" id="btn" onclick="test()">发POST</button><div class="out" id="out">等待……</div></div>
<div class="card" style="background:rgba(167,139,250,0.06)"><p style="font-size:13px;color:#9ca3af">当前URL: <code id="u"></code></p></div>
<script>document.getElementById("u").textContent=location.href;
async function test(){var btn=document.getElementById("btn"),out=document.getElementById("out"),start=Date.now();btn.disabled=true;btn.textContent="发送中…";out.textContent="请求中…";
try{var r=await fetch(location.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({test:1})});var t=((Date.now()-start)/1000).toFixed(1);var text=await r.text();out.innerHTML='<span class="green">POST ✅ HTTP '+r.status+' · '+t+'s</span><br>'+text.substring(0,500)}catch(e){out.innerHTML='<span class="red">POST ❌ '+e.message+'</span>'}
btn.disabled=false;btn.textContent="再测";}
</script></body></html>`;
exports.handler = async function(event, context, callback) {
  try {
    var str = ''; if (Buffer.isBuffer(event)) str = event.toString('utf-8'); else if (typeof event === 'string') str = event; else str = JSON.stringify(event);
    var raw = JSON.parse(str);
    var method = (raw.requestContext && raw.requestContext.http && raw.requestContext.http.method) || 'GET';
    if (method === 'OPTIONS') { callback(null, build(204, 'text/plain', '')); return; }
    if (method === 'GET') { callback(null, build(200, 'text/html; charset=utf-8', HTML)); return; }
    callback(null, build(200, 'text/plain; charset=utf-8', 'POST通了! body=' + ((raw.body||'空').substring(0,100))));
  } catch (e) { callback(null, build(500, 'text/plain', '异常: '+e.message)); }
};
