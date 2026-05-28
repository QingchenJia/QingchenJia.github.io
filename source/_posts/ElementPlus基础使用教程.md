---
title: ElementPlus基础使用教程
typora-root-url: ElementPlus基础使用教程
date: 2026-05-28 19:09:11
categories:
    - 前端开发
tags:
    - Vue3
    - ElementPlus
    - 组件库
---

## 前言

Element Plus 是面向 Vue 3 的桌面端组件库，适合快速搭建后台管理系统、数据看板、表单页面和常规业务系统。它提供了按钮、表单、表格、弹窗、分页、上传、消息提示等常用组件，能减少重复 UI 开发工作。

本文以 Vue 3 的 `<script setup>` 写法为主，介绍 Element Plus 的基础安装、项目引入方式，以及真实项目中最常用的一批组件。

## 一、安装 Element Plus

如果项目已经使用 Vite 创建，可以直接安装依赖：

```bash
npm install element-plus
```

如果需要使用图标组件，建议同时安装官方图标包：

```bash
npm install @element-plus/icons-vue
```

## 二、在 Vue3 项目中引入

### 1. 全量引入

全量引入最简单，适合后台系统、学习项目或对首屏体积要求不高的场景。

```js
// main.js
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus);
app.mount("#app");
```

如果使用 TypeScript，文件名通常是 `main.ts`，写法基本一致。

### 2. 按需引入

正式项目中更推荐按需引入。常见做法是使用自动导入插件，让组件和样式在构建时自动处理：

```bash
npm install unplugin-vue-components unplugin-auto-import -D
```

然后配置 `vite.config.js`：

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
});
```

配置完成后，在组件中可以直接使用 `<el-button>`、`<el-table>` 等标签，不需要逐个手动导入。

## 三、Button 按钮

按钮用于触发操作，例如提交、保存、删除、搜索。常用属性有 `type`、`plain`、`round`、`circle`、`disabled` 和 `loading`。

```vue
<template>
    <el-button>默认按钮</el-button>
    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>

    <el-button type="primary" plain>朴素按钮</el-button>
    <el-button type="primary" round>圆角按钮</el-button>
    <el-button type="primary" :loading="saving">保存中</el-button>
</template>

<script setup>
import { ref } from "vue";

const saving = ref(false);
</script>
```

按钮的 `type` 通常用于表达操作语义，不建议为了颜色随意使用。比如删除操作适合用 `danger`，提交主操作适合用 `primary`。

## 四、Input 输入框

`el-input` 是最常用的表单输入组件，通常配合 `v-model` 使用。

```vue
<template>
    <el-input v-model="keyword" placeholder="请输入关键词" clearable />

    <el-input
        v-model="description"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入描述"
    />
</template>

<script setup>
import { ref } from "vue";

const keyword = ref("");
const description = ref("");
</script>
```

常用属性说明：

| 属性              | 作用             |
| ----------------- | ---------------- |
| `placeholder`     | 输入提示文本     |
| `clearable`       | 显示清空按钮     |
| `type="textarea"` | 多行文本输入     |
| `maxlength`       | 限制最大输入长度 |
| `show-word-limit` | 显示字数统计     |

## 五、Select 选择器

`el-select` 用于从固定选项中选择一个或多个值。基础用法是 `el-select` 搭配 `el-option`。

```vue
<template>
    <el-select
        v-model="status"
        placeholder="请选择状态"
        clearable
        style="width: 240px"
    >
        <el-option label="全部" value="" />
        <el-option label="启用" value="enabled" />
        <el-option label="停用" value="disabled" />
    </el-select>

    <el-select
        v-model="roles"
        multiple
        collapse-tags
        placeholder="请选择角色"
        style="width: 240px"
    >
        <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
    </el-select>
</template>

<script setup>
import { ref } from "vue";

const status = ref("");
const roles = ref([]);

const roleOptions = [
    { label: "管理员", value: "admin" },
    { label: "运营人员", value: "operator" },
    { label: "访客", value: "guest" },
];
</script>
```

多选时 `v-model` 应该绑定数组；单选时通常绑定字符串、数字或布尔值。

## 六、Form 表单与校验

`el-form` 适合收集和校验用户输入。常见结构是 `el-form` 包裹多个 `el-form-item`，每个表单项内部放置输入组件。

```vue
<template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
            <el-select
                v-model="form.status"
                placeholder="请选择状态"
                style="width: 240px"
            >
                <el-option label="启用" value="enabled" />
                <el-option label="停用" value="disabled" />
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="submitForm">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

const formRef = ref();

const form = reactive({
    username: "",
    email: "",
    status: "enabled",
});

const rules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: "blur" },
    ],
    status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const submitForm = async () => {
    await formRef.value.validate();
    ElMessage.success("表单校验通过");
};

