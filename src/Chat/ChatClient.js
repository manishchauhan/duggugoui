import React, { useState, useEffect } from 'react';
import EmojiPicker, { EmojiStyle, SuggestionMode } from 'emoji-picker-react'; // Update your import
import '../App.css';
import './ChatClient.css';
import { fetchData, getCookie, useFetch } from '../Util/http';
import { useNavigate } from 'react-router-dom';

export default function ChatClient() {
  const [msg, setMsg] = useState('');
  const [msgPool, setMsgPool] = useState([]);
  const [socket, setSocket] = useState(null);
  const [internalError, setInternalError] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    async function validateLogin() {
      try {
        const responseData = await fetchData('http://localhost:8080/user/home/chat');
        setUserName(responseData.User.username);
      } catch (error) {
        setInternalError('Something happened wrong ' + error.message);
      }
    }
    validateLogin();

    const newSocket = new WebSocket('ws://localhost:3001/ws');
    newSocket.addEventListener('open', () => {});

    newSocket.addEventListener('error', (error) => {
      console.log('Connection error:', error);
    });

    newSocket.addEventListener('message', (event) => {
      const newMsg = JSON.parse(event.data);
      setMsgPool((prevMsgPool) => [newMsg.text, ...prevMsgPool]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  function addMessage() {
    if (socket && msg) {
      socket.send(`${userName}:= ${msg}`);
      setMsg('');
    }
  }

  async function Logout() {
    try {
      const responseData = await fetchData('http://localhost:8080/user/logout');
      if (!responseData.status) {
        navigate('/');
      }
    } catch (error) {
      setInternalError('Something happened wrong ' + error.message);
    }
  }

  function onEmojiSelect(emojiData, event) {
    // Combine the selected emoji with the existing message
    setMsg((prevMsg) => prevMsg + emojiData.emoji);
  }

  return (
    <div className="chat-container">
      <button className="send-button" onClick={Logout}>
        Logout
      </button>
      <div className="room-name">Room Name: Computers</div>
      {internalError && <div>{internalError}</div>}
      <div className="chat-box">
        {msgPool.map((msg, index) => (
          <span key={index} className="chat-text">
            {msg}
          </span>
        ))}
      </div>
      <div className="message-input">
        <textarea
          value={msg}
          rows="4"
          placeholder="Type your message..."
          onChange={(evt) => {
            setMsg(evt.target.value);
          }}
        />
        <div className="divClass">
          <EmojiPicker  height={300} width={200}
            onEmojiClick={onEmojiSelect}
            emojiStyle={EmojiStyle.NATIVE}
            suggestionMode={SuggestionMode.IMPERFECT}
          />
        </div>
        <button className="send-button" onClick={addMessage}>
          Send Message
        </button>
      </div>
    </div>
  );
}
