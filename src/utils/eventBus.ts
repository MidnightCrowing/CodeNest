import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
type Events = {
  updateSettings: void
  saveSettings: void
}

export const eventBus = mitt<Events>()
