'use strict';

const https = require('https');

const RESUME_APP_ID = '4c72d1a7b9ca42f78428cf8836b355ef';
const INTERVIEW_APP_ID = '76a51d9b50a0497ab0f5c753fb0d9a3d';
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
      callback(null, build(200, { status: 'ok', info: 'PM面试教练API，请用POST调用' }));
      return;
    }

    var bodyStr = raw.body || '{}';
    if (raw.isBase64Encoded) bodyStr = Buffer.from(bodyStr, 'base64').toString('utf-8');
    var body = JSON.parse(bodyStr);
    var appId = body.type === 'resume' ? RESUME_APP_ID : INTERVIEW_APP_ID;
    var data = await callBailian(appId, body.messages);
    callback(null, build(200, {
      text: data.output && data.output.text ? data.output.text : '',
      session_id: data.output && data.output.session_id ? data.output.session_id : '',
    }));
  } catch (e) {
    callback(null, build(500, { error: e.message }));
  }
};
