export {}

declare global {
  interface Window {
    api: {
      shouldShowSettings: () => boolean
      chooseFolder: () => Promise<string>
    }
    electron?: {
      onShowModal: (callback: () => void) => void
      restartApp: () => void
    }
    electronStore?: {
      get: (key: string) => any
      set: (key: string, value: any) => void
    }
    showSettingsModal?: () => void
  }
}
