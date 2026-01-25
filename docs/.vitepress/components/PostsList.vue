<!-- docs/.vitepress/components/PostsList.vue -->
<template>
	<div class="vp-doc posts-container">
		<!-- 状态栏 -->
		<div class="status-wrapper">
			<div class="status-bar">
				<span class="status-icon">📊</span>
				<span class="status-text">{{ statusMessage }}</span>
				<span class="post-count" v-if="posts.length > 0">{{ posts.length }} 篇</span>
			</div>
		</div>

		<!-- 主内容区 -->
		<div class="posts-content">
			<!-- 文章列表 -->
			<div v-if="posts.length > 0" class="posts-section">
				<div class="posts-header">
					<h2>📚 文章列表</h2>
					<div class="search-wrapper">
						<input v-model="searchQuery" placeholder="搜索文章..." class="search-input"
							@input="filterPosts" />
					</div>
				</div>

				<div class="posts-grid">
					<article v-for="(post, index) in filteredPosts" :key="post.link"
						class="post-item" @click="visitPost(post.link)">
						<div class="post-number">{{ index + 1 }}</div>
						<div class="post-details">
							<h3 class="post-title">{{ post.title }}</h3>
							<div class="post-meta">
								<span class="meta-item date">
									<span class="meta-icon">📅</span>
									{{ post.date }}
								</span>
								<span class="meta-item time">
									<span class="meta-icon">🕒</span>
									{{ post.relativeTime }}
								</span>
								<span class="meta-item category" v-if="post.category">
									<span class="meta-icon">🏷️</span>
									{{ post.category }}
								</span>
							</div>
							<div class="post-path">
								<small>路径: {{ post.directory || '根目录' }}</small>
							</div>
						</div>
					</article>
				</div>
			</div>

			<!-- 空状态 -->
			<div v-else class="empty-state">
				<div class="empty-icon">📭</div>
				<h3>还没有文章</h3>
				<p>在 <code>docs/posts/</code> 目录下添加 Markdown 文件</p>

				<div class="actions">
					<button @click="reloadData" class="action-btn">
						🔄 重新加载
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'PostsList',

	data() {
		return {
			posts: [],
			loading: true,
			error: null,
			searchQuery: ''
		}
	},

	computed: {
		statusMessage() {
			if (this.loading) return '加载中...'
			if (this.error) return `加载失败: ${this.error}`
			if (this.posts.length === 0) return '没有文章'
			return '已加载文章'
		},

		filteredPosts() {
			if (!this.searchQuery.trim()) return this.posts

			const query = this.searchQuery.toLowerCase()
			return this.posts.filter(post =>
				post.title.toLowerCase().includes(query) ||
				(post.category && post.category.toLowerCase().includes(query)) ||
				(post.directory && post.directory.toLowerCase().includes(query))
			)
		}
	},

	async mounted() {
		console.log('🚀 文章列表组件已加载')
		await this.loadPosts()
	},

	methods: {
		async loadPosts() {
			this.loading = true
			this.error = null

			try {
				const response = await fetch('/.vitepress/posts-data.json')

				if (response.ok) {
					const data = await response.json()

					const fixedData = data.map(post => {
						if (!post.timestamp || post.timestamp < 100000000000) {
							post.timestamp = Date.now()
							post.date = new Date().toLocaleDateString('zh-CN')
							post.relativeTime = '刚刚'
						}
						return post
					})

					this.posts = fixedData
				} else {
					throw new Error('无法加载数据')
				}
			} catch (err) {
				console.error('加载失败:', err)
				this.error = err.message
			} finally {
				this.loading = false
			}
		},

		visitPost(link) {
			window.location.href = link
		},

		filterPosts() {
			// 搜索功能
		},

		async reloadData() {
			await this.loadPosts()
		}
	}
}
</script>

<style scoped>
/* 主容器 - 与 VitePress 样式集成 */
.posts-container {
	width: 100%;
	margin: 0 auto;
	padding: 0;
	box-sizing: border-box;
}

/* 状态栏包装器 */
.status-wrapper {
	width: 100%;
	margin-bottom: 2rem;
}

.status-bar {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: var(--vp-c-bg-soft);
	border: 1px solid var(--vp-c-border);
	border-radius: 8px;
	font-size: 0.875rem;
	color: var(--vp-c-text-2);
	max-width: none;
	margin: 0;
}

.post-count {
	margin-left: auto;
	background: var(--vp-c-brand);
	color: var(--vp-c-white);
	padding: 0.25rem 0.75rem;
	border-radius: 9999px;
	font-size: 0.75rem;
	font-weight: 500;
}

