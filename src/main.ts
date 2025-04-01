import { app, BrowserWindow, dialog } from "electron"
import path from "path"

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

   const selectedFolder = dialog.showOpenDialogSync({properties: ["openDirectory"]}) ?? []

   if (selectedFolder.length === 0) {
      app.quit()
   }

   mainWindow = new BrowserWindow({
      show: false,
      autoHideMenuBar: true,
      backgroundColor: "#000",
      webPreferences: { 
         sandbox: false, 
         preload: path.join(__dirname, "preload.js"), 
         additionalArguments: [`--local-folder-path=${selectedFolder[0]}`], 
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
