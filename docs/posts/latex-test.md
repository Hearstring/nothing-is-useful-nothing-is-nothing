---
layout: doc
title: LaTeX 渲染测试
---

# LaTeX 渲染全面测试

## 测试 1：基本公式
- 单字符: $a$
- 双字符: $ab$
- 简单公式: $x + y = z$
- 分数: $\frac{1}{2}$
- 平方根: $\sqrt{2}$

## 测试 2：复杂公式
块级公式:
$$ \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi} $$

矩阵:
$$
\begin{pmatrix}
1 & 2 \\
3 & 4
\end{pmatrix}
$$

## 测试 3：特殊字符
- 希腊字母: $\alpha, \beta, \gamma$
- 运算符: $\sum_{i=1}^{n} i$
- 关系符: $x \in \mathbb{R}$
- 箭头: $x \rightarrow y$

## 测试 4：长公式
$$
f(x) = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = \sum_{k=0}^{\infty} \frac{x^k}{k!}