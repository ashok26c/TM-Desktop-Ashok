import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Box, Typography } from '@mui/material'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import StartRecording from '../components/StartRecording'
import Screenshot from '../components/Screenshot'
import { useTracking } from '../context/GlobleTracking'
import { BaseApiURL } from '../context/ApiURL'
import Swal from "sweetalert2";
import ScreenRecordingForwardRef from '../components/ScreenRecordingForwardRef'


export function ClockIn() {
  const token = localStorage.getItem('sessionToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  const [userName, setUserName] = useState(null)
  const [employeeId, setEmployeeId] = useState(null)
  const [greeting, setGreeting] = useState('')
  const navigate = useNavigate()
  const startRecordingRef = useRef(null)
  const screenshotRef = useRef(null);
  const recordingRef = useRef(null);
  const [videoBlob, setVideoBlob] = useState(null)
  const { isTracking, setIsTracking, appDurations } = useTracking()
  const [windowInfo, setWindowInfo] = useState(null)
  const isRequestInProgress = useRef(false) // Track ongoing requests

  const profile_api = `${BaseApiURL}/employee/profile`
  const clockIn_api = `${BaseApiURL}/attendance/clock-in`

  const handleLogOut = () => {
    // Remove the token from local storage
    window.localStorage.removeItem("sessionToken");
    
    // Optionally clear isLoggedIn (though it's not needed with token-based auth)
    window.localStorage.setItem('isLoggedIn', 'false'); // Set as string

    Swal.fire({
      icon: 'success',
      title: 'LogOut Successful!',
      text: 'You have been successfully logged out.',
      timer: 1500, // Duration for which the alert is displayed in milliseconds
      timerProgressBar: true, // Show a progress bar indicating the timer
      showConfirmButton: false, // Hide the OK button
    });

    // Redirect to login page immediately after showing the alert
    setTimeout(() => {
      navigate('/Login');
    }, 200); // Delay a short time to ensure Swal starts showing
  };
  useEffect(() => {
    const now = new Date()
    const hours = now.getHours()
    setGreeting(hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening')

    axios
      .get(profile_api, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      .then((response) => {
        const data = response.data.profile
        if (data && data.employeeName) {
          setUserName(data.employeeName)
          setEmployeeId(data.employeeId)
        } else {
          setUserName('Guest')
        }
      })
      .catch((error) => {
        console.error('Error fetching profile:', error)
        setUserName('Guest')
      })
  }, [token, profile_api])

  // handle clockin and reacord
  const handleClockInAndRecord = async () => {
    if (isRequestInProgress.current) return // Prevent multiple requests

    try {
      if (!employeeId) {
        alert('Unable to clock in. Employee ID is missing.')
        return
      }

      isRequestInProgress.current = true

      // Start tracking active window info
      setIsTracking(true)

      // Clock in request
      const response = await axios.post(
        clockIn_api,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      )

      console.log('Response Status:', response.status)

      if (response.status === 200) {
        // Start recording
        if (recordingRef.current) {
          recordingRef.current.startRecording(); // Start the recording
        }

        // Take screenshot
        if (screenshotRef.current) {
          screenshotRef.current.click();
        }

        navigate('/overview')
      } else if (response.status === 400) {
        navigate('/Leave')
        alert('You have already clocked in.')
      }
    } catch (error) {
      console.error('Error clocking in:', error)
      alert(`${error.response.data.message}`)
    } finally {
      isRequestInProgress.current = false // Reset the flag after request completes
    }
  }

  return (
    <div
  className="login-container"
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  }}
>
  <Box
    className="paper"
    style={{
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      position: 'relative',
      maxWidth: '400px',
      width: '100%',
    }}
  >
    <Typography
      sx={{ fontSize: 20, fontWeight: 550 }}
      gutterBottom
      style={{ marginBottom: '20px', textAlign: 'center' }}
    >
      {greeting} {userName ? `${userName}🌻` : 'Guest🌻'}
    </Typography>

    <div style={{ marginBottom: '20px' }}>
      <h2>App Usage Durations:</h2>
      
    </div>

   <div style={{display:"flex", gap:5}}>

   <button
      style={{
        backgroundColor: '#1976d2',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        position: 'relative',
        fontWeight: 'bold',
        fontSize: '16px',
      }}
      onClick={handleClockInAndRecord}
    >
      Clock In
      <div
        ref={startRecordingRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        onClick={() => console.log('Recording started')}
      >
      </div>
      {/* <div
        ref={screenshotRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        onClick={() => console.log('Screenshot taken')}
      >
      </div> */}
    </button>
    <button
      style={{
        backgroundColor: '#1976d2',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        position: 'relative',
        fontWeight: 'bold',
        fontSize: '16px',
      }}
      onClick={handleLogOut}
    >
      Logout
      </button>
      <ScreenRecordingForwardRef ref={recordingRef} />
   </div>
  </Box>
</div>
  )
}
