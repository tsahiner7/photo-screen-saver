import { app, BrowserWindow, ipcMain, dialog } from "electron"
import path from "path"

// When running in true screen saver mode, the Chromium GPU process crashes for some reason.
// We work around this problem by specifying this flag to run the GPU thread in-process.
app.commandLine.appendSwitch("in-process-gpu")

ipcMain.handle("show-folder-dialog", async () => {
   const result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
   })
   return result.canceled ? null : result.filePaths[0]
})

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
      /*
      if((process.argv[1] === "/S")
      || process.argv[1].match(/^\/c/))
      {
         dialog.showMessageBox({ message: "This screen saver has no options that you can set.", buttons: ["OK"] })
         app.quit()
         return
      }

      // dialog.showMessageBox({ message: process.argv.join("\n"), buttons: ["OK"] })
      */
   }

   const showSettings = (process.argv[1] === "/S") || process.argv[1]?.match(/^\/c/)

   const mainWindow = new BrowserWindow({
      // Width and height for setting, ignored if Kiosk mode!
      width: 600,
      height: 300,
      show: false,
      autoHideMenuBar: true,
      backgroundColor: "#000",
      webPreferences: { 
         sandbox: false, 
         preload: path.join(__dirname, "preload.js"),
         additionalArguments: showSettings
            ? ["--show-settings"]
            : []
         , 
      },
   })

   // We have to delay the following operations for a few seconds, otherwise the page doesn't get
   // loaded when running in true screen saver mode. (The "blank white window" problem.)
   setTimeout(() => 
   {
      mainWindow!.loadFile("index.html")
      // mainWindow!.webContents.openDevTools()

      if (!showSettings) {
         mainWindow!.setKiosk(true)
      }
      // mainWindow!.setAlwaysOnTop(true)
      mainWindow!.show()
   }, 3000)
})
