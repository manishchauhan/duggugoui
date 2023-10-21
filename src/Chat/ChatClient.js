import React, { useState, useEffect,useReducer  } from 'react';
import EmojiPicker, { EmojiStyle, SuggestionMode } from 'emoji-picker-react'; // Update your import
import '../App.css';
import './ChatClient.css';
import { fetchData} from '../Util/http';
import { json, useNavigate } from 'react-router-dom';
import Rooms from '../Components/Rooms';


// Define your initial state and reducer
export default function ChatClient() {
  const [msgObject, setMsgObject] = useState({ time: '', text: '', user: '' });
  const [msgPool, setMsgPool] = useState([]);
  const [socket, setSocket] = useState(null);
  const [internalError, setInternalError] = useState('');
  const [username, setUserName] = useState('');
  const [userid, setUserId] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    async function validateLogin() {
      try {
        // Assuming your fetchData function returns a JSON object with the username property
        const responseData = await fetchData('http://localhost:8080/user/home/chat');
        setUserName(responseData.User.username);
        console.log(responseData.User.userid)
        setUserId(responseData.User.userid);
      } catch (error) {
        setInternalError('Something went wrong ' + error.message);
      }
    }

    validateLogin();

    const newSocket = new WebSocket('ws://localhost:3001/ws');
    newSocket.addEventListener('open', () => {});

    newSocket.addEventListener('error', (error) => {
      console.log('Connection error:', error);
    });

    newSocket.addEventListener('message', (event) => {
      const chatMsgObject = JSON.parse(event.data);
      setMsgPool((prevMsgPool) => [chatMsgObject, ...prevMsgPool]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  function addMessage() {
    if (socket && msgObject) {
      const newMsgObject={...msgObject,user:username};
      socket.send(JSON.stringify(newMsgObject)); // Sending the message as a JSON string
      setMsgObject({ ...msgObject, text: '' }); // Clear the message text
    }
  }

  async function Logout() {
    try {
      // Assuming your fetchData function handles API requests correctly
      const responseData = await fetchData('http://localhost:8080/user/logout');
      if (!responseData.status) {
        navigate('/');
      }
    } catch (error) {
      setInternalError('Something went wrong ' + error.message);
    }
  }

  function onEmojiSelect(emojiData, event) {
    // Combine the selected emoji with the existing message
    setMsgObject((prevMsgObject) => {
      return {
        ...prevMsgObject,
        text: prevMsgObject.text + emojiData.emoji,
      };
    });
  }

  return (
    <div className='mainContainer'>
      <Rooms userid={userid}></Rooms>
      <div className="chat-container">
      <button className="send-button" onClick={Logout}>
        Video Call
      </button>
      <button className="send-button" onClick={Logout}>
        Audio Call
      </button>
      <button className="send-button" onClick={Logout}>
        Logout
      </button>
      <div className="room-name">Room Name: Computers</div>
      {internalError && <div>{internalError}</div>}
      <div className="chat-box">
        {msgPool.map((msgObject, index) => (
          <div key={index} className="chat-message">
            <span className="sender">{msgObject.user}</span>
            <div className="message">{msgObject.text}</div>
            <div className="timestamp">{msgObject.time}</div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea
          value={msgObject.text}
          rows="4"
          placeholder="Type your message..."
          onChange={(evt) => {
            setMsgObject({ ...msgObject, text: evt.target.value });
          }}
        />
        <div className="divClass">
          <EmojiPicker
            height={300}
            width={200}
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
    </div>
    
  );
}