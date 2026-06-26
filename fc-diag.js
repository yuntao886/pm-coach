'use strict';

const https = require('https');

const API_KEY = 'sk-ws-H.RPPMMLP.CLts.MEUCIAhjyUzh3NiGKcgeaDzlenO4SypPEP0aCjWsOVh40UAFAiEA_9Oe38OS4jWXr1e760LZku-JTFgu81MrQ9zFlzd8Hx4';

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

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PM面试教练</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#07070f;--card:rgba(12,12,25,0.75);--pri:#a78bfa;--pri2:#818cf8;--text:#e8e8f0;--sub:#9ca3af;--dim:#6b7280;--green:#2dd4bf;--amber:#fbbf24;--red:#fb7185}
body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--text);height:100vh;overflow:hidden}
#bg{position:fixed;top:0;left:0;z-index:0;pointer-events:none}
.wrap{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column}
/* 页面 */
.page{display:none;flex-direction:column;align-items:center;height:100%;overflow-y:auto;padding:24px}
.page.on{display:flex}
.page.center{justify-content:center}
/* 卡片 */
.card{background:var(--card);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px;transition:all .25s cubic-bezier(0.22,1,0.36,1);width:100%;max-width:460px}
.card.click{cursor:pointer}
.card.click:hover{border-color:rgba(167,139,250,0.25);transform:translateY(-2px);box-shadow:0 8px 32px rgba(167,139,250,0.1)}
/* 按钮 */
.btn{display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:15px;font-weight:600;border-radius:12px;padding:12px 24px;transition:all .2s;width:100%;height:50px}
.btn-pri{background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff}
.btn-pri:hover{box-shadow:0 0 24px rgba(167,139,250,0.3)}
.btn-pri:disabled{opacity:0.35;pointer-events:none}
.btn-sec{background:transparent;color:var(--pri);border:1px solid rgba(167,139,250,0.25);height:46px}
.btn-sec:hover{background:rgba(167,139,250,0.06)}
/* 输入 */
.inp{width:100%;background:rgba(10,10,20,0.9);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px 16px;color:var(--text);font-size:15px;line-height:1.6;outline:none;resize:none}
.inp:focus{border-color:rgba(167,139,250,0.4);box-shadow:inset 0 0 20px rgba(167,139,250,0.06)}
/* 光球 */
.orb{width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(196,181,253,0.5),rgba(167,139,250,0.2) 40%,transparent 70%);animation:ob 4s ease-in-out infinite;filter:blur(2px)}
.orb.s{width:100px;height:100px}
@keyframes ob{0%,100%{transform:scale(.92)}50%{transform:scale(1.05)}}
/* 加载 */
.spin{width:48px;height:48px;border-radius:50%;border:3px solid transparent;border-top-color:var(--pri);border-right-color:var(--pri2);animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
/* 聊天 */
.chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.msg-ai{display:flex;gap:8px;max-width:85%;animation:sl .3s}
.msg-ai-b{background:rgba(18,18,32,0.85);border-left:3px solid var(--pri);border-radius:14px;border-top-left-radius:6px;padding:12px 16px;font-size:14px;line-height:1.7;white-space:pre-wrap}
.msg-ai-a{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--pri),var(--pri2));display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px}
@keyframes sl{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
/* 顶栏底栏 */
.bar{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(12,12,25,0.9);backdrop-filter:blur(20px);flex-shrink:0}
.bar.top{border-bottom:1px solid rgba(255,255,255,0.04)}
.bar.bot{border-top:1px solid rgba(255,255,255,0.04);gap:8px}
/* 标签 */
.tag{display:inline-flex;padding:4px 10px;border-radius:6px;font-size:12px}
.tag.p{background:rgba(167,139,250,0.15);color:#c4b5fd}
.tag.b{background:rgba(129,140,248,0.15);color:#a5b4fc}
/* 标签选择 */
.tag-opt{padding:8px 14px;border-radius:10px;font-size:13px;background:rgba(20,20,38,0.8);border:1px solid rgba(255,255,255,0.04);color:var(--sub);cursor:pointer;transition:all .2s}
.tag-opt:hover{border-color:rgba(167,139,250,0.2)}
.tag-opt.on{background:linear-gradient(135deg,var(--pri),var(--pri2));color:#fff;border-color:transparent}
/* 弹窗 */
.mask{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100;display:none;align-items:center;justify-content:center}
.mask.on{display:flex}
.modal{background:rgba(16,16,30,0.95);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px 28px;max-width:340px;text-align:center}
/* 滚动条 */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
/* 语音 */
.voice{width:44px;height:44px;border-radius:50%;background:rgba(20,20,35,0.9);border:1px solid rgba(167,139,250,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.voice:active{transform:scale(1.1);box-shadow:0 0 30px rgba(167,139,250,0.4)}
/* 文字 */
.h1{font-size:26px;font-weight:700;text-shadow:0 0 30px rgba(167,139,250,0.3)}
.h2{font-size:18px;font-weight:600}
.sub{font-size:15px;color:var(--sub)}
.dim{font-size:13px;color:var(--dim)}
.back{font-size:14px;color:var(--sub);cursor:pointer}
.gap12{gap:12px}.gap16{gap:16px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}.mt24{margin-top:24px}.mt32{margin-top:32px}
.flex{display:flex}.col{flex-direction:column}.center{align-items:center}.between{justify-content:space-between}.grow{flex:1}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="wrap">

<!-- ========== 首页 ========== -->
<div id="p-home" class="page center on">
  <div class="orb"></div>
  <div class="h1 mt16">PM面试教练</div>
  <div class="sub mt8">不只是模拟，是教练</div>
  <div class="dim mt16">已帮助 <span style="color:var(--pri)" id="hc">128</span> 人完成面试练习</div>
  <div class="flex col gap16 mt32" style="width:100%;max-width:440px;padding:0 24px">
    <div class="card click" onclick="go('p-entry')">
      <div class="flex between center">
        <div><div class="h2">📄 模拟面试</div><div class="sub mt8" id="mock-label">开始你的第一次模拟面试吧</div></div>
        <span style="font-size:18px;color:var(--pri)">→</span>
      </div></div>
    <div class="card" id="formal-card" style="opacity:0.4" onclick="clickFormal()">
      <div class="flex between center">
        <div><div class="h2" id="formal-title">🔒 正式面试</div><div class="sub mt8" id="formal-label">先完成模拟面试解锁</div></div>
      </div></div>
  </div>
</div>

<!-- ========== 入口选择 ========== -->
<div id="p-entry" class="page center">
  <div class="back" style="position:absolute;top:20px;left:24px" onclick="go('p-home')">← 返回</div>
  <div class="orb s"></div>
  <div class="sub mt16">选择你的入场方式</div>
  <div class="flex col gap16 mt24" style="width:100%;max-width:440px;padding:0 24px">
    <div class="card click" onclick="go('p-resume')">
      <div class="flex" style="gap:16px;align-items:flex-start">
        <div style="font-size:36px">📄</div>
        <div><div class="h2">投递简历</div><div class="sub mt8">上传或粘贴简历，AI帮你匹配方向</div>
          <div class="flex gap12 mt8"><span class="tag p">匹配分析</span><span class="tag p">简历优化</span></div></div>
      </div></div>
    <div class="card click" onclick="go('p-intro')">
      <div class="flex" style="gap:16px;align-items:flex-start">
        <div style="font-size:36px">🎤</div>
        <div><div class="h2">自我介绍</div><div class="sub mt8">直接开口说，AI提取画像开始面试</div>
          <div class="flex gap12 mt8"><span class="tag b">语音输入</span><span class="tag b">快速开始</span></div></div>
      </div></div>
  </div>
</div>

<!-- ========== 投简历 ========== -->
<div id="p-resume" class="page" style="padding:24px">
  <div class="flex gap12 center mb16" style="margin-bottom:20px">
    <span class="back" onclick="go('p-entry')">← 返回</span>
    <span class="h2">投递简历</span>
  </div>
  <div style="font-size:17px;font-weight:600;margin-bottom:12px">把你的简历贴在这里</div>
  <textarea id="resume-inp" class="inp" rows="10" style="min-height:180px" placeholder="贴入你的简历内容……"></textarea>
  <div class="dim mt8" style="margin-bottom:8px">AI将分析匹配度，面试完成后给你完整优化简历</div>
  <button class="btn btn-pri" id="resume-btn" onclick="submitResume()">✨ 开始分析</button>
</div>

<!-- ========== 简历结果 ========== -->
<div id="p-result" class="page" style="padding:24px">
  <div class="flex gap12 center" style="margin-bottom:20px">
    <span class="back" onclick="go('p-resume')">← 返回</span>
    <span class="h2">分析结果</span>
  </div>
  <div id="match-out" class="card" style="white-space:pre-wrap;line-height:1.7;margin-bottom:14px"></div>
  <div class="card" style="background:rgba(167,139,250,0.06);text-align:center;margin-bottom:14px">
    <span style="color:var(--pri);font-size:14px">🎯 面试完成后给你完整优化简历</span>
  </div>
  <button class="btn btn-pri" style="margin-bottom:10px" onclick="go('p-intro')">🎤 自我介绍热热身</button>
  <button class="btn btn-sec" onclick="startMock()">⚡ 直接开始面试</button>
</div>

<!-- ========== 自我介绍 ========== -->
<div id="p-intro" class="page center">
  <div class="back" style="position:absolute;top:20px;left:24px" onclick="go('p-entry')">← 返回</div>
  <div style="font-size:17px;font-weight:600">让我们听听你的故事</div>
  <div class="sub mt8">可以说说学校、经历、为什么想做PM</div>
  <button id="voice-btn" class="voice" style="width:80px;height:80px;font-size:32px;margin-top:32px" onclick="toggleVoice()">🎤</button>
  <div class="sub mt12" id="voice-label">点击说话</div>
  <textarea id="intro-inp" class="inp mt16" rows="3" placeholder="或者打字输入……" style="max-width:340px"></textarea>
  <button class="btn btn-pri mt16" style="max-width:340px" onclick="submitIntro()">说完了 →</button>
</div>

<!-- ========== 模拟面试 ========== -->
<div id="p-mock" class="page" style="padding:0;display:none;flex-direction:column;height:100vh">
  <div class="bar top">
    <span class="back" onclick="confirmExit()">← 返回</span>
    <span class="sub" style="font-size:14px">模拟面试</span>
    <span style="font-size:14px;color:var(--red);cursor:pointer" onclick="endInterview()">结束</span>
  </div>
  <div id="chat-box" class="chat grow"></div>
  <div class="bar bot">
    <div class="voice" onclick="toggleVoice()">🎤</div>
    <input id="chat-inp" class="inp grow" style="height:40px;padding:0 12px;font-size:14px" placeholder="输入你的回答……" onkeydown="if(event.key==='Enter')sendMsg()">
    <button class="btn btn-pri" style="width:auto;padding:8px 16px;font-size:13px;height:36px" id="next-btn" disabled>下一题</button>
    <button class="btn btn-sec" style="width:auto;padding:8px 12px;font-size:13px;height:36px" onclick="sendSkip()">跳过</button>
  </div>
</div>

<!-- ========== 正式面试设置 ========== -->
<div id="p-formal" class="page" style="padding:24px">
  <div class="flex gap12 center" style="margin-bottom:20px">
    <span class="back" onclick="go('p-home')">← 返回</span>
    <span class="h2">正式面试 · 设置</span>
  </div>
  <div class="sub" style="margin-bottom:16px">选择你想面试的方向</div>
  <div id="pm-tags" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;max-width:500px"></div>
  <textarea id="jd-inp" class="inp" rows="3" placeholder="贴上目标JD（可选）" style="margin-bottom:24px"></textarea>
  <button class="btn btn-pri" onclick="startFormal()">🚀 开始正式面试</button>
</div>

<!-- ========== Loading ========== -->
<div id="loading" style="position:fixed;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;z-index:50;background:rgba(7,7,15,0.85)">
  <div class="spin" style="width:56px;height:56px;border-width:3px;margin-bottom:20px"></div>
  <div class="sub" id="loading-text">AI正在分析……</div>
</div>

<!-- ========== 弹窗 ========== -->
<div id="mask" class="mask" onclick="closeMask()">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="h2" id="mask-title" style="margin-bottom:8px"></div>
    <div class="sub" id="mask-text" style="margin-bottom:20px"></div>
    <div class="flex gap12" style="justify-content:center">
      <button class="btn btn-pri" style="width:auto;padding:10px 24px" id="mask-ok">退出</button>
      <button class="btn btn-sec" style="width:auto;padding:10px 24px" onclick="closeMask()">继续</button>
    </div>
  </div>
</div>

</div>

<script>
/* ============ 常量 ============ */
// API 通过 FC 后端代理，无 CORS 问题
var PMS=["AI产品","B端","C端","增长","商业化","策略","数据","平台","内容","社交","电商","教育","金融","游戏","硬件"];
var SID=(function(){var s=localStorage.getItem("pc_sid");if(!s){s=(crypto.randomUUID?crypto.randomUUID():Date.now()+"");localStorage.setItem("pc_sid",s)}return s})();

/* ============ 状态 ============ */
var mockCount=parseInt(localStorage.getItem("pc_mc")||"0");
var resumeText=localStorage.getItem("pc_resume")||"";
var matchResult="";
var chatHistory=[];
var inInterview=false;
var selectedPm="";
var maskFn=null;

/* ============ 粒子背景 ============ */
(function(){var c=document.getElementById("bg"),x=c.getContext("2d");var w,h,ps=[];
function rs(){w=c.width=window.innerWidth;h=c.height=window.innerHeight}rs();window.addEventListener("resize",rs);
for(var i=0;i<80;i++)ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:1.5+Math.random()*2.5,a:0.08+Math.random()*0.2,cl:["#a78bfa","#818cf8","#fff"][Math.floor(Math.random()*3)]});
function dr(){x.clearRect(0,0,w,h);for(var i=0;i<ps.length;i++){var p=ps[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle=p.cl;x.globalAlpha=p.a;x.fill()}x.globalAlpha=1;requestAnimationFrame(dr)}dr()})();

/* ============ 页面切换 ============ */
function go(id){
  if(inInterview&&id!=="p-mock"&&id!=="p-home"){showMask("面试还没完成","退出后本次不计入模拟次数。确定退出吗？",function(){inInterview=false;_go(id)});return}
  _go(id);
}
function _go(id){
  var ps=document.getElementsByClassName("page");
  for(var i=0;i<ps.length;i++)ps[i].classList.remove("on");
  var p=document.getElementById(id);if(p)p.classList.add("on");
}

/* ============ 弹窗 ============ */
function showMask(t,txt,fn){document.getElementById("mask-title").textContent=t;document.getElementById("mask-text").textContent=txt;document.getElementById("mask").classList.add("on");maskFn=fn}
function closeMask(){document.getElementById("mask").classList.remove("on");maskFn=null}
document.getElementById("mask-ok").onclick=function(){closeMask();if(maskFn)maskFn()};

/* ============ Loading ============ */
function showLoading(txt){document.getElementById("loading").style.display="flex";document.getElementById("loading-text").textContent=txt||"处理中……"}
function hideLoading(){document.getElementById("loading").style.display="none"}

/* ============ 首页更新 ============ */
function updateHome(){
  var ml=document.getElementById("mock-label");
  ml.textContent=mockCount===0?"开始你的第一次模拟面试吧":"你已经模拟"+mockCount+"次 · 超过"+Math.min(90,mockCount*20)+"%的人";
  var fc=document.getElementById("formal-card"),ft=document.getElementById("formal-title"),fl=document.getElementById("formal-label");
  if(mockCount>0){fc.style.opacity="1";fc.style.cursor="pointer";ft.textContent="⏱ 正式面试";fl.textContent="挑战一下自己吧"}
  else{fc.style.opacity="0.4";fc.style.cursor="default";ft.textContent="🔒 正式面试";fl.textContent="先完成模拟面试解锁"}
}
function clickFormal(){if(mockCount>0)go("p-formal")}
updateHome();
if(resumeText)document.getElementById("resume-inp").value=resumeText;

/* ============ 简历分析 ============ */
async function submitResume(){
  var text=document.getElementById("resume-inp").value.trim();if(!text)return;
  resumeText=text;localStorage.setItem("pc_resume",text);
  var btn=document.getElementById("resume-btn");btn.disabled=true;btn.textContent="⏳ 分析中……";
  showLoading("AI正在分析你的简历……");
  try{
    var r=await fetch(location.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"resume",messages:[{role:"user",content:"[简历] "+text}]})});
    var d=await r.json();
    matchResult=d.text||("⚠️ 解析失败："+JSON.stringify(d,null,2));
    document.getElementById("match-out").textContent=matchResult;
    hideLoading();
    go("p-result");
  }catch(e){
    hideLoading();
    alert("❌ 分析失败：HTTP "+r.status+" | "+e.message);
  }
  btn.disabled=false;btn.textContent="✨ 开始分析";
}

/* ============ 面试 ============ */
async function startMock(){
  var initMsg="[匹配结果] "+matchResult+"\\n[简历原文] "+resumeText;
  await startInterview(initMsg);
}
async function submitIntro(){
  var text=document.getElementById("intro-inp").value.trim();if(!text)return;
  var initMsg=matchResult?("[匹配结果] "+matchResult+"\\n[自我介绍] "+text):("[自我介绍] "+text);
  await startInterview(initMsg);
}
async function startInterview(initMsg){
  go("p-mock");inInterview=true;
  var box=document.getElementById("chat-box");box.innerHTML="";
  chatHistory=[{role:"user",content:initMsg}];
  addAIMsg("","loading");
  try{
    var r=await fetch(location.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"interview",messages:chatHistory})});
    var d=await r.json();
    var text=d.text||"（无响应）";
    var aiDiv=box.lastElementChild.querySelector(".msg-ai-b");
    if(aiDiv){aiDiv.textContent=text;aiDiv.classList.remove("loading")}
    chatHistory.push({role:"assistant",content:text});
    document.getElementById("next-btn").disabled=false;
  }catch(e){
    var aiDiv=box.lastElementChild.querySelector(".msg-ai-b");
    if(aiDiv)aiDiv.textContent="连接失败："+e.message;
  }
}
function addAIMsg(text,loading){
  var box=document.getElementById("chat-box");
  var d=document.createElement("div");d.className="msg-ai";
  var inner=loading?'<div class="msg-ai-a">🤖</div><div class="msg-ai-b loading" style="color:#9ca3af">面试官正在思考…</div>':'<div class="msg-ai-a">🤖</div><div class="msg-ai-b">'+escapeHTML(text)+'</div>';
  d.innerHTML=inner;box.appendChild(d);box.scrollTop=box.scrollHeight;return d;
}
function addUserMsg(text){
  var box=document.getElementById("chat-box");
  var d=document.createElement("div");d.className="msg-ai";d.style.marginLeft="auto";d.style.flexDirection="row-reverse";
  d.innerHTML='<div class="msg-ai-a" style="background:rgba(167,139,250,0.2)">我</div><div class="msg-ai-b" style="background:linear-gradient(135deg,#a78bfa,#818cf8);color:#fff;border-left:none">'+escapeHTML(text)+'</div>';
  box.appendChild(d);box.scrollTop=box.scrollHeight;
}
function escapeHTML(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

async function sendMsg(){
  var inp=document.getElementById("chat-inp");var text=inp.value.trim();if(!text)return;
  addUserMsg(text);chatHistory.push({role:"user",content:text});inp.value="";
  document.getElementById("next-btn").disabled=true;
  addAIMsg("","loading");
  await callInterview();
}
function sendSkip(){
  addUserMsg("[跳过]");chatHistory.push({role:"user",content:"[指令] 跳过"});
  document.getElementById("next-btn").disabled=true;
  addAIMsg("","loading");
  callInterview();
}
function endInterview(){
  addUserMsg("[结束面试]");chatHistory.push({role:"user",content:"[指令] 结束面试"});
  addAIMsg("","loading");
  callInterview();
}
async function callInterview(){
  var box=document.getElementById("chat-box");
  var aiDiv=box.lastElementChild.querySelector(".msg-ai-b");
  try{
    var r=await fetch(location.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"interview",messages:chatHistory})});
    var d=await r.json();
    var text=d.text||"（无响应）";
    if(aiDiv){aiDiv.textContent=text;aiDiv.style.color="#e8e8f0";aiDiv.classList.remove("loading")}
    chatHistory.push({role:"assistant",content:text});
    document.getElementById("next-btn").disabled=false;
  }catch(e){if(aiDiv)aiDiv.textContent="连接失败："+e.message}
}
function confirmExit(){showMask("面试还没完成","退出后本次不计入模拟次数。确定退出吗？",function(){inInterview=false;go("p-home")})}

