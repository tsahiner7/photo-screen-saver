import React, { useEffect, useState } from "react"
import { Modal, Button } from "react-bootstrap"
// import { getLocalPhotos } from "./localPhotos"

interface ElectronModalProps {
  // Optional custom props
  customTitle?: string
  customMessage?: string
  folderChangeCount?: any
  setFolderChangeCount?: any
}

const ElectronModal: React.FC<ElectronModalProps> = ({ 
  customTitle = "Screen Saver Options",
  customMessage = "This screen saver has no options that you can set.",
  folderChangeCount, 
  setFolderChangeCount,
}) => {
  const [show, setShow] = useState(false)

  const [newChosenFolder, setNewChosenFolder] = useState<string>("")

  useEffect(() => {
    // Listen for the 'open-modal' event from the main process
    if (window.electron) {
      console.log("Setting up open-modal listener...")
      window.electron.onShowModal(() => {
        console.log("Received open-modal message, opening modal")
        setShow(true)
      })
    }
  }, [])

  // Function to manually show the modal from anywhere in your app
  const handleShowModal = () => {
    setShow(true)
  }

  // Function to handle modal close
  const handleClose = () => {
    console.log("Siktir git!")
    setShow(false)

    setFolderChangeCount(folderChangeCount + 1)
    // window.electron.restartApp()
    // getLocalPhotos()
  }

  // Make these functions available globally for other components
  React.useEffect(() => {
    window.showModal = handleShowModal
    return () => {
      delete window.showModal
    }
  }, [])

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      backdrop="static"
      animation={true}
    >
      <Modal.Header closeButton>
        <Modal.Title>{customTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {customMessage}
        {newChosenFolder}
        <Button
          onClick={async () => {
            const newPath = await window.api!.chooseFolder()
            setNewChosenFolder(newPath)

            const oldPath = window.electronStore!.get("chosenFolder")
            if (newPath !== oldPath) {
              window.electronStore!.set("chosenFolder", newPath)

              // Send custom event, so we won't need to restart the app 
              // to see the new chosenFolder
              window.dispatchEvent(new Event("folder-changed"))
              setNewChosenFolder("") // clear for next time
            }
          }}
        >
          Choose...
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ElectronModal
