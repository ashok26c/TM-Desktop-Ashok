import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { BaseApiURL } from '../context/ApiURL';
const Screenshot = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    takeScreenshot: handleCapture
  }));  
  useEffect(() => {
    window.api.on('screenshot-data', (screenshotData) => {
      saveScreenshot(screenshotData);
    });
    const intervalId = setInterval(() => {
      window.api.send('take-screenshot');
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);
  const screenshot_api = `${BaseApiURL}/screenshot`;
  const saveScreenshot = async (screenshotData) => {
    const formData = new FormData();
    formData.append('screenshot', new Blob([screenshotData], { type: 'image/png' }), `screenshot-${Date.now()}.png`);
    try {
      const response = await fetch(screenshot_api, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
        },
        body: formData,
      });
      if (response.ok) {
        console.log('Screenshot successfully sent to the server');
      } else {
        console.error('Failed to send screenshot');
      }
    } catch (error) {
      console.error('Error while sending the screenshot:', error);
    }
  };
  const handleCapture = () => {
    window.api.send('take-screenshot');
  }
  return (
    <div>
      <button onClick={handleCapture} ref={ref}>
      </button>
    </div>
  );
});
export default Screenshot;