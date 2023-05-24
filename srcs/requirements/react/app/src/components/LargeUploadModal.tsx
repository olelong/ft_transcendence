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
        <Modal.Title>Cannot upload image!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Image uploads are not working for now, we're currently working on it,
        sorry for the inconvenience. ^ↀᴥↀ^
      </Modal.Body>
      <Modal.Footer>
        <Button className="purple-button" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
