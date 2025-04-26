import fs from "fs"
import { contextBridge, ipcRenderer } from "electron"
import { Photo } from "./photo"

contextBridge.exposeInMainWorld(
   "api", 
   { 
      getLocalPhotos,
      shouldShowSettings: () => process.argv.find(arg => arg.startsWith("--show-settings")) !== undefined,
      chooseFolder: async () => {
         const folderPath = await ipcRenderer.invoke("choose-folder")
         return folderPath
      }
   }
)

function getLocalPhotos(folderPath: string): Photo[]
{
   if(!folderPath.endsWith("/"))
      folderPath += "/"

   const fileNames = fs.readdirSync(folderPath)

   const photos = fileNames
      .filter(fn => fn.match(/\.(jpg|jpeg)$/i) != null)
      .map(fn => ({
         url: `file:///${folderPath}${fn}`,
         title: "",
         attribution: "",
      }))

   return photos
}
