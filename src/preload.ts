import fs from "fs"
import { contextBridge, ipcRenderer } from "electron"
import { Photo } from "./photo"

contextBridge.exposeInMainWorld("api", {
   getLocalPhotos,
   shouldShowSettings: () => process.argv.find(arg => arg.startsWith("--show-settings")) !== undefined,
   showFolderDialog: () => ipcRenderer.invoke("show-folder-dialog")
})

function getLocalPhotos(folderPath: string): Photo[] {
   if (!folderPath.endsWith("/")) folderPath += "/"
   if (!fs.existsSync(folderPath)) return []
   const fileNames = fs.readdirSync(folderPath)
   return fileNames
      .filter(fn => fn.match(/\.(jpg|jpeg)$/i))
      .map(fn => ({
         url: `file:///${folderPath}${fn}`,
         title: "",
         attribution: "",
      }))
}
