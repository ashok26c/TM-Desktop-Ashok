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
      console.log("hundai xa")
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { width: 1920, height: 1080, frameRate: 30 },
      });
      console.log("hundai xa 1")
      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
      console.log("ya ni pugo")

      setStream(displayStream);
      console.log("ya ni pugo 1")
      const mediaRecorder = new MediaRecorder(displayStream,{
        mimeType:'video/webm; codecs=vp9',
        videoBitsPerSecond:2500000,//2.5 Mbps
        audioBitsPerSecond:128000//128 kbps
      });
      console.log("ya ni pugo 2")
      mediaRecorderRef.current = mediaRecorder;
      console.log("ya ni pugo 3")
      mediaRecorder.start(1000); // Still capturing video every second

      mediaRecorder.ondataavailable = (event) => {
        console.log("djf")
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const arrayBuffer = reader.result;
      
            // Send the video chunk to the main process (FFmpeg)
            await window.api.send('start-ffmpeg', { videoStream: arrayBuffer });
            console.logg("yaya")
            // Get the processed video chunk from FFmpeg
            window.api.on('ffmpeg-output', (event, data) => {
              console.log("🚀 ~ window.api.on ~ data:", data)
              const processedArrayBuffer = data;
              console.log("🚀 ~ window.api.on ~ processedArrayBuffer:", processedArrayBuffer)
      
              // Send the processed video chunk to the backend
              const formData = new FormData();
              formData.append('video', new Blob([processedArrayBuffer], { type: 'video/mp4' }));
      
              fetch('http://192.168.1.84:8000/upload-video', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
              }).then(response => response.json())
                .then(data => {
                  console.log('Chunk upload successful:', data);
                })
                .catch(error => console.error('Error uploading video chunk:', error));
            });
          };
      
          reader.readAsArrayBuffer(event.data);
        }
      };

      


      // intervalIdRef.current = setInterval(() => {
      //   if (chunksRef.current.length > 0) {
      //     const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      //     const formData = new FormData();
      //     formData.append('video', videoBlob);

      //     fetch('http://192.168.1.84:8000/upload-video', {
      //       method: 'POST',
      //       headers: { 'Authorization': `Bearer ${token}` },
      //       body: formData,
      //     }).then(response => response.json())
      //       .then(data => {
      //         console.log('Chunk upload successful:', data);
      //         chunksRef.current = [];
      //       })
      //       .catch(error => console.error('Error uploading video chunk:', error));
      //   }
      // }, 10000); // Send chunks every 10 seconds
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