/* ============ 正式面试标签 ============ */
(function(){var row=document.getElementById("pm-tags");for(var i=0;i<PMS.length;i++){(function(p){var t=document.createElement("span");t.className="tag-opt";t.textContent=p;t.onclick=function(){var all=document.getElementsByClassName("tag-opt");for(var j=0;j<all.length;j++)all[j].classList.remove("on");t.classList.add("on");selectedPm=p};row.appendChild(t)})(PMS[i])}})();
function startFormal(){if(!selectedPm){alert("请选择一个方向");return}alert("正式面试功能开发中，当前版本先测模拟面试")}

/* ============ 语音 ============ */
var rec=null;
function toggleVoice(){
  if(!("webkitSpeechRecognition" in window)){alert("浏览器不支持语音识别");return}
  if(!rec){rec=new webkitSpeechRecognition();rec.continuous=false;rec.interimResults=false;rec.lang="zh-CN";
    rec.onresult=function(e){var t=e.results[0][0].transcript;var ci=document.getElementById("chat-inp");var ii=document.getElementById("intro-inp");if(ci&&ci.offsetParent!==null)ci.value=t;if(ii&&ii.offsetParent!==null)ii.value=t};
    rec.onerror=function(){}}
  if(rec&&rec.continuous){try{rec.stop()}catch(e){}}
  try{rec.start()}catch(e){alert("语音启动失败，请重试")}
}
</script>
</body>
</html>
`;

exports.handler = async function(event, context, callback) {
  try {
    var str = '';
    if (Buffer.isBuffer(event)) {
      str = event.toString('utf-8');
    } else if (typeof event === 'string') {
      str = event;
    } else {
      str = JSON.stringify(event);
    }

    var raw = JSON.parse(str);
    var method = (raw.requestContext && raw.requestContext.http && raw.requestContext.http.method) || 'GET';
    var rp = raw.rawPath || '(无)';

    if (method === 'OPTIONS') {
      callback(null, build(204, 'text/plain', ''));
      return;
    }

    if (method === 'GET') {
      callback(null, build(200, 'text/html; charset=utf-8', HTML));
      return;
    }

    // POST 诊断模式：直接回显收到的内容
    if (method === 'POST') {
      callback(null, build(200, 'application/json', {
        text: '✅ POST通路正常！rawPath=' + rp,
        echo_body: raw.body ? raw.body.substring(0, 200) : '(空)',
        echo_method: method,
      }));
      return;
    }

    callback(null, build(404, 'application/json', { error: 'unknown method: ' + method }));
  } catch (e) {
    callback(null, build(500, 'application/json', { error: 'FC异常: ' + e.message }));
  }
};
