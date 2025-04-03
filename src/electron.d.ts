// electron.d.ts
declare global {
    interface Window {
      electron: {
        onShowModal: (callback: () => void) => void
        showDialog: () => void
      }
      showModal?: () => void; // Add this line
      api?: any;
    }
  }
  
export {}