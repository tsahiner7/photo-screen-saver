import fs from "fs"
import { contextBridge } from "electron"
import { Photo } from "./photo"

contextBridge.exposeInMainWorld(
   "api", 
   { 
      getLocalPhotos,
      shouldShowSettings: () => process.argv.find(arg => arg.startsWith("--show-settings")) !== undefined,
   }
)

function getLocalPhotos(folderPath: string): Photo[]
{
   if(!folderPath.endsWith("/"))
      folderPath += "/"

   if (!fs.existsSync(folderPath)) {
      console.warn("Invalid photo folder path:", folderPath)
      return [] // return an empty list instead of crashing
   }

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
