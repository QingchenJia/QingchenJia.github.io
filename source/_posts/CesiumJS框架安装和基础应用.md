---
title: CesiumJS框架安装和基础应用
typora-root-url: CesiumJS框架安装和基础应用
date: 2026-05-12 11:23:49
categories:
    - 前端开发
tags:
    - CesiumJS
    - 三维可视化
    - 教程
---

# CesiumJS框架安装和基础应用

CesiumJS 是一个面向浏览器的三维地球和三维地图开发框架。它把地理坐标、影像底图、模型、矢量数据和相机控制统一到同一个场景里，非常适合做 GIS 可视化、数字孪生、城市三维展示、轨迹回放等应用。

这篇文章会先把 CesiumJS 安装起来，再用几个最常见的 JS 示例带你完成第一个可运行场景、添加实体、绘制线面、监听点击和加载 GeoJSON。

## 一、先理解 CesiumJS 的使用场景

如果你只是想快速判断它适不适合项目，可以先记住这几个能力：

- 显示三维地球和三维地图。
- 在地图上添加点、线、面、标签和模型。
- 控制相机飞行、缩放、旋转和定位。
- 处理鼠标点击、拾取对象、显示坐标。
- 加载 GeoJSON、KML、CZML、3D Tiles 等数据。

如果你的项目需要“把地理空间数据放到浏览器里看见”，CesiumJS 基本就是最常见的选项之一。

## 二、安装 CesiumJS

### 方式一：npm + Vite，最适合做项目

如果你是准备新建项目，建议直接用 Vite 起步：

```bash
npm create vite@latest cesium-demo
cd cesium-demo
npm install
npm install cesium
npm install vite-plugin-cesium -D
```

然后在 `vite.config.js` 里加上 Cesium 插件：

```js
import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

export default defineConfig({
    plugins: [cesium()],
});
```

这个插件会帮你处理 Cesium 运行时需要的静态资源问题。对于新手来说，这比手动配置 `CESIUM_BASE_URL` 和复制资源目录省事很多。

### 方式二：直接引入 CDN，适合先验证效果

如果你只是想先跑通一个最小示例，可以直接用 CDN：

```html
<link
    rel="stylesheet"
    href="https://unpkg.com/cesium/Build/Cesium/Widgets/widgets.css"
/>
<script src="https://unpkg.com/cesium/Build/Cesium/Cesium.js"></script>
```

这种方式不用安装依赖，但不适合正式项目。正式项目还是建议走 npm + 构建工具。

## 三、创建第一个 Cesium 场景

先准备一个容器：

```html
<div id="cesiumContainer" style="width: 100%; height: 100vh;"></div>
```

然后在 `main.js` 里初始化 Viewer。下面这个示例不依赖 Cesium Ion Token，直接使用 Cesium 自带的 Natural Earth II 贴图，方便你本地立即跑起来：

```js
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const viewer = new Cesium.Viewer("cesiumContainer", {
    imageryProvider: new Cesium.TileMapServiceImageryProvider({
        url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
    }),
    baseLayerPicker: false,
    geocoder: false,
    animation: false,
    timeline: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    homeButton: true,
    fullscreenButton: true,
});

viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.391, 39.907, 1500000),
});
```

这段代码做了三件事：

- 创建一个 `Viewer`。
- 关闭一些新手阶段暂时用不到的按钮，界面更干净。
- 把相机飞到北京附近，方便你立刻看到效果。

## 四、添加第一个点和标签

CesiumJS 里最常用的方式之一，就是往场景里加实体（Entity）。下面这个示例会在北京天安门附近添加一个点和文字标签：

```js
viewer.entities.add({
    name: "天安门",
    position: Cesium.Cartesian3.fromDegrees(116.391, 39.907, 100),
    point: {
        pixelSize: 12,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
    },
    label: {
        text: "天安门",
        font: "16px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
    },
});

viewer.zoomTo(viewer.entities);
```

这里最容易记错的一点是 `fromDegrees` 的参数顺序：

- 第一个是经度。
- 第二个是纬度。
- 第三个是高度。

不要把经纬度顺序写反。

## 五、绘制线和面

三维可视化项目里，线和面几乎一定会用到。比如路线、边界、区域范围、活动轨迹等。

### 1. 画一条折线

```js
viewer.entities.add({
    name: "示例航线",
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
            116.391, 39.907, 121.4737, 31.2304, 113.2644, 23.1291,
        ]),
        width: 4,
        material: Cesium.Color.CYAN,
        clampToGround: true,
    },
});
```

### 2. 画一个多边形区域

```js
viewer.entities.add({
    name: "示例区域",
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
            116.3, 39.8, 116.5, 39.8, 116.5, 40.0, 116.3, 40.0,
        ]),
        material: Cesium.Color.ORANGE.withAlpha(0.35),
        outline: true,
        outlineColor: Cesium.Color.ORANGE,
    },
});
```

如果你后面要展示行政区、覆盖范围或者告警区域，这种写法非常常见。

## 六、监听鼠标点击并读取坐标

CesiumJS 的交互能力很强，最基础的就是点击拾取。下面这个示例会先判断有没有点中实体，如果没有，再把点击位置转成经纬度：

```js
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);

    if (Cesium.defined(pickedObject) && pickedObject.id) {
        console.log("点击到了实体：", pickedObject.id.name);
        return;
    }

    const cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid,
    );

    if (!cartesian) {
        return;
    }

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);

    console.log(`点击坐标：${longitude}, ${latitude}`);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
```

这个例子在做地图选点、位置标注、轨迹编辑时都很实用。

## 七、加载 GeoJSON 数据

如果你已经有现成的矢量数据，CesiumJS 可以直接加载 GeoJSON。比如把文件放在 `public/data/shanghai.geojson`，然后这样写：

```js
Cesium.GeoJsonDataSource.load("/data/shanghai.geojson", {
    clampToGround: true,
    stroke: Cesium.Color.YELLOW,
    fill: Cesium.Color.YELLOW.withAlpha(0.25),
    strokeWidth: 2,
}).then((dataSource) => {
    viewer.dataSources.add(dataSource);
    viewer.zoomTo(dataSource);
});
```

这种方式很适合快速把行政区、边界、站点分布等数据接进来。

## 八、坐标转换的基础写法

在 CesiumJS 里，经纬度和笛卡尔坐标之间经常要来回转换。最常见的基础写法如下：

```js
const cartesian = Cesium.Cartesian3.fromDegrees(116.391, 39.907, 100);
const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

const longitude = Cesium.Math.toDegrees(cartographic.longitude);
const latitude = Cesium.Math.toDegrees(cartographic.latitude);
const height = cartographic.height;

console.log(longitude, latitude, height);
```

只要你做的是地图开发，这段代码几乎迟早会用到。

## 九、几个容易踩坑的地方

- 记得引入 `widgets.css`，否则界面样式会异常。
- `fromDegrees` 的顺序是经度、纬度、高度，不是纬度、经度。
- 如果你在 Vue、React 或其他框架里使用 CesiumJS，记得在组件卸载时销毁 `Viewer` 和事件处理器。
- 如果项目里找不到静态资源，优先检查 `vite-plugin-cesium` 是否安装并启用。

## 十、总结

CesiumJS 的入门重点并不复杂：先装好依赖，再搞定 Viewer 初始化，然后逐步掌握实体、线面、点击拾取和数据加载。

如果你只是想做一个能展示三维地球和基础矢量数据的页面，这篇文章里的几个示例已经足够你搭起第一个 CesiumJS 页面了。后续你还可以继续学习 3D Tiles、模型加载、轨迹动画和空间分析能力。
