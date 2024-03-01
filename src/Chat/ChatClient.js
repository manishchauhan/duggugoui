import React, { useState, useEffect  } from 'react';
import EmojiPicker, { EmojiStyle, SuggestionMode } from 'emoji-picker-react'; // Update your import
import '../App.css';
import './ChatClient.css';
import { fetchData,ConvertToHyperlink} from '../Util/http';

import {  useNavigate } from 'react-router-dom';
import Rooms from '../Components/Rooms';
import UserList from './UserList';
import ConfirmationModal from '../Shared/ConfirmationModal';
import  GroupChatWindow from '../Components/GroupChatWindow'
/*
const (
	TextMessage EnumMessageType = iota // simple message
	JoinRoom                           // welcome message when user joins a channel
	LeaveRoom                          //  message when user leaves a channel
	Request                            //   request to join a channel
	Sdpoffer
)
TextMessage roomModel.EnumMessageType = iota // simple message
	JoinRoom                                     // welcome message when user joins a channel
	LeaveRoom                                    //  message when user leaves a channel
	Request                                      //   request to join a channel
	VideoCall
	Candidate // Sdpoffer
	Offer     //Offer
	Answer    //Answer
*/
const EnumMessageType={
  TextMessage:0,
  JoinRoom:1,
  LeaveRoom:2,
  Request:3,
  VideoCall:4,
  Candidate:5, //send sdp offer to backend
  Offer:6,
  Answer:7,
  DeleteChannel:8 // delete a channel webrtc
}
let ConnectionID="";

let currentRoom;
const roomMap= new Map();
const isConnectionAlreadyExistsInMap=new Map();

// Define your initial state and reducer
export default function ChatClient() {
  const [msgObject, setMsgObject] = useState({});
  const [msgPool, setMsgPool] = useState([]);
  const [socket, setSocket] = useState(null);
  const [internalError, setInternalError] = useState('');
  const [username, setUserName] = useState('');
  const [userid, setUserId] = useState();
  const [roomData,setRoomData] = useState({});
  const [hideUserList,setHideUserList] = useState(false);
  const [newUserList,setNewUserList] = useState([])
 // const [ConnectionID,setConnectionID]=useState('');
  const [newMsgObject, setNewMsgObject] = useState({ });
  const [showVideoCmp,setShowVideoCmp] = useState(false);
  //Offer Candidate
  const [Offer,setOffer] = useState(null);
  const [Candidate,setCandidate] = useState(null);
  const navigate = useNavigate();
  const [webRTCPeerID,setWebRTCPeerID]=useState()
  const [cacheArray,setCacheArray]=useState([])
  useEffect(()=>{
    setMsgPool([...cacheArray,...msgPool])
  },[cacheArray,setCacheArray])
  //initializeWebSocketConnection
  async function getChatLobby() {
    //1
    try {
      // Assuming your fetchData function returns a JSON object with the username property
      const responseData = await fetchData('http://localhost:8080/user/home/chat');
      setUserName(responseData.User.username);
      setUserId(responseData.User.userid);
      
    } catch (error) {
      setInternalError('Something went wrong ' + error.message);
    }
   
  }
  function CleanOldData()
  {
    if(socket)
    {
      setCacheArray([])
      setMsgPool([]); //empty all messages
      setMsgObject({content:''});//remove all message
    }

  }
  async function loadInitData(__roomData) {
    CleanOldData();
    const chatroomid = __roomData.chatroom_id;
    try {
        const responseCache = await fetchData(`http://localhost:8080/chatrooms/cache?roomID=${chatroomid}`);
        const msgArray=[];
        for (let i = responseCache.length-1; i >=0; --i) {
           const chatMsgObject=JSON.parse(responseCache[i].Values.data)
           chatMsgObject.time=responseCache[i].Values.time;
           chatMsgObject.user=responseCache[i].Values.time;
            msgArray.push(chatMsgObject)
        }
        setCacheArray([...msgArray]);
    } catch (error) {
        setInternalError('Something went wrong: ' + error.message);
    }
   
    if (roomMap.has(chatroomid) && roomMap.get(chatroomid).length > 0) {
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
      const webSocketMessage = JSON.parse(event?.data);
      console.log("webSocketMessage",webSocketMessage)
      if(webSocketMessage.messagetype===EnumMessageType.DeleteChannel)
      {
        setShowVideoCmp(false)
        return;
      }
      
      if(webSocketMessage.connectionid)
      {
        ConnectionID=webSocketMessage.connectionid;
      }
     
      
  
      if(webSocketMessage.messagetype===EnumMessageType.Offer)
      {
        //do offer Offer stuff
          if(webSocketMessage.rtcpeerid)
        {

          setWebRTCPeerID(webSocketMessage.rtcpeerid)
        }
       
        setOffer(webSocketMessage);
        return;
      }
      if(webSocketMessage.messagetype===EnumMessageType.Candidate)
      {
        //do offer Candidate stuff
        if(webSocketMessage.rtcpeerid)
        {
          setWebRTCPeerID(webSocketMessage.rtcpeerid)
        }
        
        setCandidate(webSocketMessage)
        return;
      }
      if(!webSocketMessage.data)
      {
        return;
      }
      const chatMsgObject=JSON.parse(webSocketMessage.data)
     
      chatMsgObject.messagetype=webSocketMessage?.messagetype;
      chatMsgObject.roomid=webSocketMessage?.roomid;
      chatMsgObject.user=webSocketMessage?.user;
      chatMsgObject.time=webSocketMessage?.time;
     
      if(webSocketMessage.roomid===currentRoom.chatroom_id)
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
    newSocket.onerror = function(evt) {
      console.log("ERROR: " + evt.data)
    }
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
      let roomid;
      if(welcomeMsg && __roomData)
      {

        roomid=__roomData.chatroom_id;
        newMsgObject={...welcomeMsg};
      }else
      {
        roomid=roomData.chatroom_id;
        newMsgObject={...msgObject};
      }
      const WebsocketMessage={messagetype:__messagetype,user:username,roomid:roomid,connectionid:ConnectionID,data:JSON.stringify(newMsgObject)}
      socket.send(JSON.stringify(WebsocketMessage)); // Sending the message as a JSON string
      setMsgObject({ ...msgObject, content: '' }); // Clear the message text

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
        content: prevMsgObject.content + emojiData.emoji,
      };
    });
  }
  function StartVideoCall()
  {
    //start signal
    //sendMessage(EnumMessageType.Sdpoffer,"signal",roomData)
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
          const welcomeMsg={content:  `${username} Joined the Room` }
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
            <div className="message">{ConvertToHyperlink(msgObject.content)}</div>
            <div className="timestamp">{msgObject.time}</div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea
          value={msgObject.content}
          rows="4"
          placeholder="Type your message..."
          onChange={(evt) => {
            setMsgObject({ ...msgObject, content: evt.target.value });
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
        const WebsocketMessage={connectionid:ConnectionID,messagetype:EnumMessageType.DeleteChannel,user:username,roomid:roomData.chatroom_id}
        socket.send(JSON.stringify(WebsocketMessage));
        
       }} >
      
          <GroupChatWindow RTCPeerID={webRTCPeerID} Offer={Offer} Candidate={Candidate} onVideoCallReady={()=>{
            const WebsocketMessage={connectionid:ConnectionID,messagetype:EnumMessageType.VideoCall,user:username,roomid:roomData.chatroom_id}
            socket.send(JSON.stringify(WebsocketMessage));
          }} onicecandidate={(candidate,RTCPeerID)=>{
            
            const WebsocketMessage={rtcpeerid:RTCPeerID,connectionid:ConnectionID,data:JSON.stringify(candidate,RTCPeerID),messagetype:EnumMessageType.Candidate,user:username,roomid:roomData.chatroom_id}
            
           socket.send(JSON.stringify(WebsocketMessage));
        }}  sendAnswer={(answer,RTCPeerID)=>{
          
            const WebsocketMessage={rtcpeerid:RTCPeerID,connectionid:ConnectionID,data:JSON.stringify(answer),messagetype:EnumMessageType.Answer,user:username,roomid:roomData.chatroom_id}
           
           socket.send(JSON.stringify(WebsocketMessage));
        }}></GroupChatWindow>
        </ConfirmationModal>
      }
    </div>
    
  );
}