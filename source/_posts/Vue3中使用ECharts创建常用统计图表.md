---
title: Vue3中使用ECharts创建常用统计图表
typora-root-url: Vue3中使用ECharts创建常用统计图表
date: 2026-05-26 10:46:09
categories:
    - 前端可视化
tags:
    - ECharts
    - 数据可视化
    - 前端开发
---

## 前言

本文面向已经具备 Vue 3 项目、并且可以在组件中导入 `echarts` 的读者。从一个可复用的组件模板开始，随后通过常见业务数据演示统计图表配置与动态更新方法。

## 基础组件模板

下面的单文件组件可以直接作为图表组件使用。它以月度访问量趋势折线图为初始内容，后文每个案例的 `option` 都可以替换这里的同名对象。

```vue
<template>
    <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as echarts from "echarts";

const chartRef = ref(null);
let chartInstance = null;

const option = {
    title: { text: "月度访问量趋势" },
    tooltip: { trigger: "axis" },
    xAxis: {
        type: "category",
        data: ["1月", "2月", "3月", "4月", "5月", "6月"],
    },
    yAxis: { type: "value", name: "访问量" },
    series: [
        {
            name: "访问量",
            type: "line",
            smooth: true,
            data: [1200, 1680, 1320, 2100, 2560, 2880],
        },
    ],
};

const resizeChart = () => chartInstance?.resize();

onMounted(() => {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption(option);
    window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart);
    chartInstance?.dispose();
    chartInstance = null;
});
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 420px;
}
</style>
```

图表绘制依赖容器尺寸，因此容器必须具有明确高度。浏览器窗口变化时调用 `resize`，图表才能重新适配可用宽度。组件卸载时移除监听并执行 `dispose`，可以释放实例持有的 DOM 和事件资源，避免路由切换后残留旧实例。

## 常用配置项

| 配置项            | 作用                                               |
| ----------------- | -------------------------------------------------- |
| `title`           | 设置图表标题和标题位置等信息。                     |
| `tooltip`         | 配置鼠标悬停或触发时显示的数据提示。               |
| `legend`          | 显示系列图例，便于比较或切换数据系列。             |
| `grid`            | 调整直角坐标系在容器中的边距，为坐标标签预留空间。 |
| `xAxis` / `yAxis` | 定义类目轴或数值轴，以及轴标题、刻度和数据。       |
| `series`          | 指定图表类型及其呈现的数据、样式和交互行为。       |
| `dataset`         | 集中管理结构化数据，使多个系列可以共享数据源。     |

## 折线图：月度订单趋势

适用场景：折线图适合呈现按时间连续变化的指标，例如观察订单数量是否持续增长。示例中六个数值分别表示 `1月` 到 `6月` 的订单数，依次为 `320`、`410`、`368`、`520`、`610` 和 `745`。

```js
const lineData = [320, 410, 368, 520, 610, 745];

const option = {
    title: { text: "月度订单趋势" },
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 24, bottom: 36, containLabel: true },
    xAxis: {
        type: "category",
        data: ["1月", "2月", "3月", "4月", "5月", "6月"],
    },
    yAxis: { type: "value", name: "订单数" },
    series: [
        {
            name: "订单数",
            type: "line",
            smooth: true,
            areaStyle: {},
            data: lineData,
        },
    ],
};
```

`smooth` 使趋势线过渡更平滑，`areaStyle` 则在折线下方绘制面积，便于强调数据规模。

## 柱状图：产品销售额对比

适用场景：柱状图适合横向比较多个离散类别的数值。示例数据表示云主机、对象存储、数据库、CDN 和短信五类产品的销售额，单位为万元，对应数值为 `[86, 124, 98, 156, 112]`。

```js
const productSales = [86, 124, 98, 156, 112];

const option = {
    title: { text: "各产品销售额" },
    tooltip: { trigger: "axis" },
    grid: { left: 48, right: 24, bottom: 36, containLabel: true },
    xAxis: {
        type: "category",
        data: ["云主机", "对象存储", "数据库", "CDN", "短信"],
    },
    yAxis: { type: "value", name: "万元" },
    series: [
        {
            name: "销售额",
            type: "bar",
            barWidth: 36,
            data: productSales,
        },
    ],
};
```

## 饼图：渠道访问占比

