<script setup lang="ts">
import type { FormInstanceFunctions, FormProps } from 'tdesign-vue-next'

const jsonStr = ref<string>('')
const dartStr = ref<string>('')

const classFormRef = ref<FormInstanceFunctions | null>(null)
const classForm = ref({
  fileName: '',
  className: '',
  needJsonSerializable: true,
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

// ---------------- 工具：JSON <-> Dart 代码生成 ----------------
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
        buildClass(className, v, classes, used, undefined, classForm.value.needJsonSerializable)
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

// ---------- 渲染（可选 @JsonSerializable） ----------
function renderRootClass(
  className: string,
  fields: FieldMeta[],
  fileBase: string,
  needAnno: boolean,
): string {
  const header = needAnno
    ? `import 'package:json_annotation/json_annotation.dart';

part '${fileBase}.g.dart';`
    : `// 可选：如需使用 json_serializable，请开启选项并确保依赖已添加`

  const deco = needAnno ? '@JsonSerializable()' : ''

  const fieldDecls = fields
    .map((f) => {
      const jsonKeyLine = needAnno && f.needsJsonKey ? `  @JsonKey(name: '${f.jsonKey}')\n` : ''
      return `${jsonKeyLine}  final ${f.type} ${f.dartName};`
    })
    .join('\n')

  const ctorParams = fields
    .map((f) => (f.nullable ? `    this.${f.dartName},` : `    required this.${f.dartName},`))
    .join('\n')

  const fromJson = needAnno
    ? `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`
    : renderManualFromJsonSig(className) +
      '\n' +
      indent(renderManualFromJsonBody(className, fields), 2)
  const toJson = needAnno
    ? `  Map<String, dynamic> toJson() => _$${className}ToJson(this);`
    : renderManualToJsonSig() + '\n' + indent(renderManualToJsonBody(fields), 2)

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

function renderNestedClass(className: string, fields: FieldMeta[], needAnno: boolean): string {
  const deco = needAnno ? '@JsonSerializable()' : ''

  const fieldDecls = fields
    .map((f) => {
      const jsonKeyLine = needAnno && f.needsJsonKey ? `  @JsonKey(name: '${f.jsonKey}')\n` : ''
      return `${jsonKeyLine}  final ${f.type} ${f.dartName};`
    })
    .join('\n')

  const ctorParams = fields
    .map((f) => (f.nullable ? `    this.${f.dartName},` : `    required this.${f.dartName},`))
    .join('\n')

  const fromJson = needAnno
    ? `  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`
    : renderManualFromJsonSig(className) +
      '\n' +
      indent(renderManualFromJsonBody(className, fields), 2)
  const toJson = needAnno
    ? `  Map<String, dynamic> toJson() => _$${className}ToJson(this);`
    : renderManualToJsonSig() + '\n' + indent(renderManualToJsonBody(fields), 2)

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

// ---------- 手写 fromJson / toJson ----------
function renderManualFromJsonSig(className: string) {
  return `  factory ${className}.fromJson(Map<String, dynamic> json) {`
}
function renderManualToJsonSig() {
  return `  Map<String, dynamic> toJson() {`
}
function renderManualFromJsonBody(className: string, fields: FieldMeta[]) {
  const lines: string[] = []
  lines.push(`return ${className}(`)
  for (const f of fields) {
    const key = f.needsJsonKey ? f.jsonKey : f.dartName
    lines.push(`  ${f.dartName}: ${manualFromJsonValue(f, key)},`)
  }
  lines.push(`);`)
  lines.push(`}`)
  return lines.join('\n')
}
function renderManualToJsonBody(fields: FieldMeta[]) {
  const lines: string[] = []
  lines.push(`return {`)
  for (const f of fields) {
    const key = f.needsJsonKey ? f.jsonKey : f.dartName
    lines.push(`  '${key}': ${manualToJsonValue(f)},`)
  }
  lines.push(`};`)
  lines.push(`}`)
  return lines.join('\n')
}
function isPrimitiveDartBase(t: string): boolean {
  return t === 'int' || t === 'double' || t === 'bool' || t === 'String' || t === 'dynamic'
}
function manualToJsonValue(f: FieldMeta): string {
  const base = f.baseType
  if (base.startsWith('List<')) {
    const inner = base.slice(5, -1)
    if (isPrimitiveDartBase(inner)) return f.dartName
    return `${f.dartName}${f.type.endsWith('?') ? '?.' : '.'}map((e) => e.toJson()).toList()`
  }
  if (!isPrimitiveDartBase(base)) {
    return `${f.dartName}${f.type.endsWith('?') ? '?.toJson()' : '.toJson()'}`
  }
  return f.dartName
}
function manualFromJsonValue(f: FieldMeta, key: string): string {
  const base = f.baseType
  const access = `json['${key}']`
  if (base.startsWith('List<')) {
    const inner = base.slice(5, -1)
    if (isPrimitiveDartBase(inner)) {
      return `${access} is List? List<${inner}>.from(${access}) : <${inner}>[]`
    } else {
      return `${access} is List? (${access} as List).map((e) => ${inner}.fromJson(Map<String, dynamic>.from(e as Map))).toList() : <${inner}>[]`
    }
  }
  if (!isPrimitiveDartBase(base)) {
    return `${access} == null ? null : ${base}.fromJson(Map<String, dynamic>.from(${access} as Map))`
  }
  switch (base) {
    case 'int':
      return `(${access} is int) ? ${access} as int : (${access} is num ? (${access} as num).toInt() : (int.tryParse(${access}?.toString() ?? '') ))`
    case 'double':
      return `(${access} is double) ? ${access} as double : (${access} is num ? (${access} as num).toDouble() : (double.tryParse(${access}?.toString() ?? '') ))`
    case 'bool':
      return `(${access} is bool) ? ${access} as bool : (${access}?.toString() == 'true')`
    case 'String':
      return `${access}?.toString()`
    default:
      return access
  }
}
function indent(s: string, n = 2) {
  const pad = ' '.repeat(n)
  return s
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n')
}

// ---------- 构建类 ----------
function buildClass(
  className: string,
  data: Json,
  classes: string[],
  used: Set<string>,
  fileBaseForRoot?: string,
  needAnno = true,
) {
  if (Array.isArray(data)) {
    const inf = analyzeListType(data, used, classes, className + 'Item')
    const fields: FieldMeta[] = [
      {
        jsonKey: 'items',
        dartName: 'items',
        type: inf.baseType, // 对数组根场景，可直接用 List<...>
        baseType: inf.baseType,
        nullable: false,
        needsJsonKey: false,
      },
    ]
    classes.push(renderNestedClass(className, fields, needAnno))
    return
  }
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
    classes.push(renderNestedClass(className, fields, needAnno))
    return
  }
  const fields = collectFields(data, used, classes, className)
  if (fileBaseForRoot) {
    classes.push(renderRootClass(className, fields, fileBaseForRoot, needAnno))
  } else {
    classes.push(renderNestedClass(className, fields, needAnno))
  }
}

function generateDartFromJson(
  jsonStrLocal: string,
  rootClass: string,
  fileNameBase: string,
  needAnno: boolean,
): string {
  const data = tryParseJson(jsonStrLocal)
  if (typeof data === 'undefined') {
    return `// JSON 解析失败，请检查输入`
  }
  const used = new Set<string>()
  const classes: string[] = []
  const rootName = uniqueClassName(pascal(rootClass), used)
  buildClass(rootName, data as Json, classes, used, fileNameBase, needAnno)
  const rootWithHeader = classes.pop()!
  return [rootWithHeader, ...classes].join('\n\n')
}

// ---------------- 生成：jsonStr -> dartStr ----------------
const handleToDart = async () => {
  const valid = await classFormRef.value?.validate()
  if (valid !== true) return
  if (!jsonStr.value?.trim()) {
    dartStr.value = `// 请输入 JSON`
    return
  }
  const fileBase = classForm.value.fileName.replace(/\.dart$/i, '')
  const cls = classForm.value.className || pascal(fileBase || 'Root')
  dartStr.value = generateDartFromJson(
    jsonStr.value,
    cls,
    fileBase,
    classForm.value.needJsonSerializable,
  )
}

// ---------------- 反向：dartStr/jsonStr -> jsonStr（智能处理） ----------------
/*
  规则：
  - 若 jsonStr 非空：尝试解析并美化为 2 空格缩进
  - 若 jsonStr 为空且 dartStr 非空：从 dart 类（首个 class）中提取字段，生成一个 JSON 骨架
*/
const handleToJson = () => {
  const raw = jsonStr.value?.trim()
  if (raw) {
    const parsed = tryParseJson(raw)
    if (typeof parsed === 'undefined') {
      // 保持原文，提示
      jsonStr.value = `// JSON 解析失败，请检查输入\n` + raw
      return
    }
    jsonStr.value = JSON.stringify(parsed, null, 2)
    return
  }

  const dart = dartStr.value?.trim()
  if (!dart) {
    jsonStr.value = '// 没有可转换的内容'
    return
  }

  // 粗略解析 Dart 类字段（首个 class）
  const classMatch = dart.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\n}/m)
  if (!classMatch) {
    jsonStr.value = '// 未找到 Dart 类定义'
    return
  }
  const body = classMatch[2]
  // 捕获形如：@JsonKey(name: 'xxx') 可选行 + final Type? name;
  const fieldRegex =
    /(?:@JsonKey\s*\(\s*name\s*:\s*'([^']+)'\s*\)\s*)?\s*final\s+([A-Za-z0-9_<>?]+)\s+([A-Za-z_][A-Za-z0-9_]*)\s*;/g
  const obj: Record<string, unknown> = {}
  let m: RegExpExecArray | null
  while ((m = fieldRegex.exec(body))) {
    const jsonKey = m[1] || m[3]
    const type = m[2].replace(/\?$/, '')
    obj[jsonKey] = defaultValueByType(type)
  }
  jsonStr.value = JSON.stringify(obj, null, 2)
}

function defaultValueByType(t: string): unknown {
  if (/^List<.*>$/.test(t)) return []
  if (t === 'int' || t === 'double') return 0
  if (t === 'bool') return false
  if (t === 'String') return ''
  if (t === 'dynamic') return null
  // 自定义类 -> 用对象骨架占位
  return {}
}
</script>

<template>
  <div class="w-full container-h">
    <div class="h-full flex items-center justify-between">
      <div class="w-670px h-full flex flex-col gap-20px">
        <t-form
          ref="classFormRef"
          :data="classForm"
          :rules="rules"
          label-align="top"
          :required-mark="false"
        >
          <t-row :gutter="[20, 20]">
            <t-col :span="4">
              <t-form-item label="文件名称" name="fileName" tips="例：repair_list_response.dart">
                <t-input
                  v-model="classForm.fileName"
                  placeholder="请输入文件名称"
                  clearable
                  @blur="fileNameToClassName"
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="实现类名" name="className" tips="例：RepairListResponse">
                <t-input v-model="classForm.className" placeholder="请输入要实现的类名" clearable />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="是否需要@JsonSerializable()" name="needJsonSerializable">
                <t-radio-group v-model="classForm.needJsonSerializable">
                  <t-radio :value="true">是</t-radio>
                  <t-radio :value="false">否</t-radio>
                </t-radio-group>
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
        <t-button block variant="outline" @click="handleToJson">
          <template #icon>
            <t-icon name="arrow-left" />
          </template>
        </t-button>
      </div>
      <div class="w-670px h-full flex flex-col">
        <code-editor v-model="dartStr" language="dart" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
