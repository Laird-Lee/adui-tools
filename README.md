<div align="center">
  <a href="https://github.com/Laird-Lee/adui-tools">
    <img alt="ADui Tools Logo" width="215" src="https://github.com/Laird-Lee/adui-tools/blob/main/public/logo.svg">
  </a>
  <h1>ADui Tools</h1>
  <p>在线实用工具集合</p>

[![license](https://img.shields.io/github/license/Laird-Lee/adui-tools.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)

</div>

## 当前进度

目前已上线的工具：
- JSON 转 Dart 数据模型
    - 输入 JSON，一键生成 Dart 数据模型（支持可选 `@JsonSerializable()`）
    - 支持类型推断（int/double/bool/String/null、List、嵌套对象）
    - 自动生成 fromJson / toJson（可切换为手写或 `json_serializable` 版本）
    - 可配置文件名、类名，内置 `JetBrains Mono` 代码编辑主题
    - 代码编辑器：基于 `monaco-editor`，支持行号、自动换行、复制代码

即将上线（Roadmap）：
- JSON 格式化/校验/压缩
- Dart/TypeScript 数据模型互转
- 正则表达式测试
- 时间戳/日期格式化
- 字符串编码/解码（Base64/URL/Unicode）
- Diff/内容对比

欢迎在 Issues 中提交你想要的工具，或提出改进建议。

## 在线体验

- 项目地址（GitHub）：https://github.com/Laird-Lee/adui-tools
- 本地运行请参考下方“本地开发”

## 本地开发

环境要求：
- Node.js: ^20.19.0 或 ≥22.12.0
- 包管理：pnpm（推荐）或 npm

安装依赖：
```shell
pnpm install
```

开发启动：
```shell
pnpm dev
```

构建生产包：
```shell
pnpm build
```

预览构建产物：
```shell
pnpm preview
```

代码检查与格式化：
```shell
pnpm lint

pnpm format
```

## 使用说明（JSON 转 Dart 数据模型）

- 左侧输入 JSON 内容
- 配置文件名和类名（支持从文件名自动推导类名）
- 选择是否需要 `@JsonSerializable()`
- 点击转换，即可在右侧得到 Dart 代码
- 可点击“复制”按钮快速复制到剪贴板

进阶提示：
- 若仅需要手写的 fromJson/toJson，可关闭 `@JsonSerializable()` 选项
- 若选择 `@JsonSerializable()`，请确保你的 `Flutter` 项目已安装相关依赖，并使用 `build_runner` 生成代码

## 技术栈

- 前端框架：`Vue 3`（Composition API）
- 组件库：`TDesign Vue Next`
- 路由：`Vue Router` 4
- 状态：`Pinia` + `pinia-plugin-persistedstate`
- 构建工具：`Vite`
- 代码编辑器：`monaco-editor`（自定义 JetBrains 风格主题）
- 工具与工程化：`ESLint` + `Prettier` + `TypeScript` + `UnoCSS`


## 主题与动画

- 支持亮/暗主题，跟随系统或手动切换
- 页面与编辑器参与 View Transitions 动画，切换更丝滑