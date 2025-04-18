import { app, BrowserWindow, dialog, ipcMain } from "electron"
import path from "path"
import Store from "electron-store"
import { existsSync, readdirSync, statSync } from "fs"
import { extname } from "path"

let mainWindow: BrowserWindow | null = null

// When running in true screen saver mode, the Chromium GPU process crashes for some reason.
// We work around this problem by specifying this flag to run the GPU thread in-process.
app.commandLine.appendSwitch("in-process-gpu")

// Quit when all windows are closed.
app.on("window-all-closed", () =>
{
   app.quit()
})

app.on("ready", () =>
{
   console.log("App is ready")
   if(process.argv.length > 1)
   {
      // The /p option tells us to display the screen saver in the tiny preview window in the Screen Saver Settings dialog.
      if(process.argv[1] === "/p")
      {
         app.quit()
         return
      }

      // The /S option is passed when the user chooses Configure from the .scr file context menu (although we don't see this in practice).
      // The /c:# option is passed when the user clicks Settings... in the Screen Saver Settings dialog.
      if((process.argv[1] === "/S")
      || process.argv[1].match(/^\/c/))
      {
         console.log("Handling /S or /c argument")
         if (mainWindow) {
            console.log("Sending open-modal message to renderer")
            mainWindow.webContents.send("open-modal") // Send message to the renderer
         }
         return
      }

      // dialog.showMessageBox({ message: process.argv.join("\n"), buttons: ["OK"] })
   }

   // TODO: If there is not a saved folder path or it does not exist, then show the dialog to allow the user to select it...   
   const VALID_IMAGE_EXTENSIONS = [".jpg", ".jpeg"]
   function folderHasImages(folderPath: string): boolean {
      const files = readdirSync(folderPath)
         .filter(file => !file.startsWith(".")) // to ignore hidden files
         .map(file => path.join(folderPath, file))
         .filter(fullPath => existsSync(fullPath) && statSync(fullPath).isFile())

      return files.length > 0 && files.every(file => VALID_IMAGE_EXTENSIONS.includes(extname(file).toLowerCase()))
   }
   // TODO: Check for saved folder path here...
   const store = new Store()
   let folderPath: string = store.get("folderPath") as string || ""

   // TODO: If there is a saved folder path, and it exists, just pass it along...
   if (!folderPath || !existsSync(folderPath) || !folderHasImages(folderPath)) {
      const selectedFolder = dialog.showOpenDialogSync({ properties: ["openDirectory"] }) ?? []
      
      if (selectedFolder.length === 0) {
         app.quit()
         return
      }

      folderPath = selectedFolder[0]
      
      if (!folderHasImages(folderPath)) {
         dialog.showMessageBoxSync({
            type: "error",
            title: "Warning",
            message: "This folder does not contain any JPG images.",
            buttons: ["OK"]
         })
         app.quit()
         return
      }

      store.set("folderPath", folderPath)
   }

   mainWindow = new BrowserWindow({
      show: false,
      autoHideMenuBar: true,
      backgroundColor: "#000",
      webPreferences: { 
         sandbox: false, 
         preload: path.join(__dirname, "preload.js"), 
         additionalArguments: [`--local-folder-path=${folderPath}`], 
      },
   })


   // We have to delay the following operations for a few seconds, otherwise the page doesn't get
   // loaded when running in true screen saver mode. (The "blank white window" problem.)
   setTimeout(() => 
   {
      mainWindow!.loadFile("index.html")
      // mainWindow!.webContents.openDevTools()

      // mainWindow!.setKiosk(true)
      // mainWindow!.setAlwaysOnTop(true)
      mainWindow!.show()
      // // Example in main.ts to trigger modal from main process
      // mainWindow!.webContents.send("open-modal")
   }, 3000)
})

// Add this handler for the folder selection dialog
ipcMain.handle("choose-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ 
    properties: ["openDirectory"] 
  })
  
  if (canceled || filePaths.length === 0) {
    return null
  }
  
  return filePaths[0]
})

ipcMain.on("restart-app", () => {
   // app.relaunch()
   // app.exit(0)
 })