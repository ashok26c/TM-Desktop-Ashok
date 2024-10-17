import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Bar from '../components/Bar';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';
import { BaseApiURL } from '../context/ApiURL';
import Timer from '../components/Timer';

const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#55679C',
        color: '#FFFFFF',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: '#666666',
    },
}));

const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd), &:last-child td, &:last-child th': {
        backgroundColor: '#FFFFFF',
    },
}));

export function Holiday() {
    const token = localStorage.getItem('sessionToken');
    const [allHoliday, setAllHoliday] = useState([]);
    const [filteredHoliday, setFilteredHoliday] = useState([]);
    const [holidayType, setHolidayType] = useState('');
    const [isUpcoming, setIsUpcoming] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(13);

    const get_all_holiday = `${BaseApiURL}/holiday/get-all-holiday-employee`;

    const getAllHoliday = async () => {
        try {
            const response = await axios.get(get_all_holiday, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.status === 200) {
                setAllHoliday(response.data.allHolidays);
                setFilteredHoliday(response.data.allHolidays);
                console.log("All holiday data fetched successfully", response.data.allHolidays);
            }
        } catch (error) {
            console.error("Error fetching all holiday data", error);
        }
    };

    const handleHolidayTypeChange = (event) => {
        setHolidayType(event.target.value);
    };

    const handleUpcomingChange = (event) => {
        setIsUpcoming(event.target.value);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        getAllHoliday();
    }, []);

    useEffect(() => {
        let filteredData = allHoliday;

        if (holidayType) {
            filteredData = filteredData.filter(holiday => holiday.holidayType === holidayType);
        }

        if (isUpcoming === 'true') {
            const today = new Date();
            filteredData = filteredData.filter(holiday => new Date(holiday.fromDate) >= today);
        }

        setFilteredHoliday(filteredData);
    }, [holidayType, isUpcoming, allHoliday]);

    return (
        <div className="right-content" style={{ height: '100vh', width: '84vw', display: 'flex', flexDirection: 'column',  marginTop:50 }}>
            {/* <Bar /> */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '17px', padding: '15px' }}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <Select
                                value={holidayType}
                                onChange={handleHolidayTypeChange}
                                displayEmpty
                                labelId="leaveStatus-filter"
                                inputProps={{ 'aria-label': 'Holiday Type' }}
                            >
                                <MenuItem value="">Holiday Type</MenuItem>
                                <MenuItem value="PRIVATE">Private</MenuItem>
                                <MenuItem value="PUBLIC">Public</MenuItem>
                                <MenuItem value="OFFICIAL">Official</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 120 }}>
                            <Select
                                value={isUpcoming}
                                onChange={handleUpcomingChange}
                                displayEmpty
                                labelId="upcoming-filter"
                                inputProps={{ 'aria-label': 'Upcoming' }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="true">Upcoming</MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    <TableContainer component={Paper} style={{ flex: 1 }}>
                        <Table sx={{ minWidth: 700 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>SN</StyledTableCell>
                                    <StyledTableCell>Holiday Type</StyledTableCell>
                                    <StyledTableCell>Holiday Title</StyledTableCell>
                                    <StyledTableCell>Holiday Session</StyledTableCell>
                                    <StyledTableCell>Holiday From</StyledTableCell>
                                    <StyledTableCell>Holiday To</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHoliday.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((holiday, index) => (
                                    <StyledTableRow key={holiday.holidayId}>
                                        <StyledTableCell component="th" scope="row">{index + 1 + page * rowsPerPage}</StyledTableCell>
                                        <StyledTableCell>{holiday.holidayType}</StyledTableCell>
                                        <StyledTableCell>{holiday.holidayTitle}</StyledTableCell>
                                        <StyledTableCell>{holiday.holidaySession}</StyledTableCell>
                                        <StyledTableCell>{new Date(holiday.fromDate).toLocaleDateString()}</StyledTableCell>
                                        <StyledTableCell>{new Date(holiday.toDate).toLocaleDateString()}</StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <TablePagination
                    rowsPerPageOptions={[13]}
                    component="div"
                    count={filteredHoliday.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', zIndex: 1 }}
                />
            </div>
        </div>
    );
}
