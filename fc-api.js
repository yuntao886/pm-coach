'use strict';

const https = require('https');

// 四个智能体的App ID
const RESUME_APP_ID = '4c72d1a7b9ca42f78428cf8836b355ef';   // 简历分析
const INTERVIEW_APP_ID = '76a51d9b50a0497ab0f5c753fb0d9a3d'; // 面试对话
const REFERENCE_APP_ID = '请替换为参考答案Agent的AppID';        // ← 创建后替换
const OPTIMIZE_APP_ID = '请替换为简历优化Agent的AppID';        // ← 创建后替换
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
      callback(null, build(200, { status: 'ok', info: 'PM面试教练API' }));
      return;
    }

    var bodyStr = raw.body || '{}';
    if (raw.isBase64Encoded) bodyStr = Buffer.from(bodyStr, 'base64').toString('utf-8');
    var body = JSON.parse(bodyStr);

    // 路由：根据type分流到不同智能体
    if (body.type === 'resume') {
      // 简历分析
      var data = await callBailian(RESUME_APP_ID, body.messages);
      callback(null, build(200, { text: extractText(data) }));

    } else if (body.type === 'skip') {
      // 跳过：先拿参考答案，再接下一题
      var refData = await callBailian(REFERENCE_APP_ID, body.messages);
      var refText = extractText(refData);
      // 把参考答案注入对话，再向面试Agent要下一题
      var nextMsg = [{ role: 'assistant', content: refText }, { role: 'user', content: '[指令] 请出下一题（不重复刚才的维度）' }];
      var fullMsgs = (body.messages || []).concat(nextMsg);
      var intData = await callBailian(INTERVIEW_APP_ID, fullMsgs);
      var intText = extractText(intData);
      callback(null, build(200, { text: refText + '\n\n' + intText, session_id: (intData.output && intData.output.session_id) || '' }));

    } else if (body.type === 'optimize') {
      // 简历优化
      var optData = await callBailian(OPTIMIZE_APP_ID, body.messages);
      callback(null, build(200, { text: extractText(optData) }));

    } else {
      // 默认：面试对话
      var intData = await callBailian(INTERVIEW_APP_ID, body.messages);
      callback(null, build(200, { text: extractText(intData), session_id: (intData.output && intData.output.session_id) || '' }));
    }
  } catch (e) {
    callback(null, build(500, { error: e.message }));
  }
};