适用场景：饼图适合展示一个总量内部的分类构成。示例表示四类访问渠道带来的访问次数：搜索引擎 `468`、直接访问 `286`、内容推荐 `192`、社交媒体 `154`；使用内外半径可以形成环形饼图。

```js
const channelData = [
    { name: "搜索引擎", value: 468 },
    { name: "直接访问", value: 286 },
    { name: "内容推荐", value: 192 },
    { name: "社交媒体", value: 154 },
];

const option = {
    title: { text: "访问来源渠道" },
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0 },
    series: [
        {
            name: "访问来源",
            type: "pie",
            radius: ["38%", "68%"],
            data: channelData,
        },
    ],
};
```

## 散点图：广告投入与新增用户

适用场景：散点图适合观察两个数值指标之间可能存在的相关关系。示例中每个点的第一个值为广告投入金额，单位为万元；第二个值为该投入带来的新增用户数，例如 `[2, 180]` 表示投入 2 万元并获得 180 名新增用户。

```js
const campaignData = [
    [2, 180],
    [3, 220],
    [4, 310],
    [5, 360],
    [6, 430],
    [8, 610],
];

const option = {
    title: { text: "广告投入与新增用户关系" },
    tooltip: { trigger: "item" },
    grid: { left: 48, right: 24, bottom: 36, containLabel: true },
    xAxis: { type: "value", name: "投入/万元" },
    yAxis: { type: "value", name: "新增用户数" },
    series: [
        {
            name: "活动效果",
            type: "scatter",
            symbolSize: 16,
            data: campaignData,
        },
    ],
};
```

## 雷达图：产品能力评分

适用场景：雷达图适合比较多个对象在相同评价维度上的表现。示例比较产品 A 与产品 B 在性能、稳定性、易用性、扩展性、服务支持上的百分制评分；产品 A 为 `[92, 85, 78, 88, 80]`，产品 B 为 `[82, 91, 89, 73, 87]`。

```js
const option = {
    title: { text: "产品能力对比" },
    tooltip: {},
    legend: { data: ["产品A", "产品B"] },
    radar: {
        indicator: [
            { name: "性能", max: 100 },
            { name: "稳定性", max: 100 },
            { name: "易用性", max: 100 },
            { name: "扩展性", max: 100 },
            { name: "服务支持", max: 100 },
        ],
    },
    series: [
        {
            type: "radar",
            data: [
                { name: "产品A", value: [92, 85, 78, 88, 80] },
                { name: "产品B", value: [82, 91, 89, 73, 87] },
            ],
        },
    ],
};
```

## 漏斗图：注册转化流程

适用场景：漏斗图适合追踪逐步流失的业务流程。示例描述从访问页面到完成支付的转化过程：访问页面 `1000` 人、注册账号 `620` 人、创建订单 `360` 人、完成支付 `218` 人。

```js
const funnelData = [
    { name: "访问页面", value: 1000 },
    { name: "注册账号", value: 620 },
    { name: "创建订单", value: 360 },
    { name: "完成支付", value: 218 },
];

const option = {
    title: { text: "注册转化流程" },
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    series: [
        {
            name: "转化人数",
            type: "funnel",
            sort: "descending",
            label: { show: true, position: "inside" },
            data: funnelData,
        },
    ],
};
```

## 仪表盘：CPU 使用率

适用场景：仪表盘适合突出一个需要快速关注的当前状态指标。示例展示服务器当前 CPU 使用率为 `67%`。

```js
const option = {
    title: { text: "服务器资源状态" },
    series: [
        {
            name: "CPU",
            type: "gauge",
            progress: { show: true },
            detail: {
                valueAnimation: true,
                formatter: "{value}%",
            },
            data: [{ name: "CPU使用率", value: 67 }],
        },
    ],
};
```

## 热力图：分时访问热度

适用场景：热力图适合用颜色强度呈现两个分类维度交叉后的数值大小。示例以星期为纵轴、`08:00` 到 `18:00` 的时段为横轴；每一个 `[时段索引, 星期索引, 热度]` 数组表示对应格子的访问热度，例如 `[0, 0, 32]` 表示周一 `08:00` 的热度为 `32`。

