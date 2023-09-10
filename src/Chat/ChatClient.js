import React, { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import '../App.css';
import './ChatClient.css';
import { fetchData} from '../Util/http';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
export default function ChatClient() {
  const [msg, setMsg] = useState('');
  const [msgPool, setMsgPool] = useState([]);
  const [socket, setSocket] = useState(null);
  const [internalError, setInternalError] = useState('');
  const [userName,setUserName]=useState(``);
  const navigate = useNavigate(); // Initialize the navigate function
  
  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3001/ws'); // Adjust the URL as needed
    async function validateLogin(newSocket)
    {
        try
        {
            const responseData=await fetchData(`http://localhost:8080/user/home/chat`);
            if (newSocket && responseData.status)
            {
               setUserName(responseData.User.username)
               const welcomeMsg=`Welcome to Chat:  ${responseData.User.username}`;
               newSocket.send(welcomeMsg);
            }
        }catch(error)
        {
          setInternalError('Something happen wrong ' + error.message);
        }
    }
   
   

    newSocket.addEventListener('open', () => {
      console.log('Connected to server');
    });

    newSocket.addEventListener('error', (error) => {
      console.log('Connection error:', error);
    });

    newSocket.addEventListener('message', (event) => {
      const newMsg = JSON.parse(event.data);
      setMsgPool((prevMsgPool) => [newMsg.text, ...prevMsgPool]);
    });

    setSocket(newSocket);
    validateLogin(newSocket);
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
  async function Logout()
  {
    try
    {
        const responseData=await fetchData(`http://localhost:8080/user/logout`);
       if(!responseData.status)
       {
        navigate("/")
       }
    }catch(error)
    {
      setInternalError('Something happen wrong ' + error.message);
    }
  }
  return (
    <div className='chat-container'>  
      <button className="send-button" onClick={Logout}>Logout</button>
      <div className='room-name'>Room Name: Computers</div>
      {internalError && <div>{internalError}</div>}
      <div className='chat-box'>
        {msgPool.map((msg, index) => (
          <span key={index} className='chat-text'>
            {msg}
          </span>
        ))}
      </div>
      <div className='message-input'>
        <textarea
          value={msg}
          rows='4'
          placeholder='Type your message...'
          onChange={(evt) => {
            setMsg(evt.target.value);
          }}
        />
        <button className='send-button' onClick={addMessage}>
          Send Message
        </button>
      </div>
    </div>
  );
}
