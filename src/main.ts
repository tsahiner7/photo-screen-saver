import { app, BrowserWindow, ipcMain, dialog} from "electron"
import path from "path"

// When running in true screen saver mode, the Chromium GPU process crashes for some reason.
// We work around this problem by specifying this flag to run the GPU thread in-process.
app.commandLine.appendSwitch("in-process-gpu")

// Quit when all windows are closed.
app.on("window-all-closed", () =>
{
   app.quit()
})

ipcMain.handle("choose-folder", async () => {
   const result = await dialog.showOpenDialog({
     properties: ["openDirectory"]
   })
 
   if (result.canceled || result.filePaths.length === 0) {
     return ""
   }
 
   return result.filePaths[0]
 })

app.on("ready", () =>
{
   const args = process.argv.map(arg => arg.toLowerCase())

   if(process.argv.length > 1)
   {
      // The /p option tells us to display the screen saver in the tiny preview window in the Screen Saver Settings dialog.
      if(args.includes ("/p"))
      {
         app.quit()
         return
      }

      // The /S option is passed when the user chooses Configure from the .scr file context menu (although we don't see this in practice).
      // The /c:# option is passed when the user clicks Settings... in the Screen Saver Settings dialog.
      /*
      if((process.argv[1] === "/S")
      || process.argv[1].match(/^\/c/))
      {
         dialog.showMessageBox({ message: "This screen saver has no options that you can set.", buttons: ["OK"] })
         app.quit()
         return
      }

      dialog.showMessageBox({ message: process.argv.join("\n"), buttons: ["OK"] })
      */
   }


  const shouldShowSettings = args.includes("/s") || args.find(arg => arg.startsWith("/c"))

   const mainWindow = new BrowserWindow({
      show: false,
      autoHideMenuBar: true,
      backgroundColor: "#000",
      webPreferences: { 
         sandbox: false, 
         preload: path.join(__dirname, "preload.js"),
         additionalArguments: shouldShowSettings ? ["--show-settings"] : [],
      },
   })

   // We have to delay the following operations for a few seconds, otherwise the page doesn't get
   // loaded when running in true screen saver mode. (The "blank white window" problem.)
   setTimeout(() => 
   {
      mainWindow!.loadFile("index.html")
      mainWindow!.webContents.openDevTools()

      // mainWindow!.setKiosk(true)
      // mainWindow!.setAlwaysOnTop(true)
      mainWindow!.show()
   }, 3000)
})
