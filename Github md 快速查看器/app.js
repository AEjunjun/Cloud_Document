// ===== 全局状态 =====
let treeData = null;
let fileMap = new Map();

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', init);

function init() {
    const search = document.getElementById('search-input');
    search.addEventListener('input', filterFiles);

    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true
        });
    }

    loadManifest();
}

// ===== 从 manifest.json 加载文件树 =====
async function loadManifest() {
    try {
        const response = await fetch('manifest.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        treeData = await response.json();

        buildFileMap(treeData);
        renderTree(treeData);

        document.getElementById('search-input').disabled = false;
        document.getElementById('sidebar-footer').textContent =
            '共 ' + fileMap.size + ' 个文件';
    } catch (err) {
        console.error('加载 manifest.json 失败:', err);
        document.getElementById('file-tree').innerHTML =
            '<div class="loading">加载失败，请先运行 build.py 生成 manifest.json</div>';
    }
}

// ===== 构建 文件名 -> 节点 的映射 =====
function buildFileMap(node) {
    if (node.type === 'file') {
        fileMap.set(node.name.replace(/\.md$/, ''), node);
        fileMap.set(node.path, node);
    }
    if (node.children) {
        for (const child of node.children) {
            buildFileMap(child);
        }
    }
}

// ===== 渲染文件树 =====
function renderTree(tree) {
    const container = document.getElementById('file-tree');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'tree-list';

    if (tree.children) {
        for (const child of tree.children) {
            ul.appendChild(createTreeNode(child));
        }
    }
    container.appendChild(ul);
}

function createTreeNode(node) {
    const li = document.createElement('li');
    li.className = 'tree-node';

    if (node.type === 'directory') {
        const div = document.createElement('div');
        div.className = 'tree-folder';
        div.textContent = node.name;
        div.addEventListener('click', () => {
            li.classList.toggle('collapsed');
        });

        const childUl = document.createElement('ul');
        childUl.className = 'tree-list';
        for (const child of node.children) {
            childUl.appendChild(createTreeNode(child));
        }

        li.appendChild(div);
        li.appendChild(childUl);
    } else {
        const div = document.createElement('div');
        div.className = 'tree-file';
        div.textContent = node.name.replace(/\.md$/, '');
        div.addEventListener('click', () => {
            loadFile(node, div);
        });
        li.appendChild(div);
    }

    return li;
}

// ===== 数学公式保护：在 marked 渲染前提取，渲染后还原 =====
function renderMarkdownWithMath(content) {
    const mathStore = [];

    // 提取块级公式 $$...$$
    content = content.replace(/\$\$([\s\S]+?)\$\$/g, function(match) {
        var id = '@@KMATH' + mathStore.length + 'K@@';
        mathStore.push(match);
        return id;
    });

    // 提取行内公式 $...$（不匹配 $$ 和跨行）
    content = content.replace(/\$([^\$\n]+?)\$/g, function(match) {
        var id = '@@KMATH' + mathStore.length + 'K@@';
        mathStore.push(match);
        return id;
    });

    // 渲染 markdown
    var html = marked.parse(content);

    // 还原公式
    for (var i = 0; i < mathStore.length; i++) {
        html = html.split('@@KMATH' + i + 'K@@').join(mathStore[i]);
    }

    return html;
}

// ===== 代码块增强：语法高亮 + 复制按钮 =====
function enhanceCodeBlocks(container) {
    var pres = container.querySelectorAll('pre');
    pres.forEach(function(pre) {
        if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) return;

        var code = pre.querySelector('code');
        if (!code) return;

        // 获取语言
        var langClass = code.className.match(/language-(\w+)/);
        var lang = langClass ? langClass[1] : 'text';

        // 创建包裹容器
        var wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';

        // 创建头部栏
        var header = document.createElement('div');
        header.className = 'code-block-header';

        var langLabel = document.createElement('span');
        langLabel.className = 'code-lang';
        langLabel.textContent = lang;

        var copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', function() {
            var text = code.textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    copyBtn.textContent = '已复制';
                    setTimeout(function() { copyBtn.textContent = '复制'; }, 2000);
                });
            } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                copyBtn.textContent = '已复制';
                setTimeout(function() { copyBtn.textContent = '复制'; }, 2000);
            }
        });

        header.appendChild(langLabel);
        header.appendChild(copyBtn);

        // 替换结构
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);

        // 语法高亮
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(code);
        }
    });
}

