import { ProjectKind } from '~/constants/projectKind'

export enum KindMark {
  ALL = 'k-all',
  MINE = 'k-mine',
  FORK = 'k-fork',
  CLONE = 'k-clone',
  TEST = 'k-test',
}

export const Kind = {
  ...ProjectKind,
  ALL: 'all',
}
