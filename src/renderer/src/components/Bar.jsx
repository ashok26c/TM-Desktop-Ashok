import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/bar.css";
import Swal from "sweetalert2";
import Cookie from 'js-cookie';
import RightSideBar from "./appbar";
import logout from "../assets/image/logout.svg";
import leave from "../assets/image/leave.svg";
import overview from "../assets/image/layout-dashboard.svg";
import attendance from "../assets/image/attendance.svg";
import holiday from "../assets/image/holiday.svg";
import AppsOutageIcon from '@mui/icons-material/AppsOutage';
import { BaseApiURL } from "../context/ApiURL";
import axios from "axios";
import { useTracking } from "../context/GlobleTracking";

const Bar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('sessionToken');
  const { appDurations } = useTracking();



  // Example Logout Function
  const handleLogOut = async () => {
    // Ask for confirmation before logging out and clocking out
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You are about to clock out and log out. Do you want to proceed?',
      showCancelButton: true,
      confirmButtonText: 'Yes, clock out and log out',
      cancelButtonText: 'No, cancel',
    });
  
    if (confirmation.isConfirmed) {
      try {

        await axios.post(`${BaseApiURL}/app/add-used-desktop-app`,{appDurations},{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

  
        // Clock out request
        const response = await axios.post(`${BaseApiURL}/attendance/clock-out`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.status === 200) {
       
          // if (stopRecordingRef.current) {
          //   stopRecordingRef.current.stopRecording();  // Use the exposed method
          // }
          // if (stopScreenshotRef.current) {
          //   stopScreenshotRef.current.takeScreenshot();  // Use the exposed method
          // }
          window.localStorage.removeItem("sessionToken");
          window.localStorage.setItem('isLoggedIn', 'false'); // Set as string
    
          // Show success message after successful logout
          Swal.fire({
            icon: 'success',
            title: 'Logout Successful!',
            text: 'You have been successfully logged out.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: 'OK'
          }).then((result) => {
            try {
              if (result.isConfirmed || result.isDismissed) {
                window.close();
                document.body.style.backgroundColor = '#e6ffe6';
                setTimeout(() => {
                  document.body.style.backgroundColor = ''; 
                }, 500);
              }
            } catch (error) {
              console.error('Error closing window:', error);
            }
          });
        }
      } catch (error) {
        // Handle error case (optional)
        console.error('Error during clock-out or log out:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong during log out. Please try again.',
        });
      }
    }
  };
  

  return (
    <div>
      {/* <!------LEFT SIDE NAVBAR AND RIGHT SIDE HEADER AND BANNER STARTS FROM HERE---------> */}
      <div className="leftside-navbar-section" style={{display:"flex", zIndex:100}}>
        <div className="main-content-sidenav">
          <div className="sidenav-logo">
            <h2>TEAM-MONITOR</h2>
            <p>The Complete Team Monitoring System</p>
          </div>
          <div className="main-nav-menu">
            <ul className="nav-ul">
              {/* <li>
                <Link to="/overview" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={overview} alt="" />
                      <h3>Overview</h3>
                    </div>
                  </div>
                </Link>
              </li> */}
              <li>
                <Link to="/overview" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={overview} alt="" />
                      <h3>Overview</h3>
                    </div>
                  </div>
                </Link>
              </li>
              {/* <li>
                <Link to="/screen-record" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={overview} alt="" />
                      <h3>Screen Record</h3>
                    </div>
                  </div>
                </Link>
              </li> */}
              {/* <li>
                <Link to="/" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={overview} alt="" />
                      <h3>clco</h3>
                    </div>
                  </div>
                </Link>
              </li> */}
              <li>
                <Link to="/Leave" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={leave} alt="" />
                      <h3>Leave</h3>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/Attendance" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={attendance} alt="" />
                      <h3>Attendance</h3>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/attendance-page" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={attendance} alt="" />
                      <h3>Attendance</h3>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/Holiday" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      <img src={holiday} alt="" />
                      <h3>Holiday</h3>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/used-apps" className="atag">
                  <div className="logo-div">
                    <div className="space-betwn-navbar">
                      {/* <img src={holiday} alt="" /> */}
                      <AppsOutageIcon/>
                      <h3>Used Apps</h3>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <div className="atag">
                  <div className="logo-link">
                    <div className="space-betwn-navbar">
                      <img src={logout} alt="" />
                      <h3 onClick={handleLogOut}>Logout</h3>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <RightSideBar />
    </div>
  );
}

export default Bar;
