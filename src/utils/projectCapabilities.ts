import type { LocalProject } from '~/constants/localProject'

/**
 * 所有本地项目都可以删除文件，不再只限临时项目。
 * 远程项目没有本地文件可删，路径已失效的项目也没有可删的东西。
 */
export function canDeleteProjectFiles(project: LocalProject) {
  return project.isExists !== false && !project.isRemote
}
