import { useEffect, useRef, useState } from "react"
import { closeWindow } from "./utils"
import { PhotoSlideshow } from "./photoSlideshow"
import { DemoCanvas } from "./demoCanvas"
import { DemoCss } from "./demoCss"
import { DemoShader } from "./demoShader"
import { DemoThreeJs } from "./demoThreeJs"
import styles from "./app.module.scss"
import localforage from "localforage"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"

function SettingsModal() {
  return (
    <div
      className="modal show"
      style={{ display: "block", position: "initial" }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Modal body text goes here.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="primary"
            onClick={
               async () => {

                  const storedPath = await localforage.getItem<string>("folderPath") ?? ""
   
                  const newPath = (storedPath === "C:/Users/t-ste/Downloads/Bing Daily Pictures")
                     ? "C:/Users/t-ste/Pictures/For Screensaver Testing"
                     : "C:/Users/t-ste/Downloads/Bing Daily Pictures"
                   
                  await localforage.setItem("folderPath", newPath)
                  
                  closeWindow()
               }
            }
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  )
}

// Choose the component you want to display in the screen saver:
type ShowComponent = typeof PhotoSlideshow | typeof DemoCanvas | typeof DemoCss | typeof DemoShader | typeof DemoThreeJs
const SHOW_COMPONENT: ShowComponent = PhotoSlideshow

declare global {
   interface Window {
      api: {
         shouldShowSettings: () => boolean
      }
   }
}

export function App()
{
   const refRoot = useRef<HTMLDivElement>(null)
   const refStartMousePos = useRef({ x: NaN, y: NaN })

   const [showSettings, setShowSettings] = useState(false)
   
   useEffect(() =>
   {
      refRoot.current!.focus()
   },
   [])

   useEffect(
      () => setShowSettings(window.api.shouldShowSettings()),
      []
   )

   function onMouseMove(
      e: React.MouseEvent<HTMLDivElement>)
   {
      if(isNaN(refStartMousePos.current.x))
      {
         refStartMousePos.current = { x: e.pageX, y: e.pageY }
      }
      else
      {
         // Don't close the window on tiny movements of the mouse (from vibrations, for example).
         const moveThreshold = window.screen.width * 0.02
         if((Math.abs(e.pageX - refStartMousePos.current.x) > moveThreshold)
         || (Math.abs(e.pageY - refStartMousePos.current.y) > moveThreshold))
         {
            closeWindow()
         }
      }
   }

   return (
      <div
         ref={refRoot}
         className={styles.root}
         tabIndex={-1}
         onClick={
            showSettings
               ? e => {}
               : e => closeWindow()
         }
         onKeyDown={
            showSettings
            ? e => {}
            : e => closeWindow()
         }
         onMouseMove={
            showSettings
            ? () => {}
            : onMouseMove
         }
      >
         {
            showSettings
               ? <SettingsModal />
               : <SHOW_COMPONENT/>
         }
      </div>
   )
}
