# Home 文档查看器

静态 Markdown 文档查看器，可部署到 GitHub Pages。

## 文件结构

```
/
├── index.html        页面入口
├── style.css         样式
├── app.js            逻辑
├── build.py          构建脚本
├── manifest.json     生成的文件索引
└── Home/             Markdown 文件根目录
```

## 使用方法

### 1. 放入文档

将 Markdown 文件放入 `Home/` 目录，支持嵌套子文件夹。

如果下载发现没有 `Home/` 目录，自己创建一个即可

### 2. 生成索引

```
python build.py
```

脚本会扫描 `Home/` 下所有 `.md` 文件，将路径和内容打包到 `manifest.json`。

### 3. 本地预览

```
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`。

### 4. 部署到 GitHub Pages

将以下文件推送到仓库：
- `index.html`
- `style.css`
- `app.js`
- `manifest.json`

在仓库 Settings → Pages 中选择对应分支即可。

## 支持功能

- Markdown 渲染（GFM）
- 代码块语法高亮 + 复制按钮
- 数学公式（KaTeX）：`$行内$` 和 `$$块级$$`
- Obsidian wikilinks：`[[文件名]]`
- 文件树浏览与搜索
- 响应式布局

## 开源许可

- 本项目采用 MIT license 开源协议开源

## 注意事项

- 每次更新 `Home/` 中的文件后，需重新运行 `build.py` 再推送
- Markdown 文件编码建议使用 UTF-8，也兼容 GBK/GB2312
- 使用 Chrome 或 Edge 浏览器
