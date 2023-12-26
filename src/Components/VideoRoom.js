import React, { useState, useEffect, useRef } from 'react';
import './VideoRoom.css';

export const VideoWindow = () => {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const videoRef = useRef(null);

  //Sender Video add Stream in localStream variable which 
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await getLocalStream();
    };
    //create a PeerConnection
    
    init();
  }, []);
  function addPeerConnection()
  {
    const PeerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    localStream.getTracks().forEach((track) => {
      PeerConnection.addTrack(track, localStream)
    });
    PeerConnection.ontrack=(event)=>{
      console.log(event.streams[0])
    }
  } 
  useEffect(() => {
    // Set videoRef using the callback function
    videoRef.current = document.getElementById('localVideo');

    // Ensure localStream and videoRef.current are available
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
       addPeerConnection()
      // Wait for the video to be loaded
      videoRef.current.addEventListener('loadedmetadata', () => {
        // Autoplay the video without sound
        videoRef.current.play().catch((error) => console.error('Error playing video:', error));
      });
    }
  }, [localStream]);

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleToggleHide = () => {
    if (videoRef.current) {
      setIsHidden(!isHidden);
      videoRef.current.style.display = isHidden ? 'block' : 'none';
    }
  };

  return (
    <div className="grid-item">
      <div>User Name</div>
      <video id="localVideo" autoPlay />
      <button onClick={handleToggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
      <button onClick={handleToggleHide}>{isHidden ? 'Show' : 'Hide'}</button>
    </div>
  );
};

export const VideoRoom = () => {
  return <div className="grid-container">
    <VideoWindow />
  </div>;
};
