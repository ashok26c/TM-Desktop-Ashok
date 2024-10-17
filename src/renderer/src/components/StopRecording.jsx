import React, { useContext, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { RecordingContext } from './RecordingContext';
import { BaseApiURL } from '../context/ApiURL';
import { getBlobFromIndexedDB, saveBlobToIndexedDB } from '../utils/indexedDBUtils';
const StopRecording = forwardRef((props, ref) => {
    const token = localStorage.getItem('sessionToken');
    const { stopRecording } = useContext(RecordingContext);
    useImperativeHandle(ref, () => ({
        stopRecording: handleStopClick
    }));
    
    // const handleStopClick = async () => {
    //     stopRecording();
    // }

    const handleStopClick = async () => {
        try {
            stopRecording();
            setTimeout(async () => {
                try {
                    const videoBlob = await getBlobFromIndexedDB('videoLink');
                    if (videoBlob) {
                        const formData = new FormData();
                        formData.append('timelapsevideo', videoBlob, 'recording.webm');
                        await axios.post(`${BaseApiURL}/timelapsevideo/`, formData, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                            },
                        });
                        console.log('Final video successfully uploaded to server!');
                        await saveBlobToIndexedDB(null, 'videoLink');
                    } else {
                        console.log('No final videoBlob found.');
                    }
                } catch (error) {
                    console.error('Error retrieving or uploading video:', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };
    return null;
});
export default StopRecording;