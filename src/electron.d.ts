// electron.d.ts
declare global {
    interface Window {
      electron: {
        onShowModal: (callback: () => void) => void
        showDialog: () => void
      }
    }
  }
  
export {}