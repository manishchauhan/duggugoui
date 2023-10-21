import React, { useState } from 'react';
import './CreateRoomPopup.css';
import { fetchData} from '../Util/http';
function CreateRoomPopup({ isOpen, onClose, onCreate ,userid,onSave}) {
  const [roomName, setRoomName] = useState('');
  const [roomDetails, setRoomDetails] = useState('');
  const [error, setError] = useState('');
  const handleCreateRoom = async() => {
    if (!roomName || !roomDetails) {
      setError("Room name and details can't be empty.");
      return;
    }
    /*
      type IFroomModel struct {
      ChatroomId      int    `json:"chatroom_id"`        //room_id
      ChatroomName    string `json:"chatroom_name"`      //name
      CreatedbyUserid string `json:"created_by_user_id"` //user_id
      CreatedAt       string `json:"created_at"`         //created_at time.Time
      ChatroomDetails string `json:"chatroom_details"`   //details
    }

    */
   const roomData={
    created_by_user_id:userid,
    chatroom_name:roomName,
    chatroom_details:roomDetails
  }

    try {
      // Assuming your fetchData function returns a JSON object with the username property
      const responseData = await fetchData('http://localhost:8080/chatrooms/add','POST',roomData);
      if(responseData.status)
      {
        setError("Room Created successfully")
      }
      setRoomName('');
      setRoomDetails('');
      setTimeout(()=>{
        setError("")
        onClose();
        onSave(roomData);
      },3000)
    } catch (error) {
      setError('Something went wrong ' + error.message);
    }
   
    
  };

  return isOpen ? (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create a New Room</h2>
        {error && <div className="error-banner">{error}</div>}
        <label htmlFor="roomName">Room Name:</label>
        <input
          type="text"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <label htmlFor="roomDetails">Room Details:</label>
        <textarea
          rows="4" cols="20"
          id="roomDetails"
          value={roomDetails}
          onChange={(e) => setRoomDetails(e.target.value)}
        />
        <div>
          <button onClick={handleCreateRoom}>Create</button>
          <button onClick={()=>{
            onClose();
             setError("")
          }}>Close</button>
        </div>
      </div>
    </div>
  ) : null;
}

export default CreateRoomPopup;
