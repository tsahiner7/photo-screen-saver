import React, { useEffect, useState } from "react"
import { Modal, Button, Form } from "react-bootstrap"
import localforage from "localforage"

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [show, setShow] = useState(false)
  const [newChosenFolder, setNewChosenFolder] = useState<string>("")

  // Show modal when 'open-modal' event is received
  useEffect(() => {
    const handleOpen = () => {
      setShow(true)
    }

    // Automatically show the modal if running with --show-settings
    if (window.api.shouldShowSettings()) {
      handleOpen()
    }

    // Electron main process or React can trigger this event
    if (window.electron) {
      window.electron.onShowModal(handleOpen)
    }

    // Optional global method to show modal from React
    window.showSettingsModal = handleOpen

    // Also support custom DOM event (optional)
    window.addEventListener("open-modal", handleOpen)

    return () => {
      window.removeEventListener("open-modal", handleOpen)
    }
  }, [])

const handleChooseFolder = async () => {
  const newPath = await window.api!.chooseFolder()
  setNewChosenFolder(newPath)

  const oldPath = await localforage.getItem<string>("folderPath")
  if (newPath && newPath !== oldPath) {
    await localforage.setItem("folderPath", newPath)
    window.dispatchEvent(new Event("folder-changed"))
    setNewChosenFolder("")
  }
}

  const handleClose = () => {
    setShow(false)
    onClose()
    //window.electron?.restartApp() // Optional: restart to apply changes
  }

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Screen Saver Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This screen saver has no options that you can set except the folder path.</p>
        <Form.Group>
          <Form.Label>New Folder Path:</Form.Label>
          <Form.Control
            type="text"
            value={newChosenFolder}
            readOnly
            placeholder="No folder selected"
          />
        </Form.Group>
        <Button className="mt-3" onClick={handleChooseFolder}>
          Choose Folder...
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

export default SettingsModal
