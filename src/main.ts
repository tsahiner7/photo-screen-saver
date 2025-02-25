import { app, BrowserWindow, dialog } from "electron"
import path from "path"
import ElectronStore from "electron-store"
import { existsSync } from "fs"

const store = new ElectronStore()
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
         dialog.showMessageBox({ message: "This screen saver has no options that you can set.", buttons: ["OK"] })
         app.quit()
         return
      }

      // dialog.showMessageBox({ message: process.argv.join("\n"), buttons: ["OK"] })
   }

   // TODO: Check for saved folder path here...
   let folderPath: string = store.get("folderPath") as string || ""
   // TODO: If there is a saved folder path, and it exists, just pass it along...
   if (folderPath && existsSync(folderPath)) {
      console.log("Selected folder path: ", folderPath)
   } else {
      // TODO: If there is not a saved folder path or it does not exist, then show the dialog to allow the user to select it...
      const selectedFolder: string[] = dialog.showOpenDialogSync({properties: ["openDirectory"]}) ?? []
      if (selectedFolder.length === 0) {
         console.log("No folder selected, exiting...")
         app.quit()
      }  
      // TODO: Save the chosen folder path with electron-store here...
      folderPath = selectedFolder[0]
      store.set("folderPath", folderPath)
      console.log("electron-store path:", store.get("folderPath"))
   }
    
   const mainWindow = new BrowserWindow({
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

      mainWindow!.setKiosk(true)
      mainWindow!.setAlwaysOnTop(true)
      mainWindow!.show()
   }, 3000)
})
