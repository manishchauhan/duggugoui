import React from 'react';
import  './UserList.css';
export default function UserList({ data, onClose }) {
  return (
    <div className='user-list-dropdown'>
      <h2>User List <button onClick={()=>{
         if(onClose)
         {
             onClose(false);
         }
      }}>Close</button></h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {data.map((user,index) => (
          <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px', fontSize: '24px' }}>
              {user.status === 'online' ? '🟢' : '🔴'}{/* Emoji for online and offline status */}
            </span>
            <span style={{ fontSize: '18px' }}>{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
