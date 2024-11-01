import React, { useEffect, useState } from "react";

const ChatBox = ({ socket, roomId, nickname }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("sendMessage", { roomId, nickname, message });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receiveMessage", ({ nickname, message }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { nickname, message, type: "message" },
      ]);
    });
    socket.on("notification", ({ type, message }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message, type: "notification" },
      ]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId, nickname]);

  return (
    <div>
      <ul
        className="text-red-300"
        style={{ backgroundColor: "lightgray", padding: "10px" }}
      >
        {messages.map((item, index) => (
          <li className=" clear-both" key={index}>
            {item.type == "message" ? (
              <span className={`${item.nickname===nickname? "float-right":"float-left"}`}>
                <strong>{item.nickname}:</strong> {item.message}
              </span>
            ) : (
              <span className="bg-black">{item.message}</span>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
