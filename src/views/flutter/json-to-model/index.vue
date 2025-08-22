<script setup lang="ts">
import type { FormInstanceFunctions, FormProps } from 'tdesign-vue-next'

const jsonStr = ref<string>('')
const dartStr = ref<string>('')

const classFormRef = ref<FormInstanceFunctions | null>(null)
const classForm = ref({
  fileName: '',
  className: '',
})

const rules: FormProps['rules'] = {
  fileName: [{ required: true, message: '请输入文件名称！', trigger: 'blur' }],
  className: [{ required: true, message: '请输入要实现的类名！', trigger: 'blur' }],
}

const fileNameToClassName = () => {
  if (!classForm.value.fileName) return
  classForm.value.className = toClassName(classForm.value.fileName)
}

function toClassName(fileName: string) {
  const name = fileName.replace(/\.dart$/, '')
  return name
    .split('_')
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

// ---------------- 工具：JSON -> Dart 代码生成（带 @JsonSerializable） ----------------
type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

function pascal(name: string): string {
  return (
    name
      .replace(/\.dart$/i, '')
      .replace(/[_\-\s]+/g, ' ')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') || 'Class'
  )
}

function camel(name: string): string {
  const p = name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return p ? p.charAt(0).toLowerCase() + p.slice(1) : 'field'
}

function isPlainObject(v: Json): v is { [k: string]: Json } {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function tryParseJson(str: string): Json | undefined {
  try {
    return JSON.parse(str)
  } catch {
    return undefined
  }
}

function inferNum(n: number): 'int' | 'double' {
  return Number.isInteger(n) ? 'int' : 'double'
}

type FieldMeta = {
  jsonKey: string
  dartName: string
  type: string // 带可空 ?
  baseType: string // 去掉 ?
  nullable: boolean
  needsJsonKey: boolean
}

function analyzeListType(
  arr: Json[],
  used: Set<string>,
  classes: string[],
  hint: string,
): { type: string; baseType: string; nullable: boolean } {
  if (arr.length === 0) return { type: 'List<dynamic>', baseType: 'dynamic', nullable: false }
  const firstNonNull = arr.find((x) => x !== null)
  if (firstNonNull === undefined)
    return { type: 'List<dynamic>', baseType: 'dynamic', nullable: true }
  const elemType = inferType(firstNonNull, used, classes, hint + 'Item')
  const listNullable = arr.some((x) => x === null) || elemType.nullable
  return {
    type: `List<${elemType.type}>`,
    baseType: `List<${elemType.baseType}>`,
    nullable: listNullable,
  }
}

function inferType(
  v: Json,
  used: Set<string>,
  classes: string[],
  hint: string,
): { type: string; baseType: string; nullable: boolean } {
  if (v === null) return { type: 'dynamic', baseType: 'dynamic', nullable: true }
  const t = typeof v
  switch (t) {
    case 'string':
      return { type: 'String', baseType: 'String', nullable: false }
    case 'number': {
      const b = inferNum(v as number)
      return { type: b, baseType: b, nullable: false }
    }
    case 'boolean':
      return { type: 'bool', baseType: 'bool', nullable: false }
    case 'object':
      if (Array.isArray(v)) {
        return analyzeListType(v as Json[], used, classes, hint)
      }
      if (isPlainObject(v)) {
        const className = uniqueClassName(pascal(hint || 'Object'), used)
        buildClass(className, v, classes, used)
        return { type: className, baseType: className, nullable: false }
      }
      return { type: 'dynamic', baseType: 'dynamic', nullable: false }
    default:
      return { type: 'dynamic', baseType: 'dynamic', nullable: false }
  }
}

function uniqueClassName(base: string, used: Set<string>) {
  let n = base || 'Class'
  let i = 2
  while (used.has(n)) n = `${base}${i++}`
  used.add(n)
  return n
}

function collectFields(
  obj: { [k: string]: Json },
  used: Set<string>,
  classes: string[],
  classNameHint: string,
): FieldMeta[] {
  const metas: FieldMeta[] = []
  for (const key of Object.keys(obj)) {
    const dart = camel(key)
    const val = obj[key]
    const inf = inferType(val, used, classes, classNameHint + pascal(key))
    const nullable = inf.nullable || val === null
    const type = inf.baseType + (nullable ? '?' : '')
    metas.push({
      jsonKey: key,
      dartName: dart,
      type,
      baseType: inf.baseType,
      nullable,
      needsJsonKey: key !== dart,
    })
  }
  return metas
}

function renderClass(className: string, fields: FieldMeta[], fileBase?: string): string {
  const header = fileBase
    ? `import 'package:json_annotation/json_annotation.dart';

part '${fileBase}.g.dart';`
    : `import 'package:json_annotation/json_annotation.dart';`

  const deco = '@JsonSerializable()'

  const fieldDecls = fields
    .map((f) => {
      const jsonKeyLine = f.needsJsonKey ? `  @JsonKey(name: '${f.jsonKey}')\n` : ''
      return `${jsonKeyLine}  final ${f.type} ${f.dartName};`
    })
    .join('\n')

  const ctorParams = fields
    .map((f) => (f.nullable ? `    this.${f.dartName},` : `    required this.${f.dartName},`))
    .join('\n')

  const fromJson = `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`
  const toJson = `  Map<String, dynamic> toJson() => _$${className}ToJson(this);`

  return `${header}

${deco}
class ${className} {
${fieldDecls}

  ${className}({
${ctorParams}
  });

${fromJson}

${toJson}
}`
}

function renderNestedClass(className: string, fields: FieldMeta[]): string {
  const deco = '@JsonSerializable()'

  const fieldDecls = fields
    .map((f) => {
      const jsonKeyLine = f.needsJsonKey ? `  @JsonKey(name: '${f.jsonKey}')\n` : ''
      return `${jsonKeyLine}  final ${f.type} ${f.dartName};`
    })
    .join('\n')

  const ctorParams = fields
    .map((f) => (f.nullable ? `    this.${f.dartName},` : `    required this.${f.dartName},`))
    .join('\n')

  const fromJson = `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`
  const toJson = `  Map<String, dynamic> toJson() => _$${className}ToJson(this);`

  return `${deco}
class ${className} {
${fieldDecls}

  ${className}({
${ctorParams}
  });

${fromJson}

${toJson}
}`
}

function buildClass(
  className: string,
  data: Json,
  classes: string[],
  used: Set<string>,
  fileBaseForRoot?: string,
) {
  // 根为数组：包装 items 字段
  if (Array.isArray(data)) {
    const inf = analyzeListType(data, used, classes, className + 'Item')
    const fields: FieldMeta[] = [
      {
        jsonKey: 'items',
        dartName: 'items',
        type: inf.type,
        baseType: inf.baseType,
        nullable: false,
        needsJsonKey: false,
      },
    ]
    classes.push(renderNestedClass(className, fields))
    return
  }
  // 单值包装
  if (!isPlainObject(data)) {
    const inf = inferType(data, used, classes, className + 'Value')
    const fields: FieldMeta[] = [
      {
        jsonKey: 'value',
        dartName: 'value',
        type: inf.baseType + (inf.nullable ? '?' : ''),
        baseType: inf.baseType,
        nullable: inf.nullable,
        needsJsonKey: false,
      },
    ]
    classes.push(renderNestedClass(className, fields))
    return
  }
  const fields = collectFields(data, used, classes, className)
  // 根类带上 import/part，子类不重复 import/part
  if (fileBaseForRoot) {
    classes.push(renderClass(className, fields, fileBaseForRoot))
  } else {
    classes.push(renderNestedClass(className, fields))
  }
}

function generateDartFromJson(
  jsonStrLocal: string,
  rootClass: string,
  fileNameBase: string,
): string {
  const data = tryParseJson(jsonStrLocal)
  if (typeof data === 'undefined') {
    return `// JSON 解析失败，请检查输入`
  }
  const used = new Set<string>()
  const classes: string[] = []
  const rootName = uniqueClassName(pascal(rootClass), used)

  // 先构建依赖类，最后压入根类（buildClass 内部会根据遇到的对象先递归构建）
  buildClass(rootName, data as Json, classes, used, fileNameBase)

  // 将根类放在最后一段（有 import/part）
  // 当前实现：root 已带 header，其他类不带；按照构建顺序 classes 已包含所有类
  // 我们把带 import 的类放在最上面，其余类跟在后面
  const rootWithHeader = classes.pop()!
  return [rootWithHeader, ...classes].join('\n\n')
}

// ---------------- 生成按钮：jsonStr -> dartStr ----------------
const handleToDart = async () => {
  const valid = await classFormRef.value?.validate()
  if (valid !== true) return
  if (!jsonStr.value?.trim()) {
    dartStr.value = `// 请输入 JSON`
    return
  }
  const fileBase = classForm.value.fileName.replace(/\.dart$/i, '')
  const cls = classForm.value.className || pascal(fileBase || 'Root')
  dartStr.value = generateDartFromJson(jsonStr.value, cls, fileBase)
}
</script>

<template>
  <div class="w-full container-h">
    <div class="h-full flex items-center justify-between">
      <div class="w-690px h-full flex flex-col gap-20px">
        <t-form ref="classFormRef" :data="classForm" :rules="rules" label-align="top">
          <t-row :gutter="[20, 20]">
            <t-col :span="6">
              <t-form-item label="文件名称" name="fileName" tips="例子：repair_list_response.dart">
                <t-input
                  v-model="classForm.fileName"
                  placeholder="请输入文件名称"
                  clearable
                  @blur="fileNameToClassName"
                />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="实现类名" name="className" tips="例子：RepairListResponse">
                <t-input v-model="classForm.className" placeholder="请输入要实现的类名" clearable />
              </t-form-item>
            </t-col>
          </t-row>
        </t-form>
        <code-editor v-model="jsonStr" language="json" />
      </div>
      <div class="flex flex-col items-center gap-20px">
        <t-button block variant="outline" @click="handleToDart">
          <template #icon>
            <t-icon name="arrow-right" />
          </template>
        </t-button>
        <t-button block variant="outline">
          <template #icon>
            <t-icon name="arrow-left" />
          </template>
        </t-button>
      </div>
      <div class="w-690px h-full flex flex-col">
        <code-editor v-model="dartStr" language="dart" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
