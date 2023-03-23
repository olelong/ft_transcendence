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

export default function SanctionModal({
  infos,
  close,
  sanction,
}: SanctionModalProps) {
  const [selectedSanction, setSelectedSanction] = useState<{
    value?: string;
    label?: string;
  }>({
    value: "select",
    label: "Select Sanction",
  });
  const [isDefinitive, setIsDefinitive] = useState(false);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0 });
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
      setIsDefinitive(false);
      setTime({ days: 0, hours: 0, minutes: 0 });
      setFormFinished(false);
    }
  }, [infos.show]);

  const updateTime = (unit: keyof typeof time, value: number) => {
    if (value < 0) return;
    if (unit === "days" && value > 9999) return;
    if (unit === "hours" && value > 23) return;
    if (unit === "minutes" && value > 59) return;
    const newTime = {
      ...time,
      [unit]: !isNaN(value) ? value : 0,
    };
    setTime(newTime);
    if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0)
      setFormFinished(false);
    else setFormFinished(true);
  };

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
            <>
              <Form.Check
                inline
                style={{ margin: 0, paddingTop: 20 }}
                type={"checkbox"}
              >
                <Form.Check.Input
                  className="sanction-modal-checkbox"
                  onChange={(e) => {
                    setFormFinished(
                      e.target.checked ||
                        time.days !== 0 ||
                        time.hours !== 0 ||
                        time.minutes !== 0
                    );
                    setIsDefinitive(e.target.checked);
                  }}
                  checked={isDefinitive}
                />
                <Form.Check.Label>Definitive</Form.Check.Label>
              </Form.Check>
              {!isDefinitive && (
                <div
                  style={{
                    paddingTop: 20,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  For
                  <Form.Control
                    type="number"
                    min={0}
                    max={9999}
                    style={{ width: 75 }}
                    className="sanction-modal-input"
                    placeholder="0"
                    value={time.days || ""}
                    onChange={(e) =>
                      updateTime("days", parseInt(e.target.value))
                    }
                  />
                  days
                  <Form.Control
                    type="number"
                    min={0}
                    max={23}
                    className="sanction-modal-input"
                    placeholder="0"
                    value={time.hours || ""}
                    onChange={(e) =>
                      updateTime("hours", parseInt(e.target.value))
                    }
                  />
                  hours
                  <Form.Control
                    type="number"
                    min={0}
                    max={59}
                    className="sanction-modal-input"
                    placeholder="0"
                    value={time.minutes || ""}
                    onChange={(e) =>
                      updateTime("minutes", parseInt(e.target.value))
                    }
                  />
                  minutes
                </div>
              )}
            </>
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
              sanction(
                selectedSanction.value as "kick" | "mute" | "ban",
                !isDefinitive ? time : undefined
              );
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
