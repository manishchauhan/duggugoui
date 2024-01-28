import React, { useState, useEffect, useRef } from 'react';
import './GroupChatWindow.css';

const GroupChatWindow = ({ RTCPeerID, Offer, Candidate, onVideoCallReady = null, onicecandidate = null, sendAnswer = null }) => {
  const [localStream, setLocalStream] = useState(null);
  const [WebRtcPeerConnection, setWebRtcPeerConnection] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [VideoStreams, setVideoStreams] = useState([]);
  const [AudioStreams, setAudioStreams] = useState([]);
  const videoRef = useRef(null);
  const [webRTCPeerID, setWebRTCPeerID] = useState(RTCPeerID);

  useEffect(() => {
    setWebRTCPeerID(RTCPeerID);
  }, [RTCPeerID]);

  useEffect(() => {
    const init = async () => {
      await getLocalStream();
      if (onVideoCallReady) {
        onVideoCallReady();
      }
    };

    init();
  }, []);





  useEffect(() => {
    videoRef.current = document.getElementById('localVideo');

    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
      const peerConnection = addPeerConnection();
      setWebRtcPeerConnection(peerConnection);

      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().catch((error) => console.error('Error playing video:', error));
      });
    }
  }, [localStream]);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const addPeerConnection = () => {
    const peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      // Update the state with the new stream
      if (event.track.kind !== `audio`) {
        setVideoStreams((prevStreams) => [...prevStreams, event.streams[0]]);
      }else
      {
        setAudioStreams((prevStreams) => [...prevStreams, event.streams[0]]);
      }
    };

    // Set onremovetrack event directly on the MediaStream object
    localStream.onremovetrack = ({ track }) => {
      // Remove the corresponding element from the DOM
      console.log('Track removed:', track);
      const index = VideoStreams.findIndex((stream) => stream.getTracks().includes(track));
      const el = document.getElementById(`remoteVideo-${index}`);
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }
      onicecandidate(event.candidate, webRTCPeerID);
    };

    return peerConnection;
  };

  useEffect(() => {
    if (Candidate && WebRtcPeerConnection && webRTCPeerID) {
      if (!WebRtcPeerConnection.remoteDescription) {

        return;
      }
      let candidate = JSON.parse(Candidate?.data);
    
      if (candidate) {
        WebRtcPeerConnection.addIceCandidate(candidate);
      }
    }
  }, [Candidate, WebRtcPeerConnection, webRTCPeerID]);

 

useEffect(() => {
  const handleOffer = async () => {
    if (Offer && WebRtcPeerConnection && webRTCPeerID) {
      try {
        const offer = JSON.parse(Offer.data);
        if (offer) {
          await WebRtcPeerConnection.setRemoteDescription(offer);
          const answer = await WebRtcPeerConnection.createAnswer();
          await WebRtcPeerConnection.setLocalDescription(answer);
          sendAnswer(answer, webRTCPeerID);
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  };

  handleOffer();
}, [Offer, WebRtcPeerConnection, webRTCPeerID]);

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
    <div className='grid-container'>
    <div className="grid-item">
      <div>User Name</div>
      <video id="localVideo" width="100%" height="80%" autoPlay controls />
      <button onClick={handleToggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
      <button onClick={handleToggleHide}>{isHidden ? 'Show' : 'Hide'}</button>
    </div>
    {VideoStreams.map((stream, index) => (
      <div key={index} className="grid-item">
        <video width="100%" height="75%" id={`remoteVideo-${index}`} autoPlay ref={(ref) => ref && (ref.srcObject = stream)} controls />
      </div>
    ))}
  </div>
  );
};

export default GroupChatWindow;
