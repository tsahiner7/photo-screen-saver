import React, { useEffect, useState } from "react"
import { Modal, Button } from "react-bootstrap"

const ElectronModal: React.FC = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Listen for the 'open-modal' event from the main process
    console.log("Setting up open-modal listener...")
    window.electron.onShowModal(() => {
        console.log("Received open-modal message, opening modal")
        setShow(true)
    })
  }, [])

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Screen Saver Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>This screen saver has no options that you can set.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ElectronModal