```js
const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
const weekdays = ["周一", "周二", "周三", "周四", "周五"];
const heatmapData = [
    [0, 0, 32],
    [1, 0, 48],
    [2, 0, 60],
    [3, 0, 56],
    [4, 0, 72],
    [5, 0, 44],
    [0, 1, 38],
    [1, 1, 51],
    [2, 1, 66],
    [3, 1, 62],
    [4, 1, 78],
    [5, 1, 52],
    [0, 2, 42],
    [1, 2, 58],
    [2, 2, 74],
    [3, 2, 69],
    [4, 2, 86],
    [5, 2, 57],
    [0, 3, 45],
    [1, 3, 62],
    [2, 3, 79],
    [3, 3, 72],
    [4, 3, 90],
    [5, 3, 64],
    [0, 4, 50],
    [1, 4, 68],
    [2, 4, 88],
    [3, 4, 82],
    [4, 4, 96],
    [5, 4, 71],
];

const option = {
    title: { text: "工作日访问热度" },
    tooltip: { position: "top" },
    grid: { top: 64, left: 56, right: 24, bottom: 72 },
    xAxis: { type: "category", data: hours },
    yAxis: { type: "category", data: weekdays },
    visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
    },
    series: [
        {
            name: "访问热度",
            type: "heatmap",
            data: heatmapData,
            label: { show: true },
        },
    ],
};
```

## 组合图：销售额与同比增长率

适用场景：当两个指标共享时间维度但数值单位不同，例如销售额与增长率，可以使用柱状图和折线图搭配双 Y 轴。这里的 `dataset` 每行分别表示月份、销售额（万元）与同比增长率（百分比）。

```js
const mixedDataset = [
    ["月份", "销售额", "同比增长率"],
    ["1月", 86, 8.5],
    ["2月", 102, 12.4],
    ["3月", 118, 10.1],
    ["4月", 142, 16.8],
    ["5月", 156, 18.2],
    ["6月", 174, 21.5],
];

const option = {
    title: { text: "月度销售额与同比增长率" },
    tooltip: { trigger: "axis" },
    legend: {},
    dataset: { source: mixedDataset },
    grid: { left: 48, right: 56, bottom: 36, containLabel: true },
    xAxis: { type: "category" },
    yAxis: [
        { type: "value", name: "销售额/万元" },
        {
            type: "value",
            name: "同比增长率",
            axisLabel: { formatter: "{value}%" },
        },
    ],
    series: [
        {
            name: "销售额",
            type: "bar",
            encode: { x: "月份", y: "销售额" },
        },
        {
            name: "同比增长率",
            type: "line",
            yAxisIndex: 1,
            encode: { x: "月份", y: "同比增长率" },
        },
    ],
};
```

## 真实项目中的数据更新

真实页面通常在组件挂载后请求统计数据。假设初始化 `option` 已经定义名为 `销售额` 的柱状系列，下面的方法在接口返回后更新月份类目和对应销售额；可在 `onMounted` 中完成图表初始化后调用 `loadSalesData()`。

```js
const loadSalesData = async () => {
    try {
        const response = await fetch("/api/statistics/monthly-sales");
        if (!response.ok) {
            throw new Error("月度销售数据请求失败");
        }

        const data = await response.json();

        if (!chartInstance) {
            return;
        }

        chartInstance.setOption({
            xAxis: {
                data: data.map((item) => item.month),
            },
            series: [
                {
                    name: "销售额",
                    data: data.map((item) => item.amount),
                },
            ],
        });
    } catch (error) {
        console.error("加载销售数据失败：", error);
    }
};
```

实践中还需要注意以下几点：

- 容器必须有稳定高度；如果父布局在切换侧栏、标签页或弹窗后改变尺寸，也应在可见且尺寸稳定时调用实例的 `resize()`。
- 只要数据变动，就可以继续调用 `setOption` 合并新配置，无需重复创建实例。
- 异步请求返回后，应先确认组件仍处于挂载状态且图表实例存在；更复杂的场景中，可以在组件卸载时取消尚未完成的请求。
- 真实页面应在接口失败时展示提示或空状态；示例使用 `console.error` 标明错误处理所在位置。
- 更新多个系列时应保留稳定且唯一的 `name`，或显式使用系列标识，使 ECharts 能够将新数据对应到已有系列。
- 组件卸载时必须移除注册过的窗口监听，并调用 `dispose()` 清理图表实例。

## 参考文档

- [Apache ECharts Features](https://echarts.apache.org/en/feature.html)
- [Apache ECharts Dataset](https://echarts.apache.org/handbook/en/concepts/dataset)
- [Apache ECharts Dynamic Data](https://echarts.apache.org/handbook/en/how-to/data/dynamic-data/)