/* 内容区域 */
.posts-content {
	width: 100%;
	max-width: var(--vp-layout-max-width);
	margin: 0 auto;
	padding: 0 24px;
	box-sizing: border-box;
}

/* 头部 */
.posts-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	gap: 1rem;
	width: 100%;
}

.posts-header h2 {
	margin: 0;
	color: var(--vp-c-text-1);
	font-size: 1.5rem;
	font-weight: 600;
	line-height: 1.2;
}

/* 搜索框 */
.search-wrapper {
	flex: 1;
	min-width: 200px;
	max-width: 400px;
}

.search-input {
	width: 100%;
	padding: 0.625rem 1rem;
	border: 1px solid var(--vp-c-border);
	border-radius: 8px;
	font-size: 0.875rem;
	background: var(--vp-c-bg);
	color: var(--vp-c-text-1);
	transition: all 0.2s ease;
	box-sizing: border-box;
}

.search-input:focus {
	outline: none;
	border-color: var(--vp-c-brand);
	box-shadow: 0 0 0 3px var(--vp-c-brand-dimm);
}

/* 文章网格 */
.posts-grid {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
}

/* 文章卡片 */
.post-item {
	display: flex;
	align-items: flex-start;
	background: var(--vp-c-bg-soft);
	border: 1px solid var(--vp-c-border);
	border-radius: 12px;
	padding: 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;
	box-sizing: border-box;
	margin: 0;
}

.post-item:hover {
	transform: translateY(-2px);
	border-color: var(--vp-c-brand);
	background: var(--vp-c-bg-soft-up);
	box-shadow: 0 6px 20px var(--vp-shadow-2);
}

.post-number {
	width: 36px;
	height: 36px;
	background: var(--vp-c-brand);
	color: var(--vp-c-white);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 1rem;
	margin-right: 1rem;
	flex-shrink: 0;
}

.post-details {
	flex: 1;
	min-width: 0;
	/* 防止内容溢出 */
}

.post-title {
	margin: 0 0 0.75rem 0;
	color: var(--vp-c-text-1);
	font-size: 1.125rem;
	font-weight: 600;
	line-height: 1.4;
	word-break: break-word;
}

.post-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
	color: var(--vp-c-text-2);
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	line-height: 1.4;
}

.meta-icon {
	font-size: 0.875rem;
	opacity: 0.8;
}

.post-path small {
	color: var(--vp-c-text-3);
	font-size: 0.75rem;
	font-family: var(--vp-font-family-mono);
	line-height: 1.4;
	word-break: break-all;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 3rem 1.5rem;
	background: var(--vp-c-bg-soft);
	border: 2px dashed var(--vp-c-border);
	border-radius: 12px;
	margin-top: 2rem;
	width: 100%;
}

.empty-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
	opacity: 0.8;
}

.empty-state h3 {
	color: var(--vp-c-text-1);
	margin: 0 0 0.5rem 0;
	font-size: 1.25rem;
	font-weight: 600;
}

.empty-state p {
	color: var(--vp-c-text-2);
	margin: 0 0 1.5rem 0;
	font-size: 0.875rem;
}

.empty-state code {
	background: var(--vp-c-mute);
	padding: 0.125rem 0.375rem;
	border-radius: 4px;
	font-family: var(--vp-font-family-mono);
	font-size: 0.875rem;
}

.actions {
	display: flex;
	justify-content: center;
}

.action-btn {
	padding: 0.625rem 1.25rem;
	background: var(--vp-c-brand);
	color: var(--vp-c-white);
	border: none;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.action-btn:hover {
	background: var(--vp-c-brand-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
	.posts-content {
		padding: 0 16px;
	}

	.posts-header {
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	.posts-header h2 {
		font-size: 1.25rem;
	}

	.search-wrapper {
		max-width: 100%;
	}

	.post-item {
		flex-direction: column;
		padding: 1.25rem;
	}

	.post-number {
		margin-right: 0;
		margin-bottom: 0.75rem;
		align-self: flex-start;
	}

	.post-meta {
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty-state {
		padding: 2rem 1rem;
	}

	.empty-icon {
		font-size: 2.5rem;
	}
}

@media (max-width: 640px) {
	.status-bar {
		flex-wrap: wrap;
	}

	.post-count {
		margin-left: 0;
		margin-top: 0.5rem;
		order: 1;
	}
}

/* 确保与 VitePress 内容区对齐 */
.vp-doc .posts-container {
	max-width: 100%;
	padding: 0;
}

/* 重置可能影响布局的全局样式 */
.posts-container * {
	box-sizing: border-box;
}

/* 清除浮动和定位问题 */
.posts-container {
	position: relative;
	clear: both;
}

.posts-content,
.posts-grid,
.posts-section {
	position: relative;
	float: none;
}
</style>