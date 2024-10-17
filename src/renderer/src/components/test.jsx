import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'; // Import ffmpeg.js

const ScreenRecordingForwardRef = forwardRef((props, ref) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const token = localStorage.getItem("sessionToken");
  const ffmpeg = createFFmpeg({ log: true });
  const intervalIdRef = useRef(null);

  // This function allows the parent to trigger startRecording through the ref
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      startRecording();
    },
    stopRecording: () => {
      stopRecording();
    }
  }));

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { width: 1920, height: 1080, frameRate: 30 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }

      setStream(displayStream);

      const mediaRecorder = new MediaRecorder(displayStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Compress the chunk before storing it
          const compressedChunk = await compressVideo(event.data);
          chunksRef.current.push(compressedChunk);
        }
      };

      mediaRecorder.start(1000); // Recording data in chunks

      // Send chunks every 10 seconds
      intervalIdRef.current = setInterval(() => {
        sendChunks();
      }, 10000);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.pause();
    videoRef.current.srcObject = null;
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
  };

  // Function to compress video using ffmpeg.js
  const compressVideo = async (videoBlob) => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // Convert Blob to File and input into ffmpeg
    const videoFile = new File([videoBlob], 'video.webm', { type: 'video/webm' });
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(videoFile));

    // Run ffmpeg command to compress the video
    await ffmpeg.run('-i', 'input.webm', '-vcodec', 'libx264', '-crf', '28', 'output.mp4');

    // Get the compressed file from ffmpeg and return it as a Blob
    const compressedVideoData = ffmpeg.FS('readFile', 'output.mp4');
    const compressedBlob = new Blob([compressedVideoData.buffer], { type: 'video/mp4' });

    return compressedBlob;
  };

  const sendChunks = async () => {
    if (chunksRef.current.length > 0) {
      const formData = new FormData();

      // Send all collected chunks as separate files
      for (let i = 0; i < chunksRef.current.length; i++) {
        formData.append(`video${i}`, chunksRef.current[i], `chunk-${Date.now()}.mp4`);
      }

      fetch('http://192.168.1.84:8000/upload-video', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      }).then(response => response.json())
        .then(data => {
          console.log('Chunk upload successful:', data);
          chunksRef.current = []; // Clear chunks after upload
        })
        .catch(error => console.error('Error uploading video chunk:', error));
    }
  };

  return (
    <div>
      <video ref={videoRef} hidden controls></video>
    </div>
  );
});

export default ScreenRecordingForwardRef;
