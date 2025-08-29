import type { ProjectKind, ProjectLanguage } from '~/constants/localProject'

// SidePanelActive 类型
// 用于表示侧边栏的激活状态，可以是以下几种情况：
// 1. `k-${ProjectKind}`: 表示具体项目类型的前缀，如 'k-mine', 'k-fork', 或 'k-clone'。
// 2. `k-all`: 表示包含所有项目的前缀，如 'k-all'。
// 3. `l-${ProjectLanguage}`: 表示具体编程语言的前缀，如 'l-JavaScript', 'l-Python'。
// 4. `'temp'`: 特殊状态，表示临时项目。
export type SidePanelActive
  = | `k-${ProjectKind | 'all'}` // 项目类型或所有项目
    | `l-${ProjectLanguage}` // 编程语言
    | 'temp' // 临时项目
