# Vue3 ECharts Chart Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one Hexo Markdown article that teaches Vue 3 developers how to render common ECharts statistical charts through reusable component and `option` examples.

**Architecture:** Add a single post under `source/_posts` following existing frontmatter conventions. The article first defines one Vue 3 chart lifecycle template, then provides self-contained sample data and `option` definitions for eight chart types and one mixed chart, followed by asynchronous update and cleanup guidance.

**Tech Stack:** Hexo Markdown posts, Vue 3 Composition API with `<script setup>`, Apache ECharts JavaScript configuration.

---

## File Structure

- Create: `source/_posts/Vue3中使用ECharts创建常用统计图表.md` - published tutorial article and all Vue 3/ECharts examples.
- Verify: `package.json` scripts through `npm run build` - ensure the new Markdown and fenced Vue/JavaScript snippets are accepted by Hexo.

### Task 1: Create The Vue3 ECharts Article

**Files:**
- Create: `source/_posts/Vue3中使用ECharts创建常用统计图表.md`

- [ ] **Step 1: Add post frontmatter and introductory scope**

Create the post with the existing blog metadata style:

```markdown
---
title: Vue3中使用ECharts创建常用统计图表
typora-root-url: Vue3中使用ECharts创建常用统计图表
date: 2026-05-26 10:00:00
categories:
    - 前端可视化
tags:
    - Vue3
    - ECharts
    - 数据可视化
    - 前端开发
---

## 前言

ECharts 通过配置对象即可将业务数据转换为图表。本文假设 Vue 3 项目已经能够导入 `echarts`，不展开安装流程，直接介绍组件写法、常用统计图表和数据更新实践。
```

- [ ] **Step 2: Write the shared Vue 3 component lifecycle template**

Include a full template that readers can run by replacing `option`:

```vue
<template>
    <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chartInstance = null

const option = {
    title: { text: '月度访问量趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [
        {
            name: '访问量',
            type: 'line',
            smooth: true,
            data: [1200, 1680, 1320, 2100, 2560, 2880]
        }
    ]
}

const resizeChart = () => chartInstance?.resize()

onMounted(() => {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(option)
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    chartInstance?.dispose()
    chartInstance = null
})
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 420px;
}
</style>
```

Explain why the container needs a height, why `resize` is registered, and why `dispose` prevents stale instances after route changes.

- [ ] **Step 3: Explain core configuration and add eight chart examples**

Introduce `title`, `tooltip`, `legend`, `grid`, `xAxis`, `yAxis`, `series`, `dataset` in a concise table. For each chart section, include its use case, explicit sample data, and a replaceable `option` definition.

Required option examples:

```js
// 折线图：月度订单趋势
const lineData = [320, 410, 368, 520, 610, 745]
const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', name: '订单数' },
    series: [{ name: '订单数', type: 'line', smooth: true, areaStyle: {}, data: lineData }]
}

// 柱状图：各产品销售额
const productSales = [86, 124, 98, 156, 112]
const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['云主机', '对象存储', '数据库', 'CDN', '短信'] },
    yAxis: { type: 'value', name: '万元' },
    series: [{ name: '销售额', type: 'bar', barWidth: 36, data: productSales }]
}

// 饼图：用户来源渠道占比
const channelData = [
    { name: '搜索引擎', value: 468 },
    { name: '直接访问', value: 286 },
    { name: '内容推荐', value: 192 },
    { name: '社交媒体', value: 154 }
]
const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{ name: '访问来源', type: 'pie', radius: ['38%', '68%'], data: channelData }]
}

// 散点图：广告投入与新增用户关系
const campaignData = [[2, 180], [3, 220], [4, 310], [5, 360], [6, 430], [8, 610]]
const scatterOption = {
    tooltip: { trigger: 'item' },
    xAxis: { type: 'value', name: '投入/万元' },
    yAxis: { type: 'value', name: '新增用户数' },
    series: [{ name: '活动效果', type: 'scatter', symbolSize: 16, data: campaignData }]
}

// 雷达图：两款产品能力评分
const radarOption = {
    tooltip: {},
    legend: { data: ['产品A', '产品B'] },
    radar: {
        indicator: [
            { name: '性能', max: 100 },
            { name: '稳定性', max: 100 },
            { name: '易用性', max: 100 },
            { name: '扩展性', max: 100 },
            { name: '服务支持', max: 100 }
        ]
    },
    series: [{
        type: 'radar',
        data: [
            { name: '产品A', value: [92, 85, 78, 88, 80] },
            { name: '产品B', value: [82, 91, 89, 73, 87] }
        ]
    }]
}

// 漏斗图：注册转化流程
const funnelData = [
    { name: '访问页面', value: 1000 },
    { name: '注册账号', value: 620 },
    { name: '创建订单', value: 360 },
    { name: '完成支付', value: 218 }
]
const funnelOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{ type: 'funnel', sort: 'descending', label: { show: true, position: 'inside' }, data: funnelData }]
}

// 仪表盘：资源使用率
const gaugeOption = {
    series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ name: 'CPU使用率', value: 67 }]
    }]
}

// 热力图：星期和时段访问热度
const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
const weekdays = ['周一', '周二', '周三', '周四', '周五']
const heatmapData = [
    [0, 0, 32], [1, 0, 48], [2, 0, 60], [3, 0, 56], [4, 0, 72], [5, 0, 44],
    [0, 1, 38], [1, 1, 51], [2, 1, 66], [3, 1, 62], [4, 1, 78], [5, 1, 52],
    [0, 2, 42], [1, 2, 58], [2, 2, 74], [3, 2, 69], [4, 2, 86], [5, 2, 57],
    [0, 3, 45], [1, 3, 62], [2, 3, 79], [3, 3, 72], [4, 3, 90], [5, 3, 64],
    [0, 4, 50], [1, 4, 68], [2, 4, 88], [3, 4, 82], [4, 4, 96], [5, 4, 71]
]
const heatmapOption = {
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'category', data: weekdays },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0 },
    series: [{ type: 'heatmap', data: heatmapData, label: { show: true } }]
}
```

