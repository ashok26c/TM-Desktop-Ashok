import React, { useState, useRef } from 'react';

function ScreenRecordingWithApi() {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);  // Ref for mediaRecorder
  const chunksRef = useRef([]);  // Ref to store video chunks
  const intervalIdRef = useRef(null);  // Ref to store interval ID

  const token = localStorage.getItem("sessionToken")

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          width: 1920,
          height: 1080,
          frameRate: 30
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }

      setStream(displayStream);

      const mediaRecorder = new MediaRecorder(displayStream);
      mediaRecorderRef.current = mediaRecorder;  // Store mediaRecorder in the ref

      // Collect video chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);  // Store each chunk in the array
        }
      };

      // Start recording and capture data every second
      mediaRecorder.start(1000);

      // Set interval to send accumulated chunks every 10 seconds
      intervalIdRef.current = setInterval(() => {
        if (chunksRef.current.length > 0) {
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });

          const formData = new FormData();
          formData.append('video', videoBlob);

          // Send the accumulated video data to the server via POST request
          fetch('http://192.168.1.84:8000/upload-video', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Chunk upload successful:', data);
              // Clear the chunks after sending
              chunksRef.current = [];
            })
            .catch((error) => {
              console.error('Error uploading video chunk:', error);
            });
        }
      }, 10000);  // 10 seconds
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  };

  const stopRecording = () => {
    // Stop the media recorder and clear the interval
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // You can optionally send a request to notify the server that recording has ended
      fetch('http://192.168.1.84:8000/end-recording', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    // Stop and clear the stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    // Pause the video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    // Clear the interval and send any remaining chunks
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;

      // Send remaining chunks if any
      if (chunksRef.current.length > 0) {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });

        const formData = new FormData();
        formData.append('video', videoBlob);

        fetch('http://192.168.1.84:8000/upload-video', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Final chunk upload successful:', data);
            chunksRef.current = [];
          })
          .catch((error) => {
            console.error('Error uploading final video chunk:', error);
          });
      }
    }
  };

  return (
    <div className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column' }}>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <video hidden ref={videoRef} controls></video>
    </div>
  );
}

export default ScreenRecordingWithApi;
