import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

import {
  Banner,
  Button,
  Card,
  Checkbox,
  ColorIcon,
  CommandLinkButton,
  Frame,
  Gradient,
  Group,
  Input,
  Installation,
  Introduction,
  Line,
  Link,
  Loader,
  Menu,
  Popup,
  Radio,
  SegmentedControl,
  Shortcut,
  Switch,
  Tag,
  Tooltip,
} from './pages'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/introduction' },
  { path: '/introduction', component: Introduction },
  { path: '/installation', component: Installation },
  { path: '/banner', component: Banner, name: 'banner', meta: { label: 'Banner' } },
  { path: '/button', component: Button, name: 'button', meta: { label: 'Button' } },
  { path: '/card', component: Card, name: 'card', meta: { label: 'Card' } },
  { path: '/checkbox', component: Checkbox, name: 'checkbox', meta: { label: 'Checkbox' } },
  { path: '/color-icon', component: ColorIcon, name: 'color-icon', meta: { label: 'ColorIcon' } },
  { path: '/command-link-button', component: CommandLinkButton, name: 'command-link-button', meta: { label: 'CommandLinkButton' } },
  { path: '/frame', component: Frame, name: 'frame', meta: { label: 'Frame' } },
  { path: '/gradient', component: Gradient, name: 'gradient', meta: { label: 'Gradient' } },
  { path: '/group', component: Group, name: 'group', meta: { label: 'Group' } },
  { path: '/input', component: Input, name: 'input', meta: { label: 'Input' } },
  { path: '/line', component: Line, name: 'line', meta: { label: 'Line' } },
  { path: '/link', component: Link, name: 'link', meta: { label: 'Link' } },
  { path: '/loader', component: Loader, name: 'loader', meta: { label: 'Loader' } },
  { path: '/menu', component: Menu, name: 'menu', meta: { label: 'Menu' } },
  { path: '/popup', component: Popup, name: 'popup', meta: { label: 'Popup' } },
  { path: '/radio', component: Radio, name: 'radio', meta: { label: 'Radio' } },
  { path: '/segmented-control', component: SegmentedControl, name: 'segmented-control', meta: { label: 'SegmentedControl' } },
  { path: '/shortcut', component: Shortcut, name: 'shortcut', meta: { label: 'Shortcut' } },
  { path: '/switch', component: Switch, name: 'switch', meta: { label: 'Switch' } },
  { path: '/tag', component: Tag, name: 'tag', meta: { label: 'Tag' } },
  { path: '/tooltip', component: Tooltip, name: 'tooltip', meta: { label: 'Tooltip' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
export { routes }
