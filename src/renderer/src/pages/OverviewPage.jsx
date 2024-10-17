import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { BaseApiURL } from "../context/ApiURL";
import clockout from '../assets/image/clock-in.png';
import clockin from '../assets/image/clock-out.png';
import activehour from '../assets/image/active-user.png';
import workdays from '../assets/image/work-days.png';
import workhour from '../assets/image/total-work-hour.png';
import axios from "axios";
import { AppDetail } from "../components/appdetail";
import AppDetailsPercent from "../components/AppDetailsPercent";

const OverviewPage = () => {
    const token = localStorage.getItem('sessionToken');
    const [attendance, setAttendance] = useState();
    const [clockInTime, setClockInTime] = useState();
    const [clockOutTime, setClockOutTime] = useState();
    const [totalActiveHours, setTotalActiveHours] = useState("0 hr 0 mins 0 secs");
    const [totalWorkedDays, setTotalWorkedDays] = useState(0);

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateActiveTime = () => {
        if (!clockInTime) return '0 hr 0 mins 0 secs';

        const time = new Date(clockInTime);
        const now = new Date();

        let totalTime = now.getTime() - time.getTime();

        // Subtract the break duration if applicable
        if (attendance?.breakIn && attendance?.breakOut) {
            const breakInTime = new Date(attendance.breakIn);
            const breakOutTime = new Date(attendance.breakOut);
            totalTime -= (breakOutTime.getTime() - breakInTime.getTime());
        }

        // Convert milliseconds to hours, minutes, and seconds
        const diffInSeconds = Math.floor(totalTime / 1000);
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;

        return `${hours} hr ${minutes} mins ${seconds} secs`;
    };

    const fetchTodayAttendance = async () => {
        try {
            const response = await axios.get(`${BaseApiURL}/attendance/today-clockin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const attendanceData = response.data.attendacneRecord;
            setAttendance(attendanceData);
            setClockInTime(attendanceData.employeeLoginTime);
            setClockOutTime(attendanceData.employeeLogoutTime || null);
            setTotalWorkedDays(response.data.totalWorkedDaysCount)

            if (attendanceData) {
                setTotalActiveHours(calculateActiveTime());
            }
        } catch (error) {
            console.error("Error fetching today attendance data", error);
        }
    };

    useEffect(()=>{
        fetchTodayAttendance();
    },[])

    useEffect(() => {


        const intervalId = setInterval(() => {
            setTotalActiveHours(calculateActiveTime());
        }, 1000); // Update every second

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, [clockInTime, attendance]);

    return (
        <Box className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column',  marginTop:50 }}>
            <Box style={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Today's Attendance</h3>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }} key={attendance?.employeeId}>
                        <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#AFDBF5', borderRadius: '1em' }}>
                            <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                                <div style={{ padding: '30px 1px 0px 10px' }}>
                                    <Typography sx={{ fontSize: 19, fontWeight: 500, display: 'flex' }} gutterBottom>
                                        Clock In
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                        {formatTime(clockInTime)}
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
                                        {clockOutTime ? formatTime(clockOutTime) : '-'}
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
                                        Active Hours
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
                    </Box>

                </Box>
            </Box>

            <Divider />

            <Box style={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Work Summary</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

                    {/* <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#B4D4FF', borderRadius: '1em' }}>
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
                    </Card>   */}

                    <Card sx={{ display: 'flex', columnGap: '30px', backgroundColor: '#D2DAFF', borderRadius: '1em' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '50px' }}>
                            <div style={{ padding: '30px 1px 0px 10px' }}>
                                <Typography sx={{ fontSize: 20, fontWeight: 500, display: 'flex', gap: '5px' }} gutterBottom>
                                    Total Worked Days
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: 28, fontWeight: 600, fontFamily: "-moz-initial" }}>
                                    {totalWorkedDays}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'right', height: '100%', alignItems: 'flex-start' }}>
                                <img style={{ height: '6vh', width: '6vh' }} src={workdays} alt='' />
                            </div>
                        </CardContent>
                    </Card>

                </div>  
            </Box>
            
            <Divider />
            
            <AppDetailsPercent/>
           
        </Box>
    );
};

export default OverviewPage;
