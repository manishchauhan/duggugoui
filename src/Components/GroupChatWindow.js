import React, { useState, useEffect, useRef } from 'react';
import './GroupChatWindow.css';

export const GroupChatWindow = ({Offer,Candidate,onVideoCallReady=null,onicecandidate=null,sendAnswer=null}) => {
  const [localStream, setLocalStream] = useState(null);
  const [WebRtcPeerConnection, setWebRtcPeerConnection] = useState(null);
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
      if(onVideoCallReady)
      {
        onVideoCallReady();
      }
    };
    //create a PeerConnection

    init();
  }, []);
  function addPeerConnection() {
    // Create an RTCPeerConnection with iceServers
    const peerConnectionConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(peerConnectionConfig);

    // Add local stream tracks to the peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Set up event handler for incoming tracks
    peerConnection.ontrack = (event) => {
      
      // Do something with the remote stream, e.g., display it in a video element
    };

    // Set up event handler for ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        return
      }
      onicecandidate(event.candidate)
    };

    setWebRtcPeerConnection(peerConnection)
    
  }
  useEffect(()=>{
    if(Candidate!==null) {
      let candidate = JSON.parse(Candidate.data)
      if (!candidate) {
        return console.log('failed to parse candidate')
      }
      WebRtcPeerConnection.addIceCandidate(candidate)
    }
  },[Candidate])
  //Offer
  useEffect(()=>{
    if(Offer!==null) {
      let offer = JSON.parse(Offer.data)
      if (!offer) {
        return console.log('failed to parse answer')
      }
      WebRtcPeerConnection.setRemoteDescription(offer)
      WebRtcPeerConnection.createAnswer().then(answer => {
        WebRtcPeerConnection.setLocalDescription(answer)
        sendAnswer(answer)
      })
    }
  },[Offer])
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
    <div className='grid-container '>
    <div className="grid-item">
      <div>User Name</div>
      <video id="localVideo" autoPlay />
      <button onClick={handleToggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
      <button onClick={handleToggleHide}>{isHidden ? 'Show' : 'Hide'}</button>
    </div>
    </div>
  );
};


