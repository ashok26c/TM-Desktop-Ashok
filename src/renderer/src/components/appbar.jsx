import React, { useEffect, useState, useRef, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import NotificationsIcon from '@mui/icons-material/Notifications';
import takebreak from '../assets/image/takeBreak.svg';
import axios from 'axios';
import StopRecording from './StopRecording';
import Screenshot from './Screenshot';
import { RecordingContext } from './RecordingContext'; 
import { BaseApiURL } from '../context/ApiURL';
import { useTracking } from '../context/GlobleTracking';
import { useNavigate } from 'react-router-dom'
import { startTimer, stopTimer } from '../redux/break/breakSlice';
import { useDispatch } from 'react-redux';


export default function PrimarySearchAppBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const token = localStorage.getItem('sessionToken');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const { stopRecording, videoBlob,loading } = useContext(RecordingContext); 
  const [breakIn, setBreakIn] = useState(false);
  // const startRecordingRef = useRef(null);
  const stopRecordingRef = useRef();
  const stopScreenshotRef = useRef();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const unread_notification_api = `${BaseApiURL}/notifications/employee-unread`;
  const take_break_api = `${BaseApiURL}/attendance/take-break`;
  const break_out_api = `${BaseApiURL}/attendance/break-out`;
  const clock_out_api = `${BaseApiURL}/attendance/clock-out`;

  const { appDurations } = useTracking();

  // const fetchAttendanceStatus = async () => {
  //   try {
  //     const response = await axios.get(`${BaseApiURL}/attendance/get-own-attendance`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Accept': 'application/json',
  //       },
  //     });
  //     setAttendanceStatus(response.data.attendanceRecord);
  //   } catch (error) {
  //     console.error('Error fetching attendance status', error);
  //   }
  // };

  const handleTakeBreak = async () => {
    try {
      await axios.post(take_break_api, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      // setAttendanceStatus(response.data.updateAttendance);
      setBreakIn(true)
      dispatch(startTimer());
      navigate("/break")

    } catch (error) {
      alert(`${error.response.data.message}`)
      console.log('Failed to take break', error);
    }
  };

  const handleBreakOut = async () => {
    try {
      const response = await axios.post(break_out_api, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      // setAttendanceStatus(response.data.updateAttendance);
      setBreakIn(false)
      dispatch(stopTimer())
    } catch (error) {
      console.log('Failed to break out', error);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await axios.post(`${BaseApiURL}/attendance/clock-out`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.status === 200) {
        setAttendanceStatus(prevStatus => ({
          ...prevStatus,
          clockOutTime: response.data.clockOutTime,
        }));
        // if (stopRecordingRef.current) {
        //   stopRecordingRef.current.stopRecording();  // Use the exposed method
        // }
        // if (stopScreenshotRef.current) {
        //   stopScreenshotRef.current.takeScreenshot();  // Use the exposed method
        // }
        
        alert('You have clocked out.');
        window.close()
        // navigate('/')
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        if (error.response?.data?.message === "You have already Clock Out") {
          alert('You have already clocked out.');
          navigate('/')
        } else {
          alert('An error occurred while clocking out.');
        }
      } else {
        console.error('Error clocking out:', error);
        alert('An error occurred while clocking out.');
      }
    }
  };

  const handleClockOutAndStopRecording = async () => {
    try {
      console.log('clock out ta vayo')
      await axios.post(`${BaseApiURL}/app/add-used-desktop-app`,{appDurations},{
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      console.log("🚀 ~ handleClockOutAndStopRecording ~ token:", token)

       axios.patch(`${BaseApiURL}/timelapsevideo/image-compression`,{},{  
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
      // Stop recording
      if (stopRecording) {
        stopRecording();
      }
      setTimeout(async () => {
    await handleClockOut();
}, 0);
      // Delay to ensure videoBlob is available
      // setTimeout(async () => {
      //   if (videoBlob) {
      //     const formData = new FormData();
      //     formData.append('timelapsevideo', videoBlob, 'recording.webm');

      //     // try {
      //     //   await axios.post(`${BaseApiURL}/timelapsevideo/`, formData, {
      //     //     headers: {
      //     //       'Authorization': `Bearer ${token}`,
      //     //       'Accept': 'application/json',
      //     //     },
      //     //   });
           
      //     //   console.log('Final video successfully uploaded to server!');
      //     // } catch (error) {
      //     //   console.error('Error uploading video:', error);
      //     // }
      //   } else {
      //     console.log('No final videoBlob found.');
      //   }
      // }, 1000); // Adjust delay as needed

      // Clock out
      
    } catch (error) {
      console.error('Error during clock out and recording stop:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
    />
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
    >
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          {notifications.length > 0 && (
            <Badge color="error">
              {notifications.length}
              <NotificationsIcon />
            </Badge>
          )}
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axios.get(unread_notification_api, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      setNotifications(response.data.unReadNotifications);
    } catch (error) {
      console.error('Error while fetching company notifications', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    // fetchAttendanceStatus(); 
  }, []);

  const renderButtonText = () => {
    if (attendanceStatus) {
      if (attendanceStatus.breakIn && !attendanceStatus.breakOut) {
        return 'Break Out';
      } else if (attendanceStatus.breakIn && attendanceStatus.breakOut) {
        return 'Break Already Taken';
      }
    }
    return 'Take Break';
  };

  // const handleButtonClick = () => {
  //   if (attendanceStatus) {
  //     if (attendanceStatus.breakIn && !attendanceStatus.breakOut) {
  //       handleBreakOut();
  //     } else if (!attendanceStatus.breakIn) {
  //       handleTakeBreak();
  //     }
  //   } else {
  //     handleTakeBreak();
  //   }
  // };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: 'white', marginTop: '0px', position:"fixed" }}>
        <Toolbar sx={{ gap: '10px' }}>
          <Box sx={{ flexGrow: 1 }} />

          {/* <Button
            variant="outlined"
            size="large"
            sx={{ gap: '10px' }}
            onClick={handleButtonClick}
            disabled={attendanceStatus?.breakIn && attendanceStatus?.breakOut}
          >
            <img src={takebreak} alt="Take Break" style={{ height: '20px', width: '20px' }} />
            <b>{renderButtonText()}</b>
          </Button> */}

          {
            breakIn ? <Button  variant="outlined"
            size="large"
            sx={{ gap: '10px', fontWeight:500 }} onClick={handleBreakOut}> <img src={takebreak} alt="Take Break" style={{ height: '20px', width: '20px' }} /> <b>Break Out</b></Button> : <Button  variant="outlined"
            size="large"
            sx={{ gap: '10px',fontWeight:500 }} onClick={handleTakeBreak} > <img src={takebreak} alt="Take Break" style={{ height: '20px', width: '20px' }} /><b>Take Break</b></Button>
          }

          <Button
            variant="outlined"
            size="large"
            sx={{ gap: '10px' }}
            onClick={handleClockOutAndStopRecording}
          >
            <img src={takebreak} alt="Clock Out" style={{ height: '20px', width: '20px' }} />
            <b>Clock Out</b>
          </Button>

          <IconButton
            size="large"
            aria-label="show new notifications"
            color="primary"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            {notifications.length > 0 && (
              <Badge className="notification-badge" color="error">
                {notifications.length}
                <NotificationsIcon />
              </Badge>
            )}
          </IconButton>

          {/* <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="primary"
          >
            <AccountCircle />
          </IconButton> */}
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <StopRecording ref={stopRecordingRef} />
      <Screenshot ref={stopScreenshotRef} />
    </Box>
  );
}