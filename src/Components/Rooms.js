import React, { useState, useEffect } from 'react';
import CreateRoomPopup from '../Chat/CreateRoomPopup';
import { fetchData } from '../Util/http';
import './Room.css';
import EditRoomPopup from '../Chat/EditRoomPopup';
import ConfirmationModal from '../Shared/ConfirmationModal';
export default function Rooms({ userid,onRoomSelect,onRoomDelete }) {
  const [isRoomSelect, setisRoomSelect] = useState(false);
  const [isRoomEdit, setisRoomEdit] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [roomList, setRoomList] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedRoomIndex,SetSelectedRoomIndex]=useState(0);
  const [searchText, setSearchText] = useState('');
  const [editRoomData,setEditRoomData] = useState({});
  const [hideConfirmation,setHideConfirmation] = useState(false)
  async function getRoomData() {
    try {
      const responseData = await fetchData('http://localhost:8080/chatrooms/list');
      setRoomList(responseData);
      setInternalError(null);
      //select first room
      onRoomSelect(responseData[0])
    } catch (error) {
      setInternalError('Something went wrong: ' + error.message);
    }
  }
  useEffect(() => {
    
    getRoomData();
  }, []);

  const handleRoomSelect = (roomId) => {
    const updatedSelection = selectedRooms.includes(roomId)
      ? selectedRooms.filter((id) => id !== roomId)
      : [...selectedRooms, roomId];
    setSelectedRooms(updatedSelection);
  };
  const selectAllRooms=()=>{
    const updatedSelection = roomList
    .filter(room => room.created_by_user_id === userid)
    .map(room => room.chatroom_id);
     setSelectedRooms(updatedSelection);
  }
  const handleDeleteSelectedRooms = () => {
    deleteRoomFromServer();
  };

  async function deleteRoomFromServer() {
 
    if( !selectedRooms.length)
    {
      setInternalError("No rooms selected to delete");
      return;
    }
    try {
      const responseData = await fetchData('http://localhost:8080/chatrooms/delete', 'POST', selectedRooms);
      if (responseData.status) {
        setInternalError(responseData.message);
      }
    } catch (error) {
      setInternalError('Something went wrong ' + error.message);
    }
    const updatedRoomList = roomList.filter((room) => !selectedRooms.includes(room.chatroom_id));
    setRoomList(updatedRoomList);
    setSelectedRooms([]);
    setHideConfirmation(false);
    //Remove the one selected room or multiple selected Room
    if(onRoomDelete)
    {
      onRoomDelete(selectedRooms);
    }
    
  }

  const deleteRoom = (roomId) => {
    setHideConfirmation(true);
    setSelectedRooms([...selectedRooms, roomId]);
  }

  const filterRooms = roomList && roomList.length > 0
    ? roomList.filter((room) =>
      room.chatroom_name.toLowerCase().includes(searchText.toLowerCase())
    )
    : [];

  return (
    <div className="room-style">
      <div>
        <b>ALL ROOMS</b>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div>
        DELETE SELECTED ROOMS<input type="checkbox" onChange={
          (e) => {
            e.target.checked? selectAllRooms(): setSelectedRooms([]);          
          }
          }/>
        <button onClick={() => setisRoomSelect(true)}>Add</button>
        <button onClick={handleDeleteSelectedRooms}>
          Delete All Selected Rooms
        </button>
      </div>
      {internalError && (
        <div className="error-message">{internalError}</div>
      )}
      <div className="listHolder">
        {filterRooms.length === 0 ? (
          <div>No rooms found.</div>
        ) : (
          filterRooms.map((room,index) => (
            <div key={room.chatroom_id} className={ selectedRoomIndex === index?"room-item_select":"room-item"} onClick={()=>{
              onRoomSelect(room)
              SetSelectedRoomIndex(index)
            }}>
              <div>
                
                Room Name: <b>{room.chatroom_name}</b>
              </div>
              {userid === room.created_by_user_id ? (
                  <>
                <button
                  onClick={() => {
                    deleteRoom(room.chatroom_id);
                  }}
                >
                  Delete
                </button>
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(room.chatroom_id)}
                  onChange={() => handleRoomSelect(room.chatroom_id)}
                />
                <button onClick={()=>{
                  setEditRoomData({chatroom_name:room.chatroom_name,chatroom_details:room.chatroom_details,
                    chatroom_id:room.chatroom_id})
                  setisRoomEdit(true)
                }}>
                  Edit Room
                </button>
                </>
              ) : (
                <>Select Room</>
              )}
            </div>
          ))
        )}
      </div>
      <CreateRoomPopup
        userid={userid}
        isOpen={isRoomSelect}
        onClose={() => setisRoomSelect(false)}
        onSave={(newRoomData) => {
          getRoomData();
        }}
      ></CreateRoomPopup>
      <EditRoomPopup  isOpen={isRoomEdit} initialData={editRoomData} onClose={() => setisRoomEdit(false)} onSave={(updatedRoomData)=>{
        const updateRoomList=roomList.map((roomData)=>{
          return roomData.chatroom_id===updatedRoomData.chatroom_id?{...roomData,
            chatroom_name:updatedRoomData.chatroom_name,
            chatroom_details:updatedRoomData.chatroom_details
          }:roomData
        })
        setRoomList(updateRoomList);
      }}></EditRoomPopup>
      {hideConfirmation&&<ConfirmationModal message='Are you sure you want to continue...' onCancel={()=>{
         setSelectedRooms([]);
        setHideConfirmation(false);
      }} onConfirm={()=>{
        handleDeleteSelectedRooms();
      }}></ConfirmationModal>}
    </div>
  );
}
