import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../../styles/Chat/Left/ManageChannel.css";

// Composant pour créer ou édit un channel
export default function ManageChannel() {
    return (
    <> 
    <Modal
      //show={showModalDelete}
      // onHide={() => setShowModalDelete(false)}
    >
      <Modal.Header
        closeButton
        id="btn-close-modal"
        closeVariant="white"
      >
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this channel?
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="modal-cancel-button"
          onClick={() => {/*setShowModalDelete(false)*/} }
        >
          Cancel
        </Button>
        <Button
          className="modal-delete-button"
          onClick={() => {/*
            deleteChannel(channel.id, role);
            setShowModalDelete(false);*/
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal> </>);
  }
  