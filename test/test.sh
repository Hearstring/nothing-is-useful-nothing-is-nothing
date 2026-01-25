#!/bin/bash
cd /mnt/c/01_Projects/blog
node -e "
const fs = require('fs');
const path = require('path');

console.log('=== 系统诊断 ===');
console.log('当前目录:', process.cwd());

// 检查关键目录和文件
const checks = [
  ['docs/posts', '文章目录'],
  ['docs/.vitepress', 'VitePress配置目录'],
  ['docs/.vitepress/config.js', '配置文件'],
  ['docs/.vitepress/components/PostsList.vue', '组件文件'],
  ['docs/.vitepress/posts-data.js', '数据插件'],
  ['docs/.vitepress/posts-data.json', '数据文件（运行时生成）'],
  ['docs/posts.md', '文章列表页面'],
  ['package.json', '项目配置']
];

checks.forEach(([filepath, description]) => {
  const fullPath = path.join(process.cwd(), filepath);
  const exists = fs.existsSync(fullPath);
  console.log(\`\${exists ? '✅' : '❌'} \${description}: \${exists ? '存在' : '不存在'}\`);
  
  if (exists && filepath.endsWith('.json')) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);
      console.log(\`   包含 \${Array.isArray(data) ? data.length : '?'} 条数据\`);
    } catch (e) {
      console.log('   文件内容无效');
    }
  }
});

// 检查 posts 目录下的文件
const postsPath = path.join(process.cwd(), 'docs/posts');
if (fs.existsSync(postsPath)) {
  const files = [];
  
  function scanDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(postsPath, fullPath);
      
      if (stat.isDirectory()) {
        files.push(\`📁 \${relativePath}/\`);
        scanDir(fullPath, prefix + '  ');
      } else if (item.endsWith('.md')) {
        files.push(\`📄 \${relativePath}\`);
      }
    });
  }
  
  try {
    scanDir(postsPath);
    console.log('📂 Posts目录结构:');
    files.forEach(f => console.log('   ' + f));
  } catch (e) {
    console.log('   无法扫描目录:', e.message);
  }
}

console.log('=== 诊断结束 ===');
"