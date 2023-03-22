import { useEffect, useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Select from "react-select";

import {
  customSelectStyles,
  measureStringWidth,
  truncateString,
} from "./membersUtils";

import "../../../styles/Chat/Right/Members.css";

export default function SanctionModal({ infos, close }: SanctionModalProps) {
  const [selectedSanction, setSelectedSanction] = useState<{
    value?: string;
    label?: string;
  }>({
    value: "select",
    label: "Select Sanction",
  });
  const [isDefinitive, setIsDefinitive] = useState(false);
  const [formFinished, setFormFinished] = useState(false);

  const sanctionOptions = [
    { value: "kick", label: "Kick" },
    { value: "mute", label: "Mute" },
    { value: "ban", label: "Ban" },
  ];

  useEffect(() => {
    if (infos.show) {
      setSelectedSanction({
        value: "select",
        label: "Select Sanction",
      });
      setFormFinished(false);
    }
  }, [infos.show]);

  return (
    <Modal show={infos.show} onHide={close}>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>
          Sanction{" "}
          {measureStringWidth(infos.name, "Montserrat") < 195
            ? infos.name
            : truncateString(infos.name, 195)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Select
            value={selectedSanction}
            options={sanctionOptions}
            styles={customSelectStyles}
            isSearchable={false}
            onChange={(value) => {
              setFormFinished(value?.value === "kick");
              setSelectedSanction({ ...value });
            }}
          />
          {(selectedSanction.value === "mute" ||
            selectedSanction.value === "ban") && (
            <Form.Check
              inline
              style={{ margin: 0, paddingTop: 20 }}
              type={"checkbox"}
            >
              <Form.Check.Input
                className="sanction-modal-checkbox"
                onChange={(e) => {
                  setFormFinished(e.target.checked);
                  setIsDefinitive(e.target.checked);
                }}
                checked={isDefinitive}
              />
              <Form.Check.Label>Definitive</Form.Check.Label>
            </Form.Check>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="light-button"
          onClick={close}
          style={{ marginRight: "auto" }}
        >
          Discard
        </Button>
        {formFinished && (
          <Button
            className="purple-button"
            onClick={() => {
              close();
            }}
          >
            Submit sanction
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
