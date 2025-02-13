import fs from "fs"
import { contextBridge } from "electron"
import { Photo } from "./photo"

contextBridge.exposeInMainWorld("api", { getLocalPhotos })

function getLocalPhotos(): Photo[]
{
   const folderArg = process.argv.find(arg => arg.startsWith("--local-folder-path=")) ?? ""
   
   let folderPath = folderArg.replace("--local-folder-path=", "") 

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
