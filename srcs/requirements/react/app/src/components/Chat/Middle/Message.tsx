import CatPongImage from "../../CatPongImage";

import "../../../styles/Chat/Middle/Messages.css";

export default function Message({
  message,
  myInfos,
  recipientInfos,
}: MessageProps) {
  const isCatPongTeam = recipientInfos.id === "CatPong's Team";

  const imTheSender = (message: Message) => {
    if (!myInfos) return false;
    return message.senderid === myInfos.id || message.sender?.id === myInfos.id;
  };

  return (
    <div
      className="message-container"
      style={{
        flexDirection: imTheSender(message) ? "row-reverse" : "row",
      }}
    >
      <CatPongImage
        user={
          message.sender ||
          (message.senderid === myInfos.id ? myInfos : recipientInfos)
        }
        className="message-image"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          [imTheSender(message) ? "paddingRight" : "paddingLeft"]: "2%",
        }}
      >
        {recipientInfos.isChan && message.sender?.id !== myInfos.id && (
          <div style={{ marginRight: "auto", marginLeft: 10 }}>
            {message.sender?.name}
          </div>
        )}
        <div
          className="message-content"
          style={{
            alignSelf: imTheSender(message) ? "flex-end" : "flex-start",
            fontFamily: message.id === -2 ? "monospace" : undefined,
            opacity: message.sent === false ? 0.6 : 1,
          }}
        >
          {message.content}
        </div>
        <div
          className="message-date"
          style={
            imTheSender(message)
              ? {
                  alignSelf: "flex-end",
                  marginRight: 10,
                }
              : {
                  alignSelf: "flex-start",
                  marginLeft: 10,
                }
          }
        >
          {!isCatPongTeam && formatDate(message.time)}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day}-${year} ${hours}:${minutes}`;
}
