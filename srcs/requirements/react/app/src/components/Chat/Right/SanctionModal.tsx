import { useEffect, useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import { CiWarning } from "react-icons/ci";

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

  useEffect(() => {
    setFormFinished(false);
    if (selectedSanction.value === "select") return;
    if (selectedSanction.value === "kick") setFormFinished(true);
    else {
      if (isDefinitive) setFormFinished(true);
      else if (time.days > 0 || time.hours > 0 || time.minutes > 0)
        setFormFinished(true);
    }
  }, [selectedSanction.value, isDefinitive, time]);

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
          <SanctionSelect
            value={selectedSanction}
            setValue={(value) => setSelectedSanction({ ...value })}
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
                    setIsDefinitive(e.target.checked);
                  }}
                  checked={isDefinitive}
                />
                <Form.Check.Label>Definitive</Form.Check.Label>
              </Form.Check>
              {!isDefinitive && (
                <>
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
                  {time.days === 0 &&
                    time.hours === 0 &&
                    time.minutes !== 0 && (
                      <p style={{ marginTop: 20, marginBottom: 0 }}>
                        <CiWarning size={25} />
                        Time is rounded to the nearest minute so a seconds
                        offset may occur
                      </p>
                    )}
                </>
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

const sanctionOptions = [
  { value: "kick", label: "Kick" },
  { value: "mute", label: "Mute" },
  { value: "ban", label: "Ban" },
];

interface SelectValue {
  value?: string;
  label?: string;
}
function SanctionSelect({
  value,
  setValue,
}: {
  value: SelectValue;
  setValue: (value: SelectValue | null) => void;
}) {
  return (
    <Select
      value={value}
      options={sanctionOptions}
      styles={customSelectStyles}
      isSearchable={false}
      onChange={setValue}
    />
  );
}
