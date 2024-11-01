import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://gapparoom-production.up.railway.app");

const RoomCreation = () => {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  const [pageState, setPageState] = useState(0);
  const navigate = useNavigate();
  const nickname = localStorage.getItem("nickname");

  function handleRoomName(e) {
    const { value } = e.target;
    setRoomName(value);
  }
  function handleRoomId(e) {
    const { value } = e.target;
    setRoomId(value);
  }

  function createRoom() {
    socket.emit("createRoom", { roomName, nickname });

    // Listen for room creation confirmation and save the roomId
    socket.on("roomCreated", ({ roomId }) => {
      localStorage.setItem("roomId", roomId);
      console.log("Room created with ID:", roomId);
      navigate(`/gapparoom/${roomId}`);
    });
  }

  function joinRoom() {
    // socket.emit("joinRoom", { roomId, nickname });

    // // Listen for room join confirmation and save the roomId
    // socket.on("roomJoined", ({ roomId }) => {
    //   localStorage.setItem("roomId", roomId);
    //   console.log("Joined room with ID:", roomId);
    // });
    navigate(`/gapparoom/${roomId}`);
  }

  return (
    <div>
      {pageState === 0 && (
        <>
          <button onClick={() => setPageState(1)}>Join Room</button>
          <button onClick={() => setPageState(2)}>Create Room</button>
        </>
      )}

      {pageState === 1 && (
        <>
          <input
            onChange={handleRoomId}
            value={roomId}
            type="text"
            placeholder="Enter Room Id"
          />
          <button onClick={joinRoom}>Join</button>
        </>
      )}

      {pageState === 2 && (
        <>
          <input
            onChange={handleRoomName}
            value={roomName}
            type="text"
            placeholder="Enter Room Name"
          />
          <button onClick={createRoom}>Create</button>
        </>
      )}
    </div>
  );
};

export default RoomCreation;
