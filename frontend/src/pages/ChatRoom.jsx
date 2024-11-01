import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../utils/socket";
import ChatBox from "../components/ChatBox";

const ChatRoom = () => {
  const { id } = useParams();
  const roomId = localStorage.getItem("roomId");
  const nickname = localStorage.getItem("nickname");
  const [members, setMembers] = useState([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (roomId && nickname) {
      socket.emit("joinRoom", { roomId, nickname });

      socket.on("roomJoined", ({ roomId }) => {
        localStorage.setItem("roomId", roomId);
        console.log("Joined room with ID:", roomId);
      });

      socket.on("roomData", ({ room, members }) => {
        setRoomName(room);
        setMembers(members);
      });

      return () => {
        socket.off("roomJoined");
        socket.off("roomData");
      };
    }
  }, [roomId, nickname]);

  return (
    <div>
      <h2>Chat Room for {roomName ? roomName : "Loading..."}</h2>
      <ChatBox socket={socket} roomId={roomId} nickname={nickname} />
      <div>
        <h4>Members:</h4>
        <ul>
          {members.map((member, index) => (
            <li key={index}>{member.nickname}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatRoom;