- [ ] **Step 4: Add the mixed chart and real-page update practices**

Include a double-axis chart to distinguish sales totals from percentage growth:

```js
const mixedDataset = [
    ['月份', '销售额', '同比增长率'],
    ['1月', 86, 8.5],
    ['2月', 102, 12.4],
    ['3月', 118, 10.1],
    ['4月', 142, 16.8],
    ['5月', 156, 18.2],
    ['6月', 174, 21.5]
]

const mixedOption = {
    tooltip: { trigger: 'axis' },
    legend: {},
    dataset: { source: mixedDataset },
    xAxis: { type: 'category' },
    yAxis: [
        { type: 'value', name: '销售额/万元' },
        { type: 'value', name: '同比增长率', axisLabel: { formatter: '{value}%' } }
    ],
    series: [
        { name: '销售额', type: 'bar', encode: { x: '月份', y: '销售额' } },
        { name: '同比增长率', type: 'line', yAxisIndex: 1, encode: { x: '月份', y: '同比增长率' } }
    ]
}
```

Add asynchronous update guidance using explicit Vue code:

```js
const loadSalesData = async () => {
    const response = await fetch('/api/statistics/monthly-sales')
    const data = await response.json()

    chartInstance.setOption({
        xAxis: { data: data.map(item => item.month) },
        series: [{ data: data.map(item => item.amount) }]
    })
}
```

Close with the practical rules: keep the chart container at a defined height, call `setOption` after data changes, call `resize` when the layout changes, and call `dispose` when the component unmounts.

### Task 2: Verify The Article Output

**Files:**
- Inspect: `source/_posts/Vue3中使用ECharts创建常用统计图表.md`

- [ ] **Step 1: Check required coverage**

Run:

```powershell
rg -n "折线图|柱状图|饼图|散点图|雷达图|漏斗图|仪表盘|热力图|组合图|<script setup>|setOption|dispose" "source/_posts/Vue3中使用ECharts创建常用统计图表.md"
```

Expected: output includes headings or code references for all eight chart types, the mixed chart, Vue 3 setup syntax, data updates, and instance cleanup.

- [ ] **Step 2: Check Markdown diff formatting**

Run:

```powershell
git -c safe.directory=D:/Code/QingchenJia.github.io diff --check
```

Expected: exit code `0` with no whitespace-error output.

- [ ] **Step 3: Build the Hexo site**

Run:

```powershell
npm run build
```

Expected: exit code `0`; existing theme configuration deprecation or CDN availability warnings may remain, but no new Markdown generation failure is introduced by the post.

- [ ] **Step 4: Review only intended additions**

Run:

```powershell
git -c safe.directory=D:/Code/QingchenJia.github.io status --short
```

Expected: the new post and this plan document are present as the intentional work for this article; existing committed design documentation remains unchanged.
