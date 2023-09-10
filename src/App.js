import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './Components/MainPage';
const LazyGame = React.lazy(() => import('./Game/Game'));
const LazyChat = React.lazy(() => import('./Chat/ChatClient'));
// Lazy load the HomePage component
const LazyHomePage = React.lazy(() => import('./Components/HomePage'));

function App() {
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
                <LazyGame />
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
