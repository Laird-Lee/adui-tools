## 一、功能简介
- 将左侧 JSON 一键生成右侧 Dart 数据模型代码。
- 可选使用 `@JsonSerializable()`（需在你的 Flutter 项目中配套依赖与代码生成）。

## 二、前置准备
- 文件名称：用于生成 `part 'xxx.g.dart'` 的文件基名（例如：`repair_list_response.dart`）。
- 实现类名：最终生成的 Dart 类名（可由文件名自动推导）。
- JSON 内容：粘贴合法 JSON（支持对象、数组、嵌套、可空类型等）。

## 三、基础用法
1. 输入“文件名称”（如 `repair_list_response.dart`），失焦后自动生成“实现类名”（`RepairListResponse`），可手动修改。
2. 将接口返回 JSON 粘贴到左侧编辑器。
3. 选择是否需要 `@JsonSerializable()`：
    - 是：生成包含注解与 `part` 的代码，配合 `json_serializable` 使用。
    - 否：生成自带手写 `fromJson/toJson` 的纯 Dart 类。

4. 点击中间“→”按钮，右侧生成 Dart 代码；可点击编辑器右上角“复制”按钮复制。

## 四、进阶技巧
- 字段命名：自动将 JSON 的下划线/短横线键名转换为 Dart 风格的 `camelCase`；原键名在选择注解时通过 `@JsonKey(name: 'xxx')` 保留映射。
- 数组推断：根据首个非 null 元素推断 `List<T>` 类型；若元素不一致或为空数组，则回退为 `List<dynamic>`。
- 可空类型：若字段值可能为 `null`，会在类型后追加 `?`（如 `String?`）。
- 反向生成功能“←”：当左侧为空时，可从右侧 Dart 类大致还原一个 JSON 骨架，便于 mock 数据。

## 五、在 Flutter 项目中使用（选择 `@JsonSerializable()` 时）
在 `pubspec.yaml` 添加依赖：
``` yaml
dependencies:
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.9.0
```
执行代码生成：
``` bash
flutter pub run build_runner build --delete-conflicting-outputs
```
## 六、常见问题
- 构建找不到 `.g.dart`：
    - 确认文件名与 `part 'xxx.g.dart'` 一致，并执行 `build_runner`。

- JSON 粘贴失败：
    - 先在左侧点击“←”按钮可生成示例骨架，或使用 JSON 校验工具检查格式。

- 类型不匹配：
    - 若接口字段类型不稳定（如 number/string 混用），建议手动将生成结果中的类型调整为更宽泛的 `dynamic` 或 `String`。

## 七、快捷键
- 复制代码：点击编辑器右上角“复制”，或手动全选（Ctrl/⌘ + A）后复制（Ctrl/⌘ + C）。
