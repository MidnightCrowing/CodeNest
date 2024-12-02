import 'uno.css'
import './src/style/light.scss'
import './src/style/dark.scss'
import * as components from './src/components'

const componentList = Object.values(components).flat()

function install(app: any): void {
  componentList.forEach((component: any) => {
    app.component(component.name, component)
  })
}

export * from './src/components' // 按需导出所有组件
export default { install } // 默认导出以支持全局引入
