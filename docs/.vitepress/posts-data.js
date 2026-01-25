// docs/.vitepress/posts-data.js - 修复版
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 posts-data.js启动...')

// 修复：获取文件时间戳（支持Git和文件系统）
function getFileTimestamp(filePath) {
        try {
                // 方法1: 尝试Git提交时间
                try {
                        // Windows和Linux兼容的命令
                        const command = process.platform === 'win32'
                                ? `git log -1 --format="%at" -- "${filePath}" 2>nul`
                                : `git log -1 --format="%at" -- "${filePath}" 2>/dev/null`

                        const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim()
                        if (output && !isNaN(parseInt(output))) {
                                const timestamp = parseInt(output) * 1000
                                console.log(`  ✅ Git时间戳: ${new Date(timestamp).toLocaleDateString()}`)
                                return timestamp
                        }
                } catch (gitError) {
                        console.log(`  ℹ️ Git不可用: ${gitError.message}`)
                }

                // 方法2: 文件修改时间
                const stats = fs.statSync(filePath)
                return stats.mtimeMs
        } catch (error) {
                console.warn(`  ⚠️ 无法获取时间戳 ${filePath}:`, error.message)
                return Date.now() // 默认使用当前时间
        }
}

// 修复：处理Windows路径分隔符
function normalizePath(str) {
        if (!str) return ''
        // 将反斜杠转换为正斜杠，并清理路径
        return str.replace(/\\/g, '/').replace(/\/\//g, '/')
}

// 修复：从文件名生成标题
function formatTitle(str) {
        return str
                .replace(/^\d+[-_.\s]*/, '') // 移除数字前缀
                .replace(/\.md$/i, '')       // 移除扩展名
                .replace(/[-_]/g, ' ')       // 下划线/连字符转空格
                .replace(/\b\w/g, l => l.toUpperCase()) // 首字母大写
}

// 修复：递归扫描文章
function scanPostsRecursive(dirPath, basePath = '') {
        const posts = []

        try {
                const items = fs.readdirSync(dirPath, { withFileTypes: true })

                for (const item of items) {
                        // 跳过隐藏文件和特殊文件
                        if (item.name.startsWith('.') || item.name === 'index.md') {
                                continue
                        }

                        const fullPath = path.join(dirPath, item.name)
                        const relativePath = basePath ? `${basePath}/${item.name}` : item.name

                        if (item.isDirectory()) {
                                // 递归处理子目录
                                const subPosts = scanPostsRecursive(fullPath, relativePath)
                                posts.push(...subPosts)
                        } else if (item.name.toLowerCase().endsWith('.md')) {
                                console.log(`  📄 找到: ${relativePath}`)

                                // 获取时间戳
                                const timestamp = getFileTimestamp(fullPath)

                                // 生成标题
                                const title = formatTitle(item.name)

                                // 修复链接路径
                                const link = `/posts/${normalizePath(relativePath.replace(/\.md$/i, ''))}`

                                // 修复目录路径
                                const directory = normalizePath(basePath || '')

                                // 生成分类
                                const category = directory.split('/')
                                        .map(dir => formatTitle(dir))
                                        .filter(Boolean)
                                        .join(' / ')

                                posts.push({
                                        title,
                                        link,
                                        timestamp,
                                        date: new Date(timestamp).toLocaleDateString('zh-CN'),
                                        relativeTime: getRelativeTime(timestamp),
                                        category,
                                        directory,
                                        filename: item.name
                                })
                        }
                }
        } catch (error) {
                console.error(`❌ 扫描目录失败 ${dirPath}:`, error.message)
        }

        return posts
}

// 修复：获取相对时间
function getRelativeTime(timestamp) {
        const now = Date.now()
        const diff = now - timestamp

        const minute = 60 * 1000
        const hour = minute * 60
        const day = hour * 24
        const week = day * 7
        const month = day * 30
        const year = day * 365

        if (diff < minute) return '刚刚'
        if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
        if (diff < day) return `${Math.floor(diff / hour)}小时前`
        if (diff < week) return `${Math.floor(diff / day)}天前`
        if (diff < month) return `${Math.floor(diff / week)}周前`
        if (diff < year) return `${Math.floor(diff / month)}个月前`
        return `${Math.floor(diff / year)}年前`
}

function generatePostsData() {
        try {
                const postsDir = path.join(process.cwd(), 'docs/posts')
                const publicDir = path.join(process.cwd(), 'docs/public')

                console.log(`📂 扫描目录: ${postsDir}`)

                // 确保public目录存在
                if (!fs.existsSync(publicDir)) {
                        console.log('📁 创建public目录...')
                        fs.mkdirSync(publicDir, { recursive: true })
                }

                // ... 其余代码 ...
        } catch (error) {
                console.error('❌ 生成数据文件失败:', error)
                return []
        }
}

// 修复：立即执行数据生成
console.log('🚀 开始生成文章数据...')
const posts = generatePostsData()
console.log('🎯 数据生成完成')

// 在 export default 对象中添加 closeBundle 方法
export default {
        name: 'postsDataPlugin',

        configureServer(server) {
                // ... 现有代码 ...
        },

        buildStart() {
                console.log('🔨 构建开始...')
                generatePostsData()
        },

        // 添加这个钩子：构建结束时执行
        closeBundle() {
                console.log('📦 构建结束，复制数据文件到 dist 目录...')

                const fs = require('fs')
                const path = require('path')

                // 源文件路径（public 目录）
                const sourceFile = path.join(__dirname, '../public/posts-data.json')
                // 目标文件路径（dist 目录）
                const distDir = path.join(__dirname, './dist')
                const destFile = path.join(distDir, 'posts-data.json')

                console.log(`📁 源文件: ${sourceFile}`)
                console.log(`📁 目标目录: ${distDir}`)

                // 确保 dist 目录存在
                if (!fs.existsSync(distDir)) {
                        fs.mkdirSync(distDir, { recursive: true })
                        console.log('✅ 创建 dist 目录')
                }

                // 检查源文件是否存在并复制
                if (fs.existsSync(sourceFile)) {
                        fs.copyFileSync(sourceFile, destFile)
                        console.log(`✅ 已复制数据文件到: ${destFile}`)

                        // 验证复制成功
                        if (fs.existsSync(destFile)) {
                                const stats = fs.statSync(destFile)
                                const data = JSON.parse(fs.readFileSync(destFile, 'utf8'))
                                console.log(`📊 文件大小: ${stats.size} 字节`)
                                console.log(`📝 包含文章数: ${data.length || data.posts?.length || 0}`)
                        }
                } else {
                        console.log('❌ 源文件不存在，无法复制')
                }
        }
}