import React, { createContext, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { BaseApiURL } from '../context/ApiURL';
import { saveBlobToIndexedDB, getBlobFromIndexedDB, initDB } from '../utils/indexedDBUtils';
export const RecordingContext = createContext();
export const RecordingProvider = ({ children }) => {
    const token = localStorage.getItem('sessionToken');
    const mediaRecorderRef = useRef(null);
    const intervalRef = useRef(null);
    useEffect(() => {
        initDB(); // Ensure DB is initialized
        const loadVideoBlob = async () => {
            const savedBlob = await getBlobFromIndexedDB('videoLink');
            if (savedBlob) {
                console.log('Loaded video blob from IndexedDB.');
            }
        };
        loadVideoBlob();
    }, []);
    const startRecording = useCallback(async () => {
        window.electron.getDesktopSources().then(async (inputSources) => {
            if (inputSources.length > 0) {
                const constraints = {
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: inputSources[0].id
                        }
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const options = { mimeType: 'video/webm; codecs=vp8' };
                const recorder = new MediaRecorder(stream, options);
                recorder.ondataavailable = async (e) => {
                    if (e.data.size > 0) {
                        await saveBlobToIndexedDB(e.data, 'videoLink'); // Updated store name
                    }
                };
                recorder.onstop = async () => {
                    console.log('Recording stopped.');
                    if (intervalRef.current) {
                        // console.log(interval.current)
                        // clearInterval(intervalRef.current);
                        // intervalRef.current = null;
                    }
                    // Attempt to upload the final video
                    const videoBlob = await getBlobFromIndexedDB('videoLink');
                    if (videoBlob) {
                        try {
                            const formData = new FormData();
                            formData.append('timelapsevideo', videoBlob, 'recording.webm');
                            await axios.post(`${BaseApiURL}/timelapsevideo/`, formData, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                },
                            });
                            console.log('Final video successfully uploaded to server!');
                            await saveBlobToIndexedDB(null, 'videoLink'); // Clear the blob
                        } catch (error) {
                            console.error('Error uploading final video:', error);
                        }
                    }
                };
                mediaRecorderRef.current = recorder;
                recorder.start(); // Start recording
                // Save video every 1 second
                intervalRef.current = setInterval(async () => {
                    try {
                        const videoBlob = await getBlobFromIndexedDB('videoLink'); // Updated store name
                        if (videoBlob) {
                            const formData = new FormData();
                            formData.append('timelapsevideo', videoBlob, 'recording.webm');
                            await axios.post(`${BaseApiURL}/timelapsevideo/`, formData, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                },
                            });
                            console.log('Video successfully uploaded to server!');
                            await saveBlobToIndexedDB(null, 'videoLink'); // Clear the blob
                        }
                    } catch (error) {
                        console.error('Error uploading video:', error);
                    }
                }, 10000); // Save every 3 minutes
            }
        });
    }, [token]);
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    }, []);
    return (
        <RecordingContext.Provider value={{ startRecording, stopRecording }}>
            {children}
        </RecordingContext.Provider>
    );
};