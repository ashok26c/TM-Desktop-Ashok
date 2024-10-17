import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { BaseApiURL } from '../context/ApiURL';
import axios from 'axios';


export default function AttendancePage() {

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const token = localStorage.getItem('sessionToken');
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [finalSendingDate, setFinalSendingDate] = React.useState('');

    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(13);

    const ATTENDANCE_API = `${BaseApiURL}/attendance/get-own-attendance-specific-date`;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

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

    const filterDate = () => {
        const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
        const dateString = `${currentYear}-${formattedMonth}`; 
        setFinalSendingDate(dateString);
    };

    const columns = [
        { id: 'Date', label: 'Date', minWidth: 170,   align: 'center', },
        { id: 'clockin', label: 'Clock In', minWidth: 170,   align: 'center', },
        { id: 'lateClockin', label: 'Late Clock In', minWidth: 170,  align: 'center', },
        {
          id: 'breakin',
          label: 'Break In',
          minWidth: 170,
          align: 'center',
        },
        {
          id: 'breakOut',
          label: 'Break Out',
          minWidth: 170,
          align: 'center',
        },
        {
            id: 'latebreak',
            label: 'Late Break',
            minWidth: 170,
            align: 'center',
          },
        {
            id: 'clockout',
            label: 'Clock Out',
            minWidth: 170,
            align: 'center',
        },
        {
            id: 'overtime',
            label: 'Over Time',
            minWidth: 170,
            align: 'center',
        },
      ];

    const fetchAttendanceData = async () => {
        try {
            const response = await axios.post(ATTENDANCE_API, {
                date: finalSendingDate
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            setAttendanceData(response?.data.attendanceRecord);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    React.useEffect(() => {
        filterDate(); 
    }, []);

    React.useEffect(() => {
        fetchAttendanceData();
    }, [finalSendingDate]);

    React.useEffect(() => {
        filterDate(); 
    }, [currentMonth, currentYear]);

    return (
        <Box className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column',  marginTop:50 }}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: "90vh" }}>
                    <Typography sx={{display:"flex", justifyContent:"center", fontSize:40, fontWeight:"bold"}}> Monthly Attendance </Typography>
                    <div style={{ columnGap: '20px', display: 'flex', padding: '20px', justifyContent: 'right' }}>
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
                    </div>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceData && attendanceData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                            <TableCell  align="center" style={{ minWidth: 170 }}>
                                                 {row.actualDate}
                                            </TableCell>
                                            <TableCell  align="center" style={{ minWidth: 170 }}>
                                                 {formatTime(row.employeeLoginTime)}
                                            </TableCell>
                                            <TableCell  align="center" style={{ minWidth: 170 }}>
                                                 {row.lateClockIn}
                                            </TableCell>
                                           
                                            <TableCell align="center" style={{ minWidth: 170 }}>
                                                 {formatTime(row.breakIn)}
                                            </TableCell>
                                            <TableCell align="center" style={{ minWidth: 170 }}>
                                                 {formatTime(row.breakOut)}
                                            </TableCell>
                                            <TableCell align="center" style={{ minWidth: 170 }}>
                                                 {row.breakInMinutes ? row.breakInMinutes : "-"}
                                            </TableCell>
                                            <TableCell align="center" style={{ minWidth: 170 }}>
                                                 {formatTime(row.employeeLogoutTime)}
                                            </TableCell>
                                            <TableCell align="center" style={{ minWidth: 170 }}>
                                                 {row.overTime ? row.overTime : "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={attendanceData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
