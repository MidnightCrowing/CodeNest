declare global {
    const ref: typeof import('vue')['ref']
    const computed: typeof import('vue')['computed']
    const reactive: typeof import('vue')['reactive']
    const watch: typeof import('vue')['watch']
    // 添加其他你需要的 Vue Composition API
  }
  
  export {}