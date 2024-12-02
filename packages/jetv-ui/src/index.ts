import * as components from './components'

const componentList = Object.values(components).flat()

function install(app: any): void {
  componentList.forEach((component: any) => {
    app.component(component.name, component)
  })
}

export * from './components' // 按需导出所有组件
export default { install } // 默认导出以支持全局引入
