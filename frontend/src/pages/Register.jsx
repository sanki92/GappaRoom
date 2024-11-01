import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  function register() {
    localStorage.setItem("nickname", nickname);
    navigate(`/create-room`);
  }
  function handleInputChange(e) {
    const { value } = e.target;
    setNickname(value);
  }
  return (
    <div>
      <input
        onChange={handleInputChange}
        value={nickname}
        type="text"
        placeholder="Enter Nickname"
      />
      <button onClick={register}>Start</button>
    </div>
  );
};

export default Register;
