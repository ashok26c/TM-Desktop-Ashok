import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { BaseApiURL } from '../context/ApiURL';

export const Attendance = () => {
  const token = localStorage.getItem('sessionToken');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const ATTENDANCE_API = `${BaseApiURL}/attendance/get-own-attendance`;
  const PROFILE_API = `${BaseApiURL}/employee/profile`;

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const startDay = (month, year) => new Date(year, month, 1).getDay();

  const handleMonthChange = (event) => {
    const newMonth = parseInt(event.target.value, 10);
    setCurrentMonth(newMonth);
    setSelectedDate(new Date(currentYear, newMonth));
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    setCurrentYear(newYear);
    setSelectedDate(new Date(newYear, currentMonth));
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(ATTENDANCE_API, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const attendanceData = Array.isArray(response.data?.attendacneRecord)
        ? response.data.attendacneRecord
        : [response.data.attendacneRecord];

      setAttendanceData(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(PROFILE_API, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const profileData = response.data.profile;
      setProfile({
        employeeId: profileData.employeeId,
        createdAt: new Date(profileData.createdAt).toISOString()
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const fetchData = async () => {
    try {
      await fetchProfileData();
      await fetchAttendanceData();
    } catch (error) {
      console.error("Error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const renderCalendar = () => {
    const days = [];
    const daysInCurrentMonth = daysInMonth(currentMonth, currentYear);
    const startDayOfWeek = startDay(currentMonth, currentYear);

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ flex: '1 0 14.28%', height: '100px' }} />);
    }

    const today = new Date();
    const profileCreatedDate = profile ? new Date(profile.createdAt) : new Date(0);

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const attendance = attendanceData.find(record => record.actualDate === dateString);
      const date = new Date(dateString);

      const isSaturday = date.getDay() === 6;
      const isInProfilePeriod = profileCreatedDate <= date && date <= today;
      const isAbsent = isInProfilePeriod && !attendance?.employeeLoginTime && !isSaturday;

      days.push(
        <Box key={day} sx={{
          flex: '1 0 14.28%',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px',
          backgroundColor: isAbsent ? '#ffe6e6' : '#fff',
          position: 'relative',
          height: '100px'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {day}
          </Typography>

          {attendance ? (
            <>
              {attendance.employeeLoginTime && (
                <Typography variant="caption" sx={{ color: '#28a745' }}>
                  In: {new Date(attendance.employeeLoginTime).toLocaleTimeString()}
                </Typography>
              )}
              {attendance.breakIn && attendance.breakOut && (
                <Typography variant="caption" sx={{ color: '#ffc107' }}>
                  Break: {attendance.breakInMinutes} mins
                </Typography>
              )}
              {attendance.lateClockIn && (
                <>
                 
                  {attendance.lateClockIn == "On time" ? 
                   <Typography variant="caption" sx={{ color: '#28a745' }}>
                    On time
                   </Typography>
                  :
                  <Typography variant="caption" sx={{ color: '#dc3545' }}>
                  Late: { attendance.lateClockIn}
                  </Typography>
                  }
                </>
              )}
              {attendance.overTime !== null && (
                <Typography variant="caption" sx={{ color: '#17a2b8' }}>
                  OT: {attendance.overTime ? 'Yes' : 'No'}
                </Typography>
              )}
            </>
          ) : isAbsent ? (
            <Typography variant="caption" sx={{ color: '#dc3545' }}>Absent</Typography>
          ) : null}
        </Box>
      );
    }

    const totalCells = days.length + (7 - (days.length % 7)) % 7;
    for (let i = days.length; i < totalCells; i++) {
      days.push(<Box key={`empty-end-${i}`} sx={{ flex: '1 0 14.28%', height: '100px' }} />);
    }

    return days;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column',  marginTop:50 }}>
    <Box sx={{ height: "100vh", width: "84vw", padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            labelId="yearSelect" onChange={handleYearChange}
            value={currentYear}
            displayEmpty
          >
            <MenuItem value="">Select Year</MenuItem>
            {[...Array(2).keys()].map(i => {
              const year = 2024 - i;
              return (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            labelId="monthSelect" onChange={handleMonthChange}
            value={currentMonth}
            displayEmpty
          >
            <MenuItem value="">Select Month</MenuItem>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
              <MenuItem key={index} value={index}>{month}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <Box key={day} sx={{
            flex: '1 0 14.28%',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
            borderRight: '1px solid #e0e0e0',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {day}
          </Box>
        ))}
      </Box>

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        border: '1px solid #e0e0e0',
        borderTop: 'none'
      }}>
        {renderCalendar()}
      </Box>
    </Box>
    </div>
  );
};
