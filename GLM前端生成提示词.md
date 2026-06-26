你是一个顶级前端工程师。请根据以下规格，生成一个完整的单文件HTML应用（HTML+CSS+JS全部内联在一个文件里）。

## 项目：PM面试教练

双Agent架构的产品经理模拟面试工具。用户贴简历→AI分析匹配PM方向→设置题目数→AI逐题出题评分→出总评报告+优化简历。

---

## API对接（核心）

后端地址：https://yuntao-zhzuuwfvwt.cn-chengdu.fcapp.run
所有请求POST，Content-Type: application/json

### 简历分析
```
POST body: {type:"resume", messages:[{role:"user", content:"[简历] 简历原文"}]}
Response: {text:"匹配结果文本", session_id:"xxx"}
```

### 面试对话（发送完整对话历史）
```
POST body: {type:"interview", messages:[{role:"user/assistant", content:"..."}, ...]}
Response: {text:"AI回复文本", session_id:"xxx"}
```

---

## 页面结构（7个页面，用display:none/flex切换）

### p-home 首页
居中大光球动画 + 标题"PM面试教练" + 副标题"不只是模拟，是教练"
3张卡片：📄模拟面试(→p-entry)、📋面试记录(→p-history显示记录条数)、🔒正式面试(模拟1次后解锁)

### p-entry 入口
小光球 + 两张卡片：📄投递简历(→p-resume)、🎤自我介绍(→p-intro)

### p-resume 投简历
textarea贴简历 + "开始分析"按钮 → 调API(type=resume) → 显示loading → 结果跳p-result

### p-result 分析结果
显示AI返回的匹配结果(pre-wrap) + 钩子卡片"🎯面试完成后给你完整优化简历"
两个按钮：⚙️设置面试(→p-setup)、🎤自我介绍(→p-intro)

### p-setup 面试设置
4个圆角方块选题目数3/5/8/10(选中紫渐变高亮) + JD输入框(可选) + "开始面试"按钮

### p-mock 模拟面试（核心，全屏布局）
- 顶栏：返回 | "模拟面试"+题号(如"2/5"动态更新) | 结束按钮
- 聊天区(flex-grow可滚动)：
  - AI消息：左对齐，紫左边框灰色气泡+🤖头像
  - 用户消息：右对齐，紫渐变气泡+"我"头像
  - AI回复打字机效果(逐字出现，30ms/字，闪烁光标)
- 底栏：语音按钮 | 输入框 | 下一题按钮 | 跳过按钮
- 请求中：跳过/下一题/输入框全部disabled
- 结束面试：弹窗确认→发结束指令→等待总评→保存localStorage

### p-history 面试记录
localStorage读取，卡片列表(时间+题数)，点击展开详情。无记录显示空状态提示

---

## 设计规范（严格遵循）

### 颜色
- 主背景 #07070f
- 卡片 rgba(12,12,25,0.75)
- 主色紫 #a78bfa
- 辅色蓝 #818cf8
- 文字 #e8e8f0
- 次要 #9ca3af
- 暗文 #6b7280
- 绿色 #2dd4bf
- 橙色 #fbbf24
- 红色 #fb7185

### 玻璃态效果
backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px

### 动效
- 光球：4秒呼吸缩放 scale(0.92→1.05)
- AI消息：从左滑入300ms
- 对话气泡出现：从下方滑入+淡入300ms，曲线cubic-bezier(0.22,1,0.36,1)
- 按钮hover：上移2px+紫光阴影

### 粒子背景
Canvas全屏，80个半透明粒子（紫蓝白三色），慢速漂浮，碰到边缘反弹

### 按钮
- 主按钮：紫渐变(#a78bfa→#818cf8)，圆角12px，高度50px，宽100%
- 次按钮：透明底+紫边框1px+紫文字，高度46px
- disabled: opacity 0.35, pointer-events none

### 字体
PingFang SC / Microsoft YaHei
h1 26px bold 紫色text-shadow；h2 18px bold；正文15px

### 其他组件
- Loading：全屏半透明遮罩+旋转圆环+提示文字
- 弹窗：半黑遮罩+居中玻璃态+确认取消按钮
- 语音按钮：圆形44px，按住缩放+紫光阴影
- 语音识别：webkitSpeechRecognition，中文字识别，结果填入当前可见输入框
- 滚动条：4px宽，半透明

---

## JavaScript逻辑要点

### 状态变量
- chatHistory: 对话历史数组，每次发面试请求时发送完整数组
- questionTotal: 设定题数(默认5)
- questionIndex: 当前题号，AI每次回复后+1
- busying: 请求进行中时禁止所有交互
- inInterview: 面试中切换页面需弹窗确认
- matchResult: 简历分析结果文本
- resumeText: 简历原文
- mockCount: 完成面试次数(localStorage持久化)

### 前缀约定（发消息时的格式）
- 投简历：`[简历] 简历原文`
- 开始面试初始消息：`[匹配结果] 匹配文本\n[简历原文] 简历文本\n[指令] 本次面试共X道题，请逐题提问`
- 用户回答：原文直发
- 跳过：`[指令] 此题跳过，给参考答案并出下一题`
- 结束：`[指令] 面试结束，请给出总评报告，包含：1.整体评分(A+/A/B+/B/C) 2.各维度点评 3.2-3条改进建议 4.针对简历的优化建议`

### 打字机效果
```javascript
async function typewrite(element, text) {
  return new Promise(resolve => {
    element.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.style.cssText = 'display:inline-block;width:2px;height:16px;background:#a78bfa;animation:blink 0.8s infinite;vertical-align:text-bottom;margin-left:1px';
    element.appendChild(cursor);
    function tick() {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(tick, 25 + Math.random() * 20);
      } else {
        cursor.remove();
        resolve();
      }
    }
    tick();
  });
}
```

### localStorage
- pc_resume: 简历原文
- pc_mc: 完成面试次数
- pc_hist: [{id, time, total, summary}] 面试记录列表
- pc_rec_{id}: 单条完整记录(含全部对话)

### 面试结束逻辑
questionIndex >= questionTotal时自动结束，或用户点结束按钮。调用结束指令API，等待总评后保存记录到localStorage，弹窗提示后跳转。

---

## 输出要求
生成一个完整、可以直接运行的HTML文件。所有CSS和JS内联，不依赖任何外部库。代码要健壮，处理网络错误(显示"连接失败：错误信息")。所有交互要流畅自然。
