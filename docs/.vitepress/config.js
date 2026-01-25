import { defineConfig } from 'vitepress'
import { readdirSync, statSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'
import postsDataPlugin from './posts-data.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function autoGenerateSidebar(basePath = '') {
  const docsPath = join(__dirname, '..', basePath)
  const items = []

  try {
    const files = readdirSync(docsPath)

    files.sort((a, b) => {
      // 确保 index.md 在最前面
      if (a === 'index.md') return -1
      if (b === 'index.md') return 1
      return a.localeCompare(b)
    })

    for (const file of files) {
      const fullPath = join(docsPath, file)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // 递归处理子目录
        const children = autoGenerateSidebar(join(basePath, file))
        if (children.length > 0) {
          items.push({
            text: formatTitle(file),
            collapsed: false, // 是否默认折叠
            items: children
          })
        }
      } else if (file.endsWith('.md') && file !== 'index.md') {
        // 处理 Markdown 文件
        const link = join('/', basePath, file.replace('.md', ''))
        items.push({
          text: formatTitle(file.replace('.md', '')),
          link: link
        })
      }
    }
  } catch (error) {
    console.warn(`无法读取目录 ${basePath}:`, error)
  }

  return items
}

function formatTitle(str) {
  return str
    // 去除开头的数字和分隔符（如 "01-", "1_", "001." 等）
    .replace(/^[\d]+[-_.\s]*/, '')
    // 将连字符、下划线转换为空格
    .replace(/[-_]/g, ' ')
    // 单词首字母大写
    .replace(/\b\w/g, l => l.toUpperCase())
    // 处理特殊缩写（可选）
    .replace(/\b(api|ui|ux|db|sql|nosql|http|https|url|uri|dom|bom|cli)\b/gi,
      word => word.toUpperCase())
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Where heart is?",
  description: "A site",

  markdown: {
    math: true,
    engine: 'katex',
    katexOptions: {
      // KaTeX 配置选项
      strict: false,  // 设为 false 以允许更多 LaTeX 命令
      throwOnError: false,  // 不抛出错误，渲染失败时显示原始文本
    }
  },

  vite: {
    plugins: [postsDataPlugin],
    publicDir: '../public',
    build: {
      rollupOptions: {
        external: ['katex'] // 确保 KaTeX 被正确处理
      }
    }
  },

  // 添加 head 配置，确保 KaTeX CSS 正确加载
  head: [
    // KaTeX CSS（如果需要，VitePress 会自动添加）
    // ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' }]
  ],

  build: {
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts' }
    ],

    sidebar: {
      '/posts/physics/': autoGenerateSidebar('posts/physics'),
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Hearstring/nothing-is-useful-nothing-is-nothing' }
    ],

    search: {
      provider: 'local'
    },

    lastUpdated: true,
  },
})
