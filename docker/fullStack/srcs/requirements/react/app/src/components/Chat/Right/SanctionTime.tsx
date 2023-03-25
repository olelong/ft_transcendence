import { useState, useEffect, useRef } from "react";

import { getIdInParent, changeRole } from "./membersUtils";

import "../../../styles/Chat/Right/Members.css";

export default function SanctionTime({ sanctionned, setMembers }: SanctionTimeProps) {
  const [time, setTime] = useState<number | null>();
  const [updateTimeInterval, setUpdateTimeInterval] =
    useState<NodeJS.Timeout>();
  const [, setIntervalMinutes] = useState<boolean>();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && sanctionned && !updateTimeInterval) {
      const id = getIdInParent(ref.current);
      if (!id) return;
      const setDiffTime = () => {
        let time = member?.time
          ? new Date(member.time).getTime() - Date.now()
          : null;
        if (time && time <= 0) {
          time = 0;
          changeRole(id, "members", setMembers);
        }
        setTime(time);
        return time;
      };
      const member = sanctionned.find((m) => m.id === id);
      const time = setDiffTime();
      if (time) {
        const OneHourAnd1MnInMs = 1000 * 60 * 61;
        const timeGreaterThan1h = time > OneHourAnd1MnInMs;
        setIntervalMinutes(timeGreaterThan1h);
        setUpdateTimeInterval(
          setInterval(
            () => {
              const time = setDiffTime();
              setIntervalMinutes((intervalMinutes) => {
                if (time && time <= OneHourAnd1MnInMs && intervalMinutes) {
                  setIntervalMinutes(false);
                  clearInterval(updateTimeInterval);
                  setUpdateTimeInterval(
                    setInterval(() => {
                      setDiffTime();
                    }, 1000)
                  );
                }
                return intervalMinutes;
              });
            },
            timeGreaterThan1h ? 1000 * 60 : 1000
          )
        );
      }
    }
  }, [sanctionned, updateTimeInterval, setMembers]);

  useEffect(() => {
    return () => clearInterval(updateTimeInterval);
  }, [updateTimeInterval]);

  return time !== null ? (
    <div ref={ref} className="sanction-time">
      {time !== undefined && formatDiffTime(time)}
    </div>
  ) : null;
}

export function formatDiffTime(diffInMs: number) {
  const diffInSeconds = diffInMs / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;

  if (diffInSeconds < 60) return `${Math.floor(diffInSeconds)}s`;
  else if (diffInMinutes < 60) {
    const diffInSecondsRounded = Math.floor(diffInSeconds % 60);
    return `${Math.floor(diffInMinutes)}m ${diffInSecondsRounded}s`;
  } else if (diffInHours < 24) {
    const diffInMinutesRounded = Math.floor(diffInMinutes % 60);
    return (
      `${Math.floor(diffInHours)}h` +
      (diffInMinutesRounded !== 0 ? ` ${diffInMinutesRounded}m` : "")
    );
  } else if (diffInHours < 24 * 365) {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day` + (diffInDays > 1 ? "s" : "");
  } else {
    const diffInYears = Math.floor(diffInHours / (24 * 365));
    return `${diffInYears} year` + (diffInYears > 1 ? "s" : "");
  }
}
