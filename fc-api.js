'use strict';

const https = require('https');

// 四智能体App ID
const RESUME_APP_ID = '4c72d1a7b9ca42f78428cf8836b355ef';       // 简历分析
const INTERVIEW_APP_ID = '76a51d9b50a0497ab0f5c753fb0d9a3d';     // 面试对话
const OPTIMIZE_APP_ID = '16885e3cef5b47faa22cfb38bbd95286';       // 简历优化
const REFERENCE_APP_ID = '1ed1a741b1ab4912afd55d7bc16d2fd1';       // 参考答案
const API_KEY = 'sk-ws-H.RPPMMLP.CLts.MEUCIAhjyUzh3NiGKcgeaDzlenO4SypPEP0aCjWsOVh40UAFAiEA_9Oe38OS4jWXr1e760LZku-JTFgu81MrQ9zFlzd8Hx4';

function callBailian(appId, messages) {
  return new Promise(function(resolve, reject) {
    var body = JSON.stringify({ input: { messages: messages || [] }, parameters: {} });
    var options = {
      hostname: 'dashscope.aliyuncs.com',
      path: '/api/v1/apps/' + appId + '/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        try {
          if (res.statusCode !== 200) reject(new Error('Bailian HTTP ' + res.statusCode + ': ' + data));
          else resolve(JSON.parse(data));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function build(statusCode, data) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(data),
  };
}

function extractText(data) {
  return (data.output && data.output.text) ? data.output.text : '';
}

exports.handler = async function(event, context, callback) {
  try {
    var str = '';
    if (Buffer.isBuffer(event)) str = event.toString('utf-8');
    else if (typeof event === 'string') str = event;
    else str = JSON.stringify(event);

    var raw = JSON.parse(str);
    var method = (raw.requestContext && raw.requestContext.http && raw.requestContext.http.method) || 'GET';

    if (method === 'OPTIONS') {
      callback(null, { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' });
      return;
    }

    if (method !== 'POST') {
      callback(null, build(200, { status: 'ok' }));
      return;
    }

    var bodyStr = raw.body || '{}';
    if (raw.isBase64Encoded) bodyStr = Buffer.from(bodyStr, 'base64').toString('utf-8');
    var body = JSON.parse(bodyStr);
    var msgs = body.messages || [];

    // ──── 简历分析 + 同步预优化 ────
    if (body.type === 'resume') {
      var resumeData = await callBailian(RESUME_APP_ID, msgs);
      var resumeText = extractText(resumeData);
      var optData = await callBailian(OPTIMIZE_APP_ID, [
        { role: 'user', content: '请基于以下简历信息，生成一份完整的优化简历（Word文档格式排版），包含个人信息、一句话定位、项目经历、技能标签：\n\n原始简历：\n' + (body.resumeRaw || '') + '\n\n简历分析：\n' + resumeText }
      ]);
      callback(null, build(200, {
        text: resumeText,
        optimized: extractText(optData),
      }));
      return;
    }

    // ──── 面试对话（用户答题后附参考答案） ────
    if (body.type === 'interview') {
      var intData = await callBailian(INTERVIEW_APP_ID, msgs);
      var intText = extractText(intData);

      // 用户已答题时附参考答案（由前端 isUserAnswer 标记控制，不再依赖 AI 回复中的【下一题】文本）
      var isUserAnswer = body.isUserAnswer === true;

      var refText = '';
      if (isUserAnswer) {
        try {
          var refCtx = JSON.stringify(msgs.map(function(m){return m.role+":"+m.content}));
          var refData = await callBailian(REFERENCE_APP_ID, [
            { role: 'user', content: '以下是完整面试对话上下文。请为最近一道已完成的面试题提供详细参考答案（只答这道题，不出下一题）：\n'+refCtx }
          ]);
          refText = extractText(refData);
        } catch (e) { /* 参考答案Agent失败不影响主流程 */ }
      }

      var combined = intText;
      if (refText) combined += '\n\n' + refText;
      callback(null, build(200, {
        text: combined,
        session_id: (intData.output && intData.output.session_id) || '',
      }));
      return;
    }

    // ──── 跳过（附参考答案，同样每题都给） ────
    if (body.type === 'skip') {
      var intData = await callBailian(INTERVIEW_APP_ID, msgs);
      var intText = extractText(intData);

      // 跳过 = 题被跳过但算完成，附参考答案
      var refText = '';
      try {
        var refCtx = JSON.stringify(msgs.map(function(m){return m.role+":"+m.content}));
        var refData = await callBailian(REFERENCE_APP_ID, [
          { role: 'user', content: '以下是完整面试对话上下文。用户跳过了最近一道面试题。请为该被跳过的题提供详细参考答案（只答这道题）：\n'+refCtx }
        ]);
        refText = extractText(refData);
      } catch (e) { /* 参考答案Agent失败不影响主流程 */ }

      var combined = intText;
      if (refText) combined += '\n\n' + refText;
      callback(null, build(200, {
        text: combined,
        session_id: (intData.output && intData.output.session_id) || '',
      }));
      return;
    }

    // ──── 简历优化 ────
    if (body.type === 'optimize') {
      var oData = await callBailian(OPTIMIZE_APP_ID, msgs);
      callback(null, build(200, { text: extractText(oData) }));
      return;
    }

    // ──── 纯参考答案 ────
    if (body.type === 'reference') {
      var rData = await callBailian(REFERENCE_APP_ID, msgs);
      callback(null, build(200, { text: extractText(rData) }));
      return;
    }

    // ──── 埋点 ────
    if (body.type === 'track') {
      var ev = body.event || 'unknown';
      var ts = body.timestamp || Date.now();
      var sid = body.session_id || '-';
      var info = JSON.stringify(body.data || {});
      console.log('[track]', ts, ev, sid, info);
      callback(null, build(200, { status: 'tracked' }));
      return;
    }

    callback(null, build(200, { status: 'unknown_type' }));
  } catch (e) {
    callback(null, build(500, { error: e.message || 'unknown error' }));
  }
};
