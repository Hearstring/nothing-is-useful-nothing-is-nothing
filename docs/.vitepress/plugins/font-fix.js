// docs/.vitepress/plugins/font-fix.js
export default function fontFixPlugin() {
        return {
                name: 'font-fix-plugin',

                transformIndexHtml(html) {
                        // 移除Inter字体的预加载链接
                        return html
                                .replace(/<link rel="preload" href=".*?inter-roman-latin.*?">/g, '')
                                .replace(/<link rel="stylesheet" href=".*?inter.css.*?">/g, '')
                },

                // 或者完全禁用字体优化
                config() {
                        return {
                                build: {
                                        assetsInlineLimit: 0 // 不内联任何资源
                                }
                        }
                }
        }
}