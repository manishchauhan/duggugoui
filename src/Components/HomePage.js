import React, { useState ,Suspense, useEffect} from 'react';
import './HomePage.css'; // Import the external CSS file
import '../App.css';
import { BrowserRouter as Router, Route, Routes,useNavigate } from 'react-router-dom';

function HomePage() {
  const [activeTab, setActiveTab] = useState('games'); // Initialize the active tab
   const navigate = useNavigate(); // Initialize the navigate function
  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab when a button is clicked
  };
  //open 3d game
  const open3dGame=()=>{
    navigate("/3dgame")
  }
  const openFullScreenPage = () => {
   
  
  };
  const openChatWindow=()=>{
    navigate("/home/chat")
  }
  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <div className="button-container">
        <button
          className={`tab-button ${activeTab === 'games' && 'active'}`}
          onClick={() => handleTabChange('games')}
        >
          Games
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' && 'active'}`}
          onClick={() => handleTabChange('chat')}
        >
          Chat
        </button>
        <button className="logout-button">Logout</button>
      </div>

      {/* Conditional rendering based on the active tab */}
      {activeTab === 'games' && (
        <div className="games-tab">
          <h3>Games Tab</h3>
          {/* Render your game components here */}
          <div
            onClick={openFullScreenPage}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Game 1 Content (Click to Open Full Screen)
          </div>
          <div   onClick={open3dGame} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Game 2 Content</div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="chat-tab">
          <h3>Chat Tab</h3>
          {/* Render your chat components here */}
          <div  onClick={openChatWindow} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Chat Content</div>
        </div>
      )}
     
    </div>
  );
}

export default HomePage;
