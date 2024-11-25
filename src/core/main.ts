import type { LocalProject } from '~/constants/localProject'

export const projectItems: LocalProject[] = []

export function addProjectItem(project: LocalProject) {
  projectItems.push(project)
}
