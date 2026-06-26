# PM面试教练 · GLM部署方案

## 架构说明
用智谱GLM-4替代百炼双Agent。一个GLM模型同时处理简历分析和面试对话，通过`[前缀]`路由区分任务。秒悟前端不变，后端FC改造为GLM API代理。

---

## 后端改造（FC新增GLM转发）

### GLM API信息
- 地址：POST https://open.bigmodel.cn/api/paas/v4/chat/completions
- 认证：Header `Authorization: Bearer 你的GLM_API_KEY`
- 模型：glm-4-flash（简历匹配秒出）/ glm-4-air（面试深度对话）

### FC新代码（替换fc-api.js）

```javascript
'use strict';
const https = require('https');

const GLM_API_KEY = '你的GLM_API_KEY';
const GLM_RESUME_MODEL = 'glm-4-flash';   // 简历分析，很快
const GLM_INTERVIEW_MODEL = 'glm-4-air';   // 面试对话，兼顾速度和质量

function callGLM(model, messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model, messages, temperature: 0.7 });
    const options = {
      hostname: 'open.bigmodel.cn',
      path: '/api/paas/v4/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GLM_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) reject(new Error('GLM HTTP ' + res.statusCode + ': ' + data));
          else {
            const j = JSON.parse(data);
            resolve({ text: j.choices[0].message.content, session_id: j.id });
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event, context, callback) => {
  try {
    let str = Buffer.isBuffer(event) ? event.toString('utf-8') : (typeof event === 'string' ? event : JSON.stringify(event));
    const raw = JSON.parse(str);
    const method = (raw.requestContext && raw.requestContext.http && raw.requestContext.http.method) || 'GET';

    if (method === 'OPTIONS') {
      callback(null, { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' });
      return;
    }

    if (method !== 'POST') {
      callback(null, { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ status: 'ok', info: 'PM面试教练GLM API' }) });
      return;
    }

    let bodyStr = raw.body || '{}';
    if (raw.isBase64Encoded) bodyStr = Buffer.from(bodyStr, 'base64').toString('utf-8');
    const body = JSON.parse(bodyStr);
    const model = body.type === 'resume' ? GLM_RESUME_MODEL : GLM_INTERVIEW_MODEL;

    // 注入系统提示词
    const systemMsg = body.type === 'resume' ? SYSTEM_RESUME : SYSTEM_INTERVIEW;
    const messages = [{ role: 'system', content: systemMsg }, ...body.messages];

    const data = await callGLM(model, messages);
    callback(null, { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) });
  } catch (e) {
    callback(null, { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: e.message }) });
  }
};
```

> 部署时把 SYSTEM_RESUME 和 SYSTEM_INTERVIEW 两个变量替换为下面的系统提示词文本（去掉换行特殊处理）。
