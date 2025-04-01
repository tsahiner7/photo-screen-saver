import fs from "fs"
import { contextBridge, ipcRenderer } from "electron"
import { Photo } from "./photo"

contextBridge.exposeInMainWorld("api", { getLocalPhotos })

// Expose an IPC communication function to the renderer process to trigger the modal
contextBridge.exposeInMainWorld("electron", {
   // Listen to 'open-modal' event from the main process
   onShowModal: (callback: () => void) => ipcRenderer.on("open-modal", callback),
   
   // Send a message to the main process when it's necessary to trigger the dialog
   showDialog: () => ipcRenderer.send("show-dialog")
 })

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