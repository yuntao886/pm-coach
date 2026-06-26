'use strict';

function build(statusCode, contentType, data) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  };
}

var HTML = `<!DOCTYPE html>
<html lang="zh"><head><meta charset="UTF-8"><title>FC诊断</title>
<style>body{font-family:"PingFang SC",sans-serif;background:#07070f;color:#e8e8f0;padding:40px;max-width:600px;margin:0 auto}.card{background:rgba(12,12,25,0.75);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;margin:12px 0}.btn{background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:15px;cursor:pointer;width:100%;margin-top:8px}.btn:disabled{opacity:0.35}.out{background:rgba(8,8,18,0.9);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-top:12px;min-height:40px;white-space:pre-wrap;font-size:14px}</style></head>
<body><h2>FC 连通性诊断</h2><p style="color:#9ca3af">测试GET/POST是否都能到FC</p>
<div class="card"><p><b>页面加载:</b> <span style="color:#2dd4bf">GET通了 ✅</span></p><p style="font-size:13px;color:#6b7280">HTML成功返回，说明FC基础功能正常</p></div>
<div class="card"><p style="font-weight:600;margin-bottom:8px">测试: POST请求</p><button class="btn" id="btn" onclick="test()">发POST请求</button><div class="out" id="out">等待……</div></div>
<script>
async function test(){var btn=document.getElementById("btn"),out=document.getElementById("out"),start=Date.now();btn.disabled=true;btn.textContent="发送中…";out.textContent="请求中…";
try{var r=await fetch(location.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({test:1})});var t=((Date.now()-start)/1000).toFixed(1);var text=await r.text();out.innerHTML='<span style="color:#2dd4bf">POST ✅ HTTP '+r.status+' · '+t+'s</span><br>'+text.substring(0,500)}catch(e){out.innerHTML='<span style="color:#fb7185">POST ❌ '+e.message+'</span>'}
btn.disabled=false;btn.textContent="再发一次";}
</script></body></html>`;

exports.handler = async function(event, context, callback) {
  try {
    var str = '';
    if (Buffer.isBuffer(event)) str = event.toString('utf-8');
    else if (typeof event === 'string') str = event;
    else str = JSON.stringify(event);

    var raw = JSON.parse(str);
    var method = (raw.requestContext && raw.requestContext.http && raw.requestContext.http.method) || 'GET';

    if (method === 'OPTIONS') {
      callback(null, build(204, 'text/plain', ''));
      return;
    }

    if (method === 'GET') {
      callback(null, build(200, 'text/html; charset=utf-8', HTML));
      return;
    }

    // POST: 回显
    callback(null, build(200, 'text/plain; charset=utf-8',
      'POST通了! method=' + method +
      ' rawPath=' + (raw.rawPath || '无') +
      ' body=' + ((raw.body || '空').substring(0, 200))
    ));
  } catch (e) {
    callback(null, build(500, 'text/plain', '异常: ' + e.message + ' ' + e.stack));
  }
};