const resetForm = () => {
    formRef.value.resetFields();
};
</script>
```

`prop` 必须和 `model` 中的字段对应，否则该表单项无法正确校验和重置。

## 七、Table 表格

`el-table` 常用于展示列表数据，`el-table-column` 用于定义列。

```vue
<template>
    <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
                <el-tag :type="row.status === '启用' ? 'success' : 'info'">
                    {{ row.status }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
            <template #default="{ row }">
                <el-button type="primary" link @click="editRow(row)"
                    >编辑</el-button
                >
                <el-button type="danger" link @click="deleteRow(row)"
                    >删除</el-button
                >
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";

const tableData = ref([
    { id: 1, name: "张三", department: "研发部", status: "启用" },
    { id: 2, name: "李四", department: "运营部", status: "停用" },
]);

const editRow = (row) => {
    ElMessage.info(`编辑：${row.name}`);
};

const deleteRow = async (row) => {
    await ElMessageBox.confirm(`确认删除 ${row.name} 吗？`, "提示");
    ElMessage.success("删除成功");
};
</script>
```

表格中经常会使用插槽自定义内容，比如状态标签、操作按钮、图片预览和格式化后的日期。

## 八、Pagination 分页

分页通常和表格一起使用。建议使用 `v-model:current-page` 和 `v-model:page-size` 进行双向绑定。

```vue
<template>
    <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="page.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @change="loadData"
    />
</template>

<script setup>
import { reactive } from "vue";

const page = reactive({
    current: 1,
    size: 10,
    total: 126,
});

const loadData = () => {
    console.log("重新加载数据", page.current, page.size);
};
</script>
```

当 `layout` 中包含 `sizes` 时，需要同时维护当前页码和每页条数。真实项目中，`loadData` 一般会调用后端接口。

## 九、Dialog 弹窗

`el-dialog` 适合承载表单、确认信息或详情内容。它通过 `v-model` 控制显示与隐藏。

```vue
<template>
    <el-button type="primary" @click="dialogVisible = true">新增用户</el-button>

    <el-dialog v-model="dialogVisible" title="新增用户" width="500px">
        <el-form :model="form" label-width="80px">
            <el-form-item label="姓名">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="部门">
                <el-input v-model="form.department" />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveUser">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

const dialogVisible = ref(false);

const form = reactive({
    name: "",
    department: "",
});

const saveUser = () => {
    dialogVisible.value = false;
    ElMessage.success("保存成功");
};
</script>
```

`footer` 插槽通常放置取消、确认等操作按钮。复杂表单弹窗建议配合表单校验后再关闭。

## 十、DatePicker 日期选择器

日期选择器常用于筛选条件、表单提交和报表查询。

```vue
<template>
    <el-date-picker
        v-model="date"
        type="date"
        placeholder="选择日期"
        value-format="YYYY-MM-DD"
    />

    <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
    />
</template>

<script setup>
import { ref } from "vue";

const date = ref("");
const dateRange = ref([]);
</script>
```

`value-format` 用于控制绑定值的格式。如果不设置，绑定值通常是 `Date` 对象；设置后更便于直接传给接口。

## 十一、Upload 上传

`el-upload` 用于文件上传。真实项目中，`action` 一般填写后端上传接口地址。

```vue
<template>
    <el-upload
        v-model:file-list="fileList"
        action="/api/files/upload"
        :limit="3"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
    >
        <el-button type="primary">点击上传</el-button>
        <template #tip>
            <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 2MB。
            </div>
        </template>
    </el-upload>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";

const fileList = ref([]);

const beforeUpload = (file) => {
    const isImage = ["image/jpeg", "image/png"].includes(file.type);
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error("只能上传 jpg/png 文件");
        return false;
    }

    if (!isLt2M) {
        ElMessage.error("文件大小不能超过 2MB");
        return false;
    }

    return true;
};

const handleSuccess = () => {
    ElMessage.success("上传成功");
};
</script>
```

如果后端需要鉴权，可以通过 `headers` 传入 Token；如果需要手动上传，可以设置 `:auto-upload="false"` 并调用组件实例的 `submit()` 方法。

## 十二、Message 与 MessageBox

消息提示适合反馈操作结果，确认框适合二次确认高风险操作。

```vue
<template>
    <el-button type="success" @click="showSuccess">保存成功</el-button>
    <el-button type="danger" @click="confirmDelete">删除</el-button>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";

const showSuccess = () => {
    ElMessage.success("保存成功");
};

const confirmDelete = async () => {
    try {
        await ElMessageBox.confirm("删除后不可恢复，确认继续吗？", "删除确认", {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
        });

        ElMessage.success("删除成功");
    } catch {
        ElMessage.info("已取消删除");
    }
};
</script>
```

`ElMessage` 更适合轻量反馈，`ElMessageBox.confirm` 更适合删除、发布、下线等需要用户确认的操作。

## 十三、常见使用建议

- 项目初期可以全量引入，正式项目建议使用自动按需引入。
- 表单组件统一使用 `v-model` 管理数据，复杂表单使用 `reactive` 更方便。
- 表单校验中，`el-form-item` 的 `prop` 要和数据字段保持一致。
- 表格操作列建议使用插槽，不要把复杂展示逻辑写进原始数据。
- 日期传给后端前，优先用 `value-format` 统一格式。
- 删除、停用、发布等高风险操作，建议配合 `ElMessageBox.confirm`。

## 总结

Element Plus 的入门重点是掌握组件的组合方式：用 `el-form` 收集数据，用 `el-table` 展示列表，用 `el-pagination` 控制分页，用 `el-dialog` 承载复杂操作，再用 `ElMessage` 和 `ElMessageBox` 完成反馈与确认。

当这些基础组件熟悉以后，就可以继续学习布局组件、菜单导航、树形控件、级联选择器、抽屉、标签页等更适合后台系统的高级组件。

## 参考文档

- [Element Plus Installation](https://element-plus.org/en-US/guide/installation)
- [Element Plus Quick Start](https://element-plus.org/en-US/guide/quickstart)
- [Element Plus Components](https://element-plus.org/en-US/component/button)
