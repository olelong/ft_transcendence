import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function LargeUploadModal({
  show,
  handleClose,
}: {
  show: boolean;
  handleClose: () => void;
}) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Image too large!</Modal.Title>
      </Modal.Header>
      <Modal.Body>Please upload an image smaller than 1 MB.</Modal.Body>
      <Modal.Footer>
        <Button className="purple-button" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
