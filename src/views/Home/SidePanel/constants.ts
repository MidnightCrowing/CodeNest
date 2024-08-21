export enum KindMenuList {
  ALL = 'all',
  MINE = 'mine',
  FORK = 'fork',
  CLONE = 'clone',
  TEST = 'test',
}

export enum KindMenuMark {
  ALL = 'k-all',
  MINE = 'k-mine',
  FORK = 'k-fork',
  CLONE = 'k-clone',
  TEST = 'k-test',
}

export const kindMenuMarkMap: Record<KindMenuList, KindMenuMark> = {
  [KindMenuList.ALL]: KindMenuMark.ALL,
  [KindMenuList.MINE]: KindMenuMark.MINE,
  [KindMenuList.FORK]: KindMenuMark.FORK,
  [KindMenuList.CLONE]: KindMenuMark.CLONE,
  [KindMenuList.TEST]: KindMenuMark.TEST,
}
