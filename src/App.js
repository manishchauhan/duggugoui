import React, { Suspense, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ScoreBoard } from './Game/scoreBoard';
import MainPage from './Components/MainPage';
const LazyGame = React.lazy(() => import('./Game/Game'));
const LazyChat = React.lazy(() => import('./Chat/ChatClient'));
// Lazy load the HomePage component
const LazyHomePage = React.lazy(() => import('./Components/HomePage'));

function App() {
  const [scoreData,setScoreData]=useState({missedBullet:0,totalTime:0,score:0,life:0,gameOver:false})

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/home/*"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LazyHomePage />
              </Suspense>
            }
          />
           <Route
            path="/home/chat"
            element={
              <Suspense fallback={<div>Loading Chat...</div>}>
                <LazyChat />
              </Suspense>
            }
          />
            <Route
            path="/3dgame"
            element={
              <Suspense fallback={<div>Loading Game...</div>}>
                <>
                <ScoreBoard  score={scoreData.score} missedBullet={scoreData.missedBullet} timeleft={scoreData.timeleft}></ScoreBoard>
                <LazyGame callBack={(data)=>{
                  
                    setScoreData({...data})
                }}/>
                </>
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
