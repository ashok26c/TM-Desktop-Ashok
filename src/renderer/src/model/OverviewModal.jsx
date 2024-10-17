import React, { useEffect, useState } from "react";
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from "@mui/material/Divider";
import clockout from '../assets/image/clock-in.png';
import clockin from '../assets/image/clock-out.png';
import activehour from '../assets/image/active-user.png';
import workdays from '../assets/image/work-days.png';
import workhour from '../assets/image/total-work-hour.png';
import '../assets/css/rightContent.css';
import '../assets/css/dashboard.css';
import { BaseApiURL } from "../context/ApiURL";

export function OverviewModal() {
    const token = localStorage.getItem('sessionToken');
    const [attendance, setAttendance] = useState([]);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [totalWorkedHours, setTotalWorkedHours] = useState('0 hr 0 mins');
    const [totalActiveHours, setTotalActiveHours] = useState('0 hr 0 mins');

    const today_attendance_api = `${BaseApiURL}/attendance/today-clockin`;
    const all_attendance_api = `${BaseApiURL}/attendance/get-own-attendance`;



    const fetchTodayAttendance = async () => {
        try {
            const response = await axios.get(today_attendance_api, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const attendanceData = response.data.attendacneRecord;

            // Ensure attendanceData is an array
            const dataArray = Array.isArray(attendanceData) ? attendanceData : [attendanceData];
            setAttendance(dataArray);

            // Calculate total active hours for today
            if (dataArray.length > 0) {
                const workedHours = calculateWorkedHours(dataArray[0]); // Assuming single record for today
                setTotalActiveHours(workedHours);
            }
        } catch (error) {
            console.error("Error fetching today attendance data", error);
        }
    };

    const fetchAllAttendance = async () => {
        try {
            const response = await axios.get(all_attendance_api, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const attendanceTotalCount = Array.isArray(response.data?.attendacneRecord)
                ? response.data.attendacneRecord
                : [response.data.attendacneRecord];

            setAttendanceCount(attendanceTotalCount.length);

            // Function to calculate worked hours in minutes for a given record
            const calculateWorkedHoursInMinutes = (attendanceRecord) => {
                if (!attendanceRecord || !attendanceRecord.employeeLoginTime) return 0;

                const clockInTime = new Date(attendanceRecord.employeeLoginTime);
                const clockOutTime = attendanceRecord.employeeLogoutTime
                    ? new Date(attendanceRecord.employeeLogoutTime)
                    : new Date(); // Use current time if logout is not provided

                let totalTime = clockOutTime.getTime() - clockInTime.getTime();

                // Deduct break times
                if (attendanceRecord.breakIn && attendanceRecord.breakOut) {
                    const breakInTime = new Date(attendanceRecord.breakIn);
                    const breakOutTime = new Date(attendanceRecord.breakOut);
                    totalTime -= (breakOutTime.getTime() - breakInTime.getTime());
                }

                return Math.floor(totalTime / (1000 * 60)); // Return minutes
            };

            const totalMinutes = attendanceTotalCount.reduce((accumulatedMinutes, record) => {
                return accumulatedMinutes + calculateWorkedHoursInMinutes(record);
            }, 0);

            const hours = Math.abs(Math.floor(totalMinutes / 60));
            const minutes = Math.abs(totalMinutes % 60);

            setTotalWorkedHours(`${hours} hr ${minutes} mins`);
        } catch (error) {
            console.error("Error fetching attendance data", error);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
        fetchAllAttendance();
    }, []); // Empty dependency array to ensure the effect runs once

    // Helper function to format time
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateWorkedHours = (attendanceRecord) => {
        if (!attendanceRecord || !attendanceRecord.employeeLoginTime) return '0 hr 0 mins';

        const clockInTime = new Date(attendanceRecord.employeeLoginTime);
        const now = new Date();

        // Calculate total worked time from clock-in to current time
        let totalTime = now.getTime() - clockInTime.getTime();

        // Deduct break times
        if (attendanceRecord.breakIn && attendanceRecord.breakOut) {
            const breakInTime = new Date(attendanceRecord.breakIn);
            const breakOutTime = new Date(attendanceRecord.breakOut);
            totalTime -= (breakOutTime.getTime() - breakInTime.getTime());
        }

        // Convert milliseconds to hours and minutes
        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

        // Format the result
        return `${hours} hr ${minutes} mins`;
    };

    return (
        <div>
            <Box style={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Today's Attendance</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {attendance.map((todays) => (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }} key={todays.employeeId}>
                            <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#AFDBF5', borderRadius: '1em' }}>
                                <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                                    <div style={{ padding: '30px 1px 0px 10px' }}>
                                        <Typography sx={{ fontSize: 19, fontWeight: 500, display: 'flex' }} gutterBottom>
                                            Clock In 
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                            {formatTime(todays.employeeLoginTime)}
                                        </Typography>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                        <img style={{ height: '6vh', width: '6vh' }} src={clockin} alt='' />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#ACB1D6', borderRadius: '1em' }}>
                                <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                                    <div style={{ padding: '30px 1px 0px 10px' }}>
                                        <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                            Clock Out 
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                            {todays.employeeLogoutTime ? formatTime(todays.employeeLogoutTime) : '-'}
                                        </Typography>
                                    </div>    
                                    <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                        <img style={{ height: '6vh', width: '6vh' }} src={clockout} alt='' />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#B9B4C7', borderRadius: '1em' }}>
                                <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                                    <div style={{ padding: '30px 1px 0px 10px' }}>
                                        <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                            Active Hour
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                            {totalActiveHours}
                                        </Typography>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                        <img style={{ height: '6vh', width: '6vh' }} src={activehour} alt='' />
                                    </div>
                                </CardContent>
                            </Card>  
                        </div>
                    ))}
                </div>
            </Box>
            <Divider />

            <Box style={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Work Summary</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#B4D4FF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <div style={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Total Work Hour
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {totalWorkedHours}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={workhour} alt='' />
                            </div>
                        </CardContent>
                    </Card>  

                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <div style={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Total Worked Days
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {attendanceCount}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={workdays} alt='' />
                            </div>
                        </CardContent>
                    </Card>

                </div>  
            </Box>
        </div>
    );
}
