import React, { useState, useEffect  } from 'react';
import EmojiPicker, { EmojiStyle, SuggestionMode } from 'emoji-picker-react'; // Update your import
import '../App.css';
import './ChatClient.css';
import { fetchData} from '../Util/http';
import Peer from 'simple-peer';
import {  useNavigate } from 'react-router-dom';
import Rooms from '../Components/Rooms';
import UserList from './UserList';
import ConfirmationModal from '../Shared/ConfirmationModal';
import { VideoRoom} from '../Components/VideoRoom'
/*
const (
	TextMessage EnumMessageType = iota // simple message
	JoinRoom                           // welcome message when user joins a channel
	LeaveRoom                          //  message when user leaves a channel
	Request                            //   request to join a channel
	videoRequest
)

*/
const EnumMessageType={
  TextMessage:0,
  JoinRoom:1,
  LeaveRoom:2,
  Request:3,
  videoRequest:4
}
let currentRoom;
const roomMap= new Map();
const isConnectionAlreadyExistsInMap=new Map();
const peersConnectionMap = new Map();
// Define your initial state and reducer
export default function ChatClient() {
  const [msgObject, setMsgObject] = useState({ time: '', text: '', user: '',roomid: '',messagetype:0,connectionid:''});
  const [msgPool, setMsgPool] = useState([]);
  const [socket, setSocket] = useState(null);
  const [internalError, setInternalError] = useState('');
  const [username, setUserName] = useState('');
  const [userid, setUserId] = useState();
  const [roomData,setRoomData] = useState({});
  const [hideUserList,setHideUserList] = useState(false);
  const [newUserList,setNewUserList] = useState([])
  const [ConnectionID,setConnectionID]=useState('');
  const [newMsgObject, setNewMsgObject] = useState({ });
  const [showVideoCmp,setShowVideoCmp] = useState(false);


  const navigate = useNavigate();

  //initializeWebSocketConnection
  async function getChatLobby() {
    //1
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
  function CleanOldData()
  {
    if(socket)
    {
      setMsgPool([]); //empty all messages
      setMsgObject({text:''});//remove all message
    }

  }
  function loadInitData(__roomData) {
    CleanOldData();
    const chatroomid=__roomData.chatroom_id;

    if(roomMap.has(chatroomid) && roomMap.get(chatroomid).length > 0) {
        const oldMessage = roomMap.get(chatroomid);
       setMsgPool([...oldMessage]);
    }


  }
  function updateUserList(chatMsgObject) {
    const userObject = { name: chatMsgObject.user, status: "online" };
  
    setNewUserList((oldUserList) => {

      const uniqueUserSet = new Set([...oldUserList, userObject].map(user => user.name));
      const sortedUniqueUsers = Array.from(uniqueUserSet).sort();
      const updatedUserList = sortedUniqueUsers.map(name => ({ name, status: "online" }));
  
      return updatedUserList;
    });
  }
  function handleUserJoined(chatMsgObject)
  {
    console.log(chatMsgObject)
  }
 
  useEffect(() => {
    getChatLobby();
    const newSocket = new WebSocket('ws://localhost:3001/ws');
    newSocket.addEventListener('open', (event) => {
    //  console.log(event)
    });

    newSocket.addEventListener('error', (error) => {
      console.log('Connection error:', error);
    });

    newSocket.addEventListener('message', (event) => {
      const chatMsgObject = JSON.parse(event.data);
        
      //start a video call no need to send a request
      if(chatMsgObject.messagetype===EnumMessageType.videoRequest)
      { 
          handleUserJoined(chatMsgObject);
         return;
      }
      if(chatMsgObject.roomid===currentRoom.chatroom_id)
      {
        pushMessageToChatMap(chatMsgObject)
        setMsgPool((prevMsgPool) => [chatMsgObject, ...prevMsgPool]);
        updateUserList(chatMsgObject)
      }else
      {
         pushMessageToChatMap(chatMsgObject)
      }
      setNewMsgObject(chatMsgObject);
      
    });
   
    setSocket(newSocket);
    
    return () => {
      if(newSocket)
      {
        newSocket.close();
      }
  
    };
  }, []);
  function pushMessageToChatMap(newMsgObject)
  {
      const roomId=newMsgObject.roomid;

      if(roomMap.has(roomId))
      {
        roomMap.get(roomId).unshift(newMsgObject)
      }else
      {

        roomMap.set(roomId,[])
        roomMap.get(roomId).unshift(newMsgObject)
      }
  }
  function sendMessage(__messagetype=EnumMessageType.TextMessage,welcomeMsg=null,__roomData=null) {
    if (socket ) {
      let newMsgObject;
      if(welcomeMsg && __roomData)
      {
        newMsgObject={...welcomeMsg,connectionid:ConnectionID,user:username,roomid:__roomData.chatroom_id,messagetype:__messagetype};
      }else
      {
        newMsgObject={...msgObject,connectionid:ConnectionID,user:username,roomid:roomData.chatroom_id,messagetype:__messagetype};
      }
      socket.send(JSON.stringify(newMsgObject)); // Sending the message as a JSON string
      setMsgObject({ ...msgObject, text: '' }); // Clear the message text
      if(__roomData)
      {
        isConnectionAlreadyExistsInMap.set(__roomData.chatroom_id,"YES")//
      }

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
  function StartVideoCall()
  {
    //start signal
    sendMessage(EnumMessageType.videoRequest,"signal",roomData)
    setShowVideoCmp(true)
  }
  function showUserList()
  {
    
    setHideUserList(true);
  }
  function dataAvailable()
  {
    return  username&&socket&&roomData
  }
  return (
    <div className='mainContainer'>
      {
       dataAvailable() &&<Rooms userid={userid} onRoomSelect={(__roomData)=>{
        currentRoom=__roomData;
        setRoomData(__roomData);
        loadInitData(__roomData);
        if( !isConnectionAlreadyExistsInMap.has(__roomData.chatroom_id))
        {
          const welcomeMsg={text:  `${username} Joined the Room` }
          sendMessage(EnumMessageType.JoinRoom,welcomeMsg,__roomData)
        }
      
      }} onRoomDelete={(selectedRooms)=>{
        selectedRooms.forEach(room => {
          sendMessage(EnumMessageType.LeaveRoom,"",room)
        });
      }} __roomMessage={newMsgObject}></Rooms>
      }
      <div className="chat-container">
      <div style={{display:"flex"}}>
      <button className="send-button" onClick={(StartVideoCall)}>
        Video Call
      </button>
      <button className="send-button" onClick={Logout}>
        Audio Call
      </button>
      <button className="send-button" onClick={Logout}>
        Logout
      </button>
      <div>
      <button className="send-button" onClick={showUserList}>
      Show User List
      </button>
    
      </div>
      </div>
      <div className="room-name">(User Name: {username}) Room Name: {roomData.chatroom_name}</div>
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
        <button className="send-button" onClick={()=>{
          sendMessage();
        }}>
          Send Message
        </button>
      </div>
    </div>
    {hideUserList&&<UserList data={newUserList} onClose={(status)=>{
          setHideUserList(status)
        }}></UserList>}
      {
        showVideoCmp&&<ConfirmationModal onCancel={()=>{
          setShowVideoCmp(false)
       }} onConfirm={()=>{
        setShowVideoCmp(false)
       }} >
          <VideoRoom></VideoRoom>
        </ConfirmationModal>
      }
    </div>
    
  );
}