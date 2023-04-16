import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { measureStringWidth, truncateString } from "./membersUtils";

export default function OwnerModal({
  infos,
  close,
  setOwner,
}: OwnerModalProps) {
  return (
    <Modal show={infos.show} onHide={close}>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Are you sure?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Setting{" "}
        {measureStringWidth(infos.name, "Montserrat") < 460
          ? infos.name
          : truncateString(infos.name, 460)}{" "}
        as owner will remove all your owner's rights and designate you as an
        administrator.
      </Modal.Body>
      <Modal.Footer>
        <Button className="light-button" onClick={close}>
          Discard
        </Button>
        <Button
          className="purple-button"
          onClick={() => {
            setOwner();
            close();
          }}
        >
          Make{" "}
          {measureStringWidth(infos.name, "Montserrat") < 160
            ? infos.name
            : truncateString(infos.name, 160)}
          {" "}the new owner
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
