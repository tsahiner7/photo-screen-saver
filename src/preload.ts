import fs from "fs"
import { contextBridge } from "electron"
import { LOCAL_FOLDER_PATH } from "./constants"
import { Photo } from "./photo"

const folderArg = process.argv.find(arg => arg.startsWith("--folderPath="))

let folderPath = folderArg 
   ? folderArg.replace("--folderPath=", "") //To get rid of the first part of argument and take the path of the folder selected by user
   : LOCAL_FOLDER_PATH // Or use default folder
   
//Check if the folder exists if not write a warning message and use the default folder
if (!fs.existsSync(folderPath)) {
   console.warn(`Folder path "${folderPath}" does not exist. Falling back to LOCAL_FOLDER_PATH.`)
   folderPath = LOCAL_FOLDER_PATH
}
console.log("Using folder path:", folderPath)

function getLocalPhotos(): Photo[] {
   if (!fs.existsSync(folderPath)) {
      console.error("Folder path does not exist:", folderPath)
      return []
   }

   //let formattedPath = folderPath
   if (!folderPath.endsWith("/")) folderPath += "/"

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

contextBridge.exposeInMainWorld("api", { getLocalPhotos })
