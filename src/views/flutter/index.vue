<script setup lang="ts">
import { JumpIcon } from 'tdesign-icons-vue-next'
</script>

<template>
  <router-view v-slot="{ Component }">
    <component v-if="Component" :is="Component" />
    <div
      v-else
      class="w-full h-full flex flex-col items-center justify-center gap-20px px-24px py-24px text-center"
    >
      <h2 class="text-24px font-jetbrains font-jetbrains-600">Flutter</h2>

      <div class="max-w-960px text-left leading-7">
        <p class="text-14px text-gray-700 dark:text-gray-300">
          Flutter 是 Google 推出的跨平台 UI 工具包，使用 Dart 语言支持 iOS / Android / Web / 桌面
          多端统一开发。
          它基于自绘引擎（Skia）直接绘制像素，避免传统“平台控件层”的差异，带来一致、流畅、低延迟的用户体验。
        </p>

        <h3 class="mt-16px mb-6px text-16px font-jetbrains-600">核心特性</h3>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>单一代码库多端发布，统一组件体系与一致视觉表现</li>
          <li>高性能渲染（60/120 FPS），自绘控件可定制性强</li>
          <li>热重载开发体验优秀，CI/CD 生态完善</li>
          <li>Widget 组合范式，声明式 UI，易于测试与复用</li>
        </ul>

        <h3 class="mt-16px mb-6px text-16px font-jetbrains-600">适用场景</h3>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>中大型商业应用：需要跨端一致体验与高迭代效率</li>
          <li>工具类与内嵌业务中台：对复杂动画与性能有要求</li>
          <li>活动页/可视化/看板：Web 与移动端同步上线</li>
        </ul>

        <h3 class="mt-16px mb-6px text-16px font-jetbrains-600">学习路线建议</h3>
        <ol class="text-14px text-gray-700 dark:text-gray-300 list-decimal pl-20px">
          <li>入门：Dart 基础、Widget 树、状态管理入门（setState → Provider）</li>
          <li>进阶：路由导航、网络/持久化、国际化、主题/暗色模式</li>
          <li>
            工程化：多环境配置、代码生成（build_runner）、模块化/依赖注入、单元/UI 测试与发布流程
          </li>
        </ol>

        <div class="mt-16px flex gap-12px items-center">
          <t-link
            theme="primary"
            size="medium"
            href="https://flutter.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <template #suffix-icon>
              <jump-icon />
            </template>
            官方网站
          </t-link>
          <t-link
            theme="success"
            size="medium"
            href="https://flutter.cn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <template #suffix-icon>
              <jump-icon />
            </template>
            中文网站
          </t-link>
        </div>

        <h3 class="mt-24px mb-6px text-16px font-jetbrains-600">最佳实践项目案例（推荐栈）</h3>
        <p class="text-14px text-gray-700 dark:text-gray-300">
          目标：构建一个可持续演进、可测试、易协作的企业级应用脚手架，开箱即用的领域分层、状态管理、代码生成与
          CI 支持。
        </p>

        <h4 class="mt-12px mb-6px text-15px font-jetbrains-600">技术选型（精简且实战）</h4>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>状态管理：Riverpod（简单、类型安全、良好可测试性），或 BLoC（事件驱动）</li>
          <li>数据类与不可变：freezed + json_serializable（模式匹配/拷贝/序列化）</li>
          <li>网络层：dio + retrofit（拦截器、超时重试、接口契约化）</li>
          <li>路由：go_router（声明式、深链/守卫支持好）</li>
          <li>本地存储：isar（高性能 NoSQL）或 drift（类型安全 SQL）</li>
          <li>依赖注入：get_it + injectable（解耦、便于测试与替身注入）</li>
          <li>多环境/配置：flutter_dotenv 或 build-time 常量（--dart-define）</li>
          <li>国际化：flutter_localizations + intl（多语言与数字/货币/时间格式）</li>
          <li>规范与质量：flutter_lints + very_good_analysis、dart_code_metrics、logger</li>
          <li>资源生成：flutter_gen（图片/字体/颜色常量化）、build_runner 自动生成</li>
        </ul>

        <h4 class="mt-12px mb-6px text-15px font-jetbrains-600">目录结构（结果示例）</h4>
        <pre class="text-12px overflow-auto rounded bg-[var(--td-bg-color-page)] p-12px">
lib/
  core/
    network/        # dio、retrofit、拦截器、异常映射
    storage/        # isar/drift 封装、缓存策略
    di/             # get_it 注册、injectable 生成
    config/         # 环境、常量、feature flags
    utils/          # 工具/扩展、日志/埋点
  features/
    auth/
      data/         # DTO、API、Repository 实现
      domain/       # 实体/仓储接口、用例（UseCase）
      presentation/ # Pages、Widgets、Riverpod/BLoC
    dashboard/
      data/ domain/ presentation/
    ...
  routes/
    app_router.dart # go_router 配置（守卫、重定向、深链）
  app.dart          # 根 Widget（主题/本地化/路由注入）
  main.dart         # 启动（prod/dev/staging 可分入口）
        </pre>

        <h4 class="mt-12px mb-6px text-15px font-jetbrains-600">关键约定</h4>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>DDD-ish 分层：presentation（UI）/ domain（业务）/ data（数据）清晰划分</li>
          <li>接口契约：Repository 接口在 domain，data 层提供实现，便于 Mock 测试</li>
          <li>模型与序列化：freezed + json_serializable，集中生成，减少手写错误</li>
          <li>错误处理：统一 Failure/Exception 映射，UI 只关心可展示的状态</li>
          <li>主题/国际化：全局 Theme 与 Locale 注入，支持跟随系统与手动切换</li>
        </ul>

        <h4 class="mt-12px mb-6px text-15px font-jetbrains-600">构建与发布</h4>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>代码生成：flutter pub run build_runner watch --delete-conflicting-outputs</li>
          <li>多环境：--dart-define=FLAVOR=prod/dev；路由/接口基地址按环境切换</li>
          <li>CI/CD：分析（dart analyze）→ 测试（flutter test）→ 构建（ipa/apk/web）</li>
        </ul>

        <h4 class="mt-12px mb-6px text-15px font-jetbrains-600">常用优化</h4>
        <ul class="text-14px text-gray-700 dark:text-gray-300 list-disc pl-20px">
          <li>避免过度 rebuild：选择更细粒度的 Provider/Selector 或 BLoC 分片</li>
          <li>图片与字体子集化，减少包体；网络启用缓存与压缩</li>
          <li>Web 场景启用 CanvasKit 时注意包体与首屏；必要时切换 HTML 渲染</li>
        </ul>
      </div>
    </div>
  </router-view>
</template>

<style scoped></style>