// ===== 加载并渲染文件 =====
function loadFile(node, element) {
    document.querySelectorAll('.tree-file.active').forEach(el => {
        el.classList.remove('active');
    });
    if (element) element.classList.add('active');

    let content = node.content || '';

    // 处理 Obsidian 图片嵌入
    let processed = content.replace(/!\[\[([^\]]+)\]\]/g, '[$1]');

    // 处理 wikilinks
    processed = processWikilinks(processed);

    // 渲染 markdown（含数学公式保护）
    const html = renderMarkdownWithMath(processed);

    const contentEl = document.getElementById('markdown-content');
    contentEl.innerHTML = html;
    contentEl.style.display = 'block';

    document.getElementById('welcome').style.display = 'none';

    // 面包屑
    document.getElementById('breadcrumb').textContent = 'Home / ' + node.path;

    // 渲染数学公式
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(contentEl, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
        });
    }

    // 代码块增强（高亮 + 复制按钮）
    enhanceCodeBlocks(contentEl);

    // 处理 wikilink 点击
    setupWikilinkClicks(contentEl);

    // 滚动到顶部
    document.getElementById('content').scrollTop = 0;
}

// ===== Wikilinks 处理 =====
function processWikilinks(content) {
    return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, filename, display) => {
        const displayName = display || filename;
        return '[' + displayName + '](#' + encodeURIComponent(filename.trim()) + ')';
    });
}

function setupWikilinkClicks(container) {
    container.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#') && !href.startsWith('#file:')) {
            const decoded = decodeURIComponent(href.substring(1));
            if (fileMap.has(decoded)) {
                link.style.cursor = 'pointer';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetNode = fileMap.get(decoded);
                    findAndLoadFile(targetNode);
                });
            }
        }
    });
}

// ===== 通过文件名查找并加载文件 =====
function findAndLoadFile(node) {
    const fileElements = document.querySelectorAll('.tree-file');
    for (const el of fileElements) {
        if (el.textContent === node.name.replace(/\.md$/, '')) {
            loadFile(node, el);
            let parent = el.closest('.tree-node');
            while (parent) {
                parent.classList.remove('collapsed');
                parent = parent.parentElement?.closest('.tree-node');
            }
            break;
        }
    }
}

// ===== 搜索过滤 =====
function filterFiles(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        document.querySelectorAll('.tree-node').forEach(el => {
            el.style.display = '';
        });
        return;
    }

    document.querySelectorAll('.tree-file').forEach(el => {
        const text = el.textContent.toLowerCase();
        const li = el.closest('.tree-node');

        if (text.includes(query)) {
            li.style.display = '';
            let parent = li.parentElement;
            while (parent && parent.classList.contains('tree-list')) {
                const parentLi = parent.closest('.tree-node');
                if (parentLi) {
                    parentLi.style.display = '';
                    parentLi.classList.remove('collapsed');
                }
                parent = parentLi?.parentElement;
            }
        } else {
            li.style.display = 'none';
        }
    });

    // 隐藏没有匹配文件的空文件夹
    document.querySelectorAll('.tree-node').forEach(el => {
        if (el.querySelector('.tree-folder')) {
            const childList = el.querySelector('.tree-list');
            if (childList) {
                const visibleChildren = Array.from(childList.children).filter(
                    c => c.style.display !== 'none'
                );
                if (visibleChildren.length === 0) {
                    el.style.display = 'none';
                }
            }
        }
    });
}
