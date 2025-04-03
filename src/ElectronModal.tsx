import React, { useEffect, useState } from "react"
import { Modal, Button } from "react-bootstrap"

interface ElectronModalProps {
  // Optional custom props
  customTitle?: string
  customMessage?: string
}

const ElectronModal: React.FC<ElectronModalProps> = ({ 
  customTitle = "Screen Saver Options",
  customMessage = "This screen saver has no options that you can set."
}) => {
  const [show, setShow] = useState(false)

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
    setShow(false)
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
      <Modal.Body>{customMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ElectronModal
