// electron.d.ts
declare global {
    interface Window {
      electron: {
        onShowModal: (callback: () => void) => void
        showDialog: () => void
      }
      showModal?: () => void;
      api?: any;
      electronStore?: {
        get: (key: string) => any;
        set: (key: string, value: any) => void;
      }
    }
  }
  
export {}