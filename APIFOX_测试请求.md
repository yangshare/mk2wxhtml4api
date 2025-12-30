# Apifox 测试请求

## POST /api/convert/wechat

**URL:** `http://localhost:3000/api/convert/wechat`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "markdown": "# 探索 Markdown 的奇妙世界\n\n欢迎来到 Markdown 的奇妙世界！无论你是写作爱好者、开发者、博主，还是想要简单记录点什么的人，Markdown 都能成为你新的好伙伴。\n\n## Markdown 基础语法\n\n### 标题：让你的内容层次分明\n\n用 `#` 号来创建标题。标题从 `#` 开始，`#` 的数量表示标题的级别。\n\n### 字体样式：强调你的文字\n\n- **粗体**：用两个星号包裹文字，如 `**粗体**`\n- *斜体*：用一个星号包裹文字，如 `*斜体*`\n- ~~删除线~~：用两个波浪线包裹文字\n\n### 列表：整洁有序\n\n#### 无序列表\n- 第一项\n- 第二项\n- 第三项\n\n#### 有序列表\n1. 第一项\n2. 第二项\n3. 第三项\n\n### 代码：展示你的代码\n\n#### 行内代码\n这是一段`行内代码`示例。\n\n#### 代码块\n\n```javascript\nfunction hello() {\n  console.log('Hello, World!');\n}\n```\n\n### 引用：引用名言\n\n> 这是一段引用文字。\n\n### 链接与图片\n\n[访问 GitHub](https://github.com)\n\n## 结语\n\nMarkdown 是一种简单、强大且易于掌握的标记语言。现在就开始创作吧！"
}
```

---

## 简化测试版本

**Body (简化版):**
```json
{
  "markdown": "# 你好，世界\n\n这是**粗体**文字，这是*斜体*文字。\n\n## 功能列表\n\n- 支持 Markdown 语法\n- 自动应用微信样式\n- HTML 安全过滤\n\n> 这是一段引用文字\n\n```javascript\nconsole.log('Hello, WeChat!');\n```"
}
```

---

## cURL 命令

直接复制以下命令到终端测试：

```bash
curl -X POST http://localhost:3000/api/convert/wechat \
  -H "Content-Type: application/json" \
  -d "{\"markdown\": \"# 你好，世界\\n\\n这是**粗体**文字，这是*斜体*文字。\\n\\n## 功能列表\\n\\n- 支持 Markdown 语法\\n- 自动应用微信样式\\n- HTML 安全过滤\\n\\n> 这是一段引用文字\\n\\n```javascript\\nconsole.log('Hello, WeChat!');\\n```\"}"
```
