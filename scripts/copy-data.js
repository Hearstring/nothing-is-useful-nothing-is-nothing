const fs = require('fs');
const path = require('path');

console.log('📋 开始复制数据文件...');

const source = path.join(__dirname, '../docs/public/posts-data.json');
const dest = path.join(__dirname, '../docs/.vitepress/dist/posts-data.json');

if (fs.existsSync(source)) {
        // 确保目标目录存在
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(source, dest);
        console.log(`✅ 已将 ${source} 复制到 ${dest}`);
} else {
        console.log(`❌ 源文件 ${source} 不存在，跳过复制`);
}