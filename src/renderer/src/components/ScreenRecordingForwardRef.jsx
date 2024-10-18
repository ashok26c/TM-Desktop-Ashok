import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const ScreenRecordingForwardRef = forwardRef((props, ref) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalIdRef = useRef(null);
  const token = localStorage.getItem("sessionToken");

  // This function allows the parent to trigger startRecording through the ref
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      startRecording();
    }
  }));

  const startRecording = async () => {
    try {
    
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { width: 1920, height: 1080, frameRate: 30 },
      });
      console.log("Starting screen recording...1");
      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
    
      setStream(displayStream);
      const mediaRecorder = new MediaRecorder(displayStream);
     
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Start capturing video every second

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
      
          const reader = new FileReader();
          reader.onloadend = async () => {
           
            const arrayBuffer = reader.result;

            // Send the video chunk to the main process (FFmpeg)
            await window.api.send('start-ffmpeg', { videoStream: arrayBuffer });
            console.log("Starting screen recording...6");
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      // Listen for processed video output from FFmpeg
      
      window.api.on('ffmpeg-output', async (data) => {
        // Send the processed video chunk to the backend
        const formData = new FormData();
        formData.append('video', new Blob([data], { type: 'video/webm' }));
        try {
          const response = await fetch('http://192.168.1.84:8000/upload-video', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });

          const responseData = await response.json();
          console.log('Chunk upload successful:', responseData);
        } catch (error) {
          console.error('Error uploading video chunk:', error);
        }
      });
      console.log("Starting screen recording...9");
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };
  return (
    <div>
      <video ref={videoRef} hidden controls></video>
    </div>
  );
});
export default ScreenRecordingForwardRef;
