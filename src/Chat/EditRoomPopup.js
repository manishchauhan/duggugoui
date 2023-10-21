import React, { useState, useEffect } from 'react';
import './CreateRoomPopup.css';
import { fetchData } from '../Util/http';

function EditRoomPopup({ isOpen, onClose, onSave, initialData }) {
  const [roomName, setRoomName] = useState(initialData?.chatroom_name);
  const [roomDetails, setRoomDetails] = useState(initialData?.chatroom_details);
  const [error, setError] = useState('');

  useEffect(() => {
    setRoomName(initialData?.chatroom_name);
    setRoomDetails(initialData?.chatroom_details);
  }, [initialData]);

  const handleSaveRoom = async () => {
    if (!roomName || !roomDetails) {
      setError("Room name and details can't be empty.");
      return;
    }
    const updatedData = {
      chatroom_id:initialData.chatroom_id,
      chatroom_name: roomName,
      chatroom_details: roomDetails
    };

    try {
      const responseData = await fetchData(
        `http://localhost:8080/chatrooms/edit`,
        'POST',
        updatedData
      );
      if (responseData.status) {
        setError('Room updated successfully');
      }

      setTimeout(() => {
        setError('');
        onSave({ chatroom_id:initialData.chatroom_id,chatroom_name: roomName, chatroom_details: roomDetails });
        onClose();
      }, 3000);
    } catch (error) {
      setError('Something went wrong ' + error.message);
    }
  };

  return isOpen ? (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Edit Room</h2>
        {error && <div className="error-banner">{error}</div>}
        <label htmlFor="roomName">Room Name:</label>
        <input
          type="text"
          defaultValue={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <label htmlFor="roomDetails">Room Details:</label>
        <textarea
          rows="4"
          cols="20"
          defaultValue={roomDetails}
          onChange={(e) => setRoomDetails(e.target.value)}
        />
        <div>
          <button onClick={handleSaveRoom}>Save</button>
          <button
            onClick={() => {
              onClose();
              setError('');
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default EditRoomPopup;
