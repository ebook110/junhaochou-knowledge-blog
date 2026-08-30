---
name: JunhaoChou Knowledge Blog
description: 冷静、精确、证据导向的材料研究与工程知识索引。
colors:
  canvas: "var(--site-canvas)"
  surface: "var(--site-surface)"
  surface-muted: "var(--site-surface-muted)"
  ink: "var(--site-ink)"
  ink-soft: "var(--site-ink-soft)"
  muted: "var(--site-muted)"
  faint: "var(--site-faint)"
  line: "var(--site-line)"
  line-strong: "var(--site-line-strong)"
  cobalt: "var(--site-cobalt)"
  cobalt-strong: "var(--site-cobalt-strong)"
  cobalt-soft: "var(--site-cobalt-soft)"
  header: "var(--site-header)"
  code: "var(--site-code)"
  white-on-cobalt: "#ffffff"
typography:
  display:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
    fontSize: "clamp(2.65rem, 5vw, 4.15rem)"
    fontWeight: 730
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 690
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.55rem)"
    fontWeight: 680
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.9
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.03em"
  mono:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
rounded:
  compact: "4px"
  control: "8px"
  panel: "12px"
  pill: "999px"
spacing:
  control-gap: "0.5rem"
  tight: "0.75rem"
  base: "1rem"
  block: "1.25rem"
  panel: "clamp(1.2rem, 2.2vw, 1.75rem)"
  container-gutter: "clamp(1rem, 3vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white-on-cobalt}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "0 1.15rem"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-strong}"
    textColor: "{colors.white-on-cobalt}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.compact}"
    padding: "0 1.15rem"
    height: "46px"
  button-secondary-hover:
    textColor: "{colors.cobalt}"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.compact}"
    size: "44px"
  chip-metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 0.7rem"
    height: "32px"
  card-project:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "{spacing.panel}"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "0.375rem"
    height: "48px"
---

# Design System: JunhaoChou Knowledge Blog

## Overview

**Creative North Star: "Research Index Sheet / 科研索引纸"**

这个系统把站点视为一张持续编订的科研索引纸：冷纸白或深蓝黑底面承载近黑墨/冷纸白正文，细线像表格与测量标记一样组织证据，钴蓝只标记路径、状态和可操作位置。整体语气冷静、精确、证据导向，带有科研编辑感，而不是营销落地页的戏剧性。

信息密度来自清晰的标题层级、表格化分区、窄色阶和紧凑控件。材料拉伸试样轮廓、方法矩阵与账册式列表是这个视觉世界的原生表达；它们帮助读者理解研究路径，但单个页面的 52/48 首屏构图不是全站模板。

**Key Characteristics:**

- 冷纸面与深蓝黑双主题共享同一组语义变量。
- 近黑墨承担阅读，钴蓝路线标记只承担导航与交互强调。
- 细线、低圆角和表格节奏替代装饰性卡片与常态阴影。
- 中文无衬线承担信息层级，等宽体仅标注方法、数据与工程语境。
- 44px 触控目标、明确焦点和减弱动画是系统固有约束。

## Colors

色彩是一套可切换的科研纸面：浅色主题由冷纸白、近黑墨与蓝灰细线组成，深色主题转为深蓝黑底面、冷纸白文字和更亮的钴蓝路线标记。

### Primary

- **钴蓝路线标记** (`var(--site-cobalt)`): 用于当前导航、主动作、链接、焦点轮廓、测量轮廓与状态点；浅色解析为 `#1556c0`，深色解析为 `#80aaff`。
- **深钴蓝路线标记** (`var(--site-cobalt-strong)`): 只用于强调色元素的悬停或更强反馈；浅色解析为 `#0e459f`，深色解析为 `#a9c4ff`。
- **钴蓝淡洗** (`var(--site-cobalt-soft)`): 作为选择、悬停和引用块的低强度底色；浅色解析为 `#e8effd`，深色解析为 `#172b50`。

### Neutral

- **冷纸白 / 深蓝黑画布** (`var(--site-canvas)`): 页面最外层底面；浅色为 `#f7f9fc`，深色为 `#0d1119`。
- **白纸 / 蓝黑纸面** (`var(--site-surface)`): 卡片、控件与对话框表面；浅色为 `#ffffff`，深色为 `#121925`。
- **雾化纸面** (`var(--site-surface-muted)`): 代码片段、表头和低层级分区；浅色为 `#f0f3f7`，深色为 `#182231`。
- **近黑墨 / 冷纸白墨** (`var(--site-ink)`): 标题和最高对比正文；浅色为 `#111827`，深色为 `#f2f5fa`。
- **石墨正文** (`var(--site-ink-soft)`): 长文正文和次级标题；浅色为 `#344054`，深色为 `#d4dbe6`。
- **蓝灰注释** (`var(--site-muted)`): 描述、辅助导航和非主导信息；浅色为 `#596579`，深色为 `#aeb8c7`。
- **淡钢灰标注** (`var(--site-faint)`): 时间、图注、键位和数据标签；浅色为 `#748197`，深色为 `#8b97aa`。
- **蓝灰发丝线** (`var(--site-line)`): 默认边框、分隔线和表格网格；浅色为 `#d9e0ea`，深色为 `#293548`。
- **强化蓝灰线** (`var(--site-line-strong)`): 章节边界和测量线；浅色为 `#a3afc0`，深色为 `#4a5a71`。
- **深蓝黑代码面** (`var(--site-code)`): 代码块的独立阅读表面；浅色为 `#0d1523`，深色为 `#080c13`。

### Named Rules

**The Route Marker Rule.** 钴蓝只标记路径、状态、选择与可操作对象；它不铺成大面积装饰背景。

**The Paired Paper Rule.** 新界面必须使用现有语义变量同时适配冷纸白与深蓝黑主题，不能为单一主题写孤立颜色。

## Typography

**Display Font:** 系统中文无衬线栈（以 `Segoe UI`、`PingFang SC`、`Microsoft YaHei` 和 `Noto Sans CJK SC` 为主要回退）
**Body Font:** 同一系统中文无衬线栈
**Label/Mono Font:** `SFMono-Regular`、Consolas、`Liberation Mono`、Menlo、monospace

**Character:** 单一无衬线家族以字重、负字距和尺度建立稳定的科研编辑层级；等宽体是数据与方法标注层，不承担展示标题。中文标题紧凑有重量，长文正文保持宽松行距与有限行长。

### Hierarchy

- **Display**（字重 `730`，`clamp(2.65rem, 5vw, 4.15rem)`，行高 `1.06`）：用于首页和文章的主陈述，允许分行但保持短而直接。
- **Headline**（字重 `690`，`clamp(1.5rem, 2.5vw, 2rem)`，行高 `1.15`）：用于主要章节标题和索引分区。
- **Title**（字重 `680`，`clamp(1.2rem, 2.2vw, 1.55rem)`，行高 `1.35`）：用于项目卡片与内容单元标题。
- **Body**（字重 `400`，`1.02rem`，行高 `1.9`）：用于技术长文，正文列限制在约 `75ch`；摘要通常更短。
- **Label**（字重 `650`，`0.75rem`，字距 `0.03em`）：用于元数据、状态、分类与控件标签。
- **Mono**（字重 `400`，`0.7rem`，行高 `1.55`）：用于方法名、日期、图注、键位和试样标注。

### Named Rules

**The Evidence Type Rule.** 展示字号用于声明研究对象与文章主题；等宽体只用于证据标注、方法词和工程数据，不模拟终端界面。

## Layout

全站容器最大宽度为 `1280px`，两侧使用响应式沟槽（`clamp(1rem, 3vw, 2.5rem)`）。布局优先采用索引表、账册行和不对称研究卡片，以细线建立列关系；首页的 52/48 陈述—方法矩阵只是一种首屏表达，不是所有页面的强制网格。

文章在超宽屏采用 `160px / minmax(0, 736px) / 220px` 三栏，中间正文稳定在 `736px` 内；窄屏隐藏双侧栏，保留单列阅读与移动目录。主要断点来自实现中的 `430px`、`560px`、`639px`、`768px`、`900px`、`1024px`、`1120px` 与 `1180px`，其中 `639/768/900px` 分别承担移动内容、网格和桌面导航的关键切换。

间距以 `0.5rem`、`0.75rem`、`1rem`、`1.25rem` 为常用节拍，面板内边距随视口在 `1.2rem–1.75rem` 之间变化。所有交互控件维持至少 `44px` 的触控尺寸。

**The Index Before Cards Rule.** 当内容天然具有序列、分类或比较关系时，优先使用带发丝线的行、表或矩阵；只有需要独立边界与内部叙述时才使用卡片。

## Elevation & Depth

系统常态是扁平纸面，不为静态卡片添加阴影。层次主要由画布、纸面、雾化纸面三档色面与发丝线形成；阴影仅用于必须脱离文档流的移动目录触发器和模态对话框。

### Shadow Vocabulary

- **浮动目录** (`0 12px 28px rgb(15 23 42 / 14%)`): 仅用于移动端固定目录入口，让它与正文纸面分离。
- **模态纸面** (`0 24px 60px rgb(7 13 24 / 30%)`): 仅用于模态对话框，配合深色遮罩建立明确层级。

### Named Rules

**The Flat Sheet Rule.** 卡片、列表、表格和导航在静止状态下不使用阴影；色面与一像素边界负责结构。

## Shapes

圆角只使用 `4px / 8px / 12px` 三档：紧凑控件、方法标签和行内代码使用 `4px`，独立浮层或后台代码块按层级使用 `8px`，较大面板预留 `12px`。只有元数据 chip 使用胶囊轮廓（`999px`）。圆形只服务 6px 状态点；拉伸试样轮廓和测量线是科研图示，不应转化为通用装饰曲线。

边框通常为一像素蓝灰线。矩阵、账册和导航激活标记保留直线逻辑；不使用大圆角容器、玻璃质感或硬偏移阴影。

**The Small Corner Rule.** 圆角严格限定为 `4px / 8px / 12px`；通用容器和数据标签默认 `4px`，胶囊只用于元数据，不把所有按钮和卡片圆成药丸。

## Components

组件应像索引纸上的可操作标注：尺寸克制、边界清楚、状态可靠。

### Buttons

- **Shape:** 主次动作均为低圆角矩形（`4px`），最小高度 `46px`；图标按钮为 `44px × 44px`。
- **Primary:** 钴蓝底、白字、一像素同色边界，水平内边距 `1.15rem`。
- **Hover / Focus:** 悬停转深钴蓝；键盘焦点统一使用 2px 钴蓝轮廓并外偏移 3px。状态过渡为约 `160ms ease`。
- **Secondary / Ghost:** 白纸/蓝黑纸面底，强化蓝灰边框和石墨正文；悬停时边框与文字变为钴蓝。

### Chips

- **Style:** 元数据 chip 使用一像素发丝线、胶囊轮廓（`999px`）、`32px` 最小高度；方法标签则是 `4px` 低圆角并使用等宽体。
- **State:** 可点击 chip 悬停时只切换边框和文字为钴蓝，不增加阴影或高饱和填充。

### Cards / Containers

- **Corner Style:** 小切角感圆角（`4px`）。
- **Background:** 使用纸面色，内部辅助区可使用雾化纸面。
- **Shadow Strategy:** 常态无阴影，遵循 Flat Sheet Rule。
- **Border:** 一像素发丝线；悬停项目卡只强化边线并进行极轻的钴蓝色面混合。
- **Internal Padding:** `clamp(1.2rem, 2.2vw, 1.75rem)`。

### Inputs / Fields

- **Style:** 搜索输入由一像素边框纸面容器、钴蓝搜索标记和无独立边框的文本输入组成，整体最小高度 `48px`。
- **Focus:** 容器通过 `focus-within` 将边框切换为钴蓝并显示低强度钴蓝焦点环。
- **Error / Disabled:** 禁用筛选器降低不透明度并保留不可用光标；当前实现没有独立错误色，不应凭空增加。

### Navigation

桌面导航使用 `44px` 最小高度、克制的中等字重和底部 2px 钴蓝激活线；悬停仅提高文字对比。移动导航改为 `48px` 高的账册行，右侧短线在激活时变为 2px 钴蓝。粘性页眉本身保持实色纸面与一像素下边界，不使用毛玻璃。

### Method Matrix

方法矩阵以折叠边框表格呈现研究对象、建模、变量与响应关系。表头和数据使用小字号与等宽体建立证据感；在 `639px` 以下改为逐行标签—值结构，保持语义表格而非缩成不可读的微型网格。

### Tensile Specimen

拉伸试样是签名级科研图示：1.25px 钴蓝轮廓、蓝灰测量线、等宽体标注和一条 760ms 的描线入场。动画仅在允许运动时运行，移动端裁切为连续的横向方法带；它用于研究语境，不应被复制成无关页面的装饰边框。

## Do's and Don'ts

### Do:

- **Do** 使用语义 CSS 变量，让同一组件在冷纸白与深蓝黑主题中保持等价层级。
- **Do** 用一像素发丝线、短钴蓝激活线和克制色面表达结构与状态。
- **Do** 保持至少 `44px` 交互目标、可见键盘焦点和 `prefers-reduced-motion` 降级。
- **Do** 在方法、日期、图注和工程数据中使用等宽体，在长文中维持约 `75ch` 的阅读宽度。
- **Do** 让矩阵、账册、测量图示和项目公开说明服务于证据链与可追溯性。

### Don't:

- **Don't** 把钴蓝扩展为大面积装饰色，或让多个强调色争夺路线标记角色。
- **Don't** 为静态卡片、导航或列表添加常态阴影、玻璃模糊、霓虹光晕或硬偏移阴影。
- **Don't** 用大圆角、通用胶囊按钮或可互换图标卡稀释科研索引纸的直线秩序。
- **Don't** 把首页的 52/48 构图或拉伸试样图示误写成每个页面都必须复用的模板。
- **Don't** 用等宽体制造终端 cosplay，也不要添加未经实现支持的错误色或装饰状态。
