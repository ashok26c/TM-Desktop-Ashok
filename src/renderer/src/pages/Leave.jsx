import React, { useEffect, useState } from 'react';
import Bar from '../components/Bar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import axios from 'axios';
import '../assets/css/rightContent.css';
import ApplyLeave from '../model/LeaveModal';
import deleteIcon from '../assets/image/delete-icon.svg'; 
import { BaseApiURL } from '../context/ApiURL';
import { useDispatch, useSelector } from 'react-redux';
import { selectLeaveData, setLeaveData } from '../redux/leave/leaveSlice';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Swal from "sweetalert2";


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
        FormatAlignJustify: 'right',
    },
}));

// Status styles mapping
const statusStyles = {
    PENDING: { color: 'orange', fontWeight: 'bold' },
    DECLINED: { color: 'red', fontWeight: 'bold' },
    APPROVE: { color: 'green', fontWeight: 'bold' },
};

export function Leave() {
    const dispatch = useDispatch()
    const token = localStorage.getItem('sessionToken');
    const [leave, setLeave] = useState([]);
    const [filteredLeave, setFilteredLeave] = useState([]);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
    const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
    const [upcomingFilter, setUpcomingFilter] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, leaveId: '' });

    const employee_all_leave_api = `${BaseApiURL}/leave/view-leave-status`;
    const delete_leave_api = `${BaseApiURL}/leave/delete-leave`;

    const [approvedCasualLeaveCount, setApprovedCasualLeaveCount] = useState(0);
    const [approvedSickLeaveCount, setApprovedSickLeaveCount] = useState(0);
    const [totalApprovedLeaveCount, setTotalApprovedLeaveCount] = useState(0);    
    const [totalAppliedLeaveCount, setTotalAppliedLeaveCount] = useState(0);

    const leaveData = useSelector(selectLeaveData)

    const handleGetAllLeave = async () => {
        try {
            const response = await axios.get(employee_all_leave_api, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });
            setLeave(response.data.leavestatus);
            dispatch(setLeaveData(response.data.leavestatus))
        } catch (error) {
            console.error('Error while fetching employee leave status', error);
        }
    };

    const handleDeleteLeave = async (leaveId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete leave request!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Call the delete API if user confirms
                    await axios.delete(`${delete_leave_api}/${leaveId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        },
                    });
    
                    // Show success message
                    Swal.fire(
                        'Deleted!',
                        'The leave has been deleted.',
                        'success'
                    );
    
                    // Refresh the leave list after deletion
                    handleGetAllLeave();
    
                } catch (error) {
                    // Handle any errors
                    Swal.fire(
                        'Error!',
                        'There was a problem deleting the leave.',
                        'error'
                    );
                    console.error('Error while deleting leave status', error);
                }
            }
        });
    };

    const handleRightClick = (event, leaveId) => {
        event.preventDefault();
        if (filteredLeave.find(l => l.leaveId === leaveId)?.leaveStatus === 'PENDING') {
            setContextMenu({
                visible: true,
                x: event.clientX,
                y: event.clientY,
                leaveId,
            });
        }
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, leaveId: '' });
    };

    useEffect(() => {
        handleGetAllLeave();
    }, []);
    
    const handleLeaveSubmitted = () => {
        handleGetAllLeave();
    };

    useEffect(() => {
        // Check if leaveData is null or undefined
        if (!leaveData) {
            setFilteredLeave([]);
            return;
        }
    
        let filtered = leaveData;
    
        // Filter by leave type
        if (leaveTypeFilter) {
            filtered = filtered.filter(l => l.leaveType === leaveTypeFilter);
        }
    
        // Filter by leave status
        if (leaveStatusFilter) {
            filtered = filtered.filter(l => l.leaveStatus === leaveStatusFilter);
        }
    
        // Filter by upcoming leave
        if (upcomingFilter) {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(l => new Date(l.leaveFrom) >= new Date(today));
        }
    
        setFilteredLeave(filtered);
    
        // Calculate counts
        const approvedLeaves = filtered.filter(l => l.leaveStatus === 'APPROVE');
        setApprovedCasualLeaveCount(approvedLeaves.filter(l => l.leaveType === 'CASUALLEAVE').length);
        setApprovedSickLeaveCount(approvedLeaves.filter(l => l.leaveType === 'SICKLEAVE').length);
        setTotalApprovedLeaveCount(approvedLeaves.length);
    
        // Total applied leaves count
        setTotalAppliedLeaveCount(filtered.length);
    
    }, [leaveData, leaveTypeFilter, leaveStatusFilter, upcomingFilter]);

    return (
        <div className="right-content" style={{ height: '100vh', width: '84vw', marginTop:50 }}>
            {/* <Bar /> */}
            <Box style={{ paddingTop: '40px', paddingBottom: '20px', display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
                    <Card sx={{ padding: '0px 30px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#694E4E' }}>
                        <CardContent sx={{ color: 'white' }}>
                            <Typography sx={{ fontSize: 20, fontWeight: 550 }} gutterBottom>
                                Casual Leave
                            </Typography>
                            <Typography sx={{ fontSize: 30, fontWeight: 600 }}>
                                {approvedCasualLeaveCount}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ padding: '0px 30px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#495464' }}>
                        <CardContent sx={{ color: 'white' }}>
                            <Typography sx={{ fontSize: 20, fontWeight: 550 }} gutterBottom>
                                Sick Leave
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 30, fontWeight: 600 }}>
                                {approvedSickLeaveCount}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ padding: '0px 30px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#797A7E' }}>
                        <CardContent sx={{ color: 'white' }}>
                            <Typography sx={{ fontSize: 20, fontWeight: 550 }} gutterBottom>
                                Total Leave
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 30, fontWeight: 600 }}>
                                {totalApprovedLeaveCount}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ padding: '0px 30px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#797A7E' }}>
                        <CardContent sx={{ color: 'white' }}>
                            <Typography sx={{ fontSize: 20, fontWeight: 550 }} gutterBottom>
                                Total Applied Leave
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 30, fontWeight: 600 }}>
                                {totalAppliedLeaveCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* <p style={{ color: 'red', textAlign: 'center' }}>
                        " To delete pending leave right click on that row. "
                    </p> */}

                    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '17px' }}>
                        <FormControl sx={{ minWidth: 120, marginTop: '75px', marginLeft: 'auto' }}>
                            <Select
                                labelId="leaveType-filter"
                                value={leaveTypeFilter}
                                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Leave Type</MenuItem>
                                <MenuItem value="CASUALLEAVE">Casual Leave</MenuItem>
                                <MenuItem value="SICKLEAVE">Sick Leave</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 120, marginTop: '75px', marginLeft: 'auto' }}>
                            <Select
                                labelId="leaveStatus-filter"
                                value={leaveStatusFilter}
                                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Leave Status</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="DECLINED">Declined</MenuItem>
                                <MenuItem value="APPROVE">Approved</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 120, marginTop: '75px', marginLeft: 'auto' }}>
                            <Select
                                labelId="upcoming-filter"
                                value={upcomingFilter ? 'true' : 'false'}
                                onChange={(e) => setUpcomingFilter(e.target.value === 'true')}
                                displayEmpty
                            >
                                <MenuItem value="false">All</MenuItem>
                                <MenuItem value="true">Upcoming</MenuItem>
                            </Select>
                        </FormControl>

                        <Button sx={{ color: 'white', marginLeft: 'auto', marginTop: '75px', padding: '20px', backgroundColor: '#55679C' }}>
                            <ApplyLeave onLeaveSubmitted={handleLeaveSubmitted} />
                        </Button>
                    </div>
                </div>
            </Box>

            <Divider />

            <br />
            <br />

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>SN</StyledTableCell>
                            <StyledTableCell>Applied Date</StyledTableCell>
                            <StyledTableCell>From - To</StyledTableCell>
                            <StyledTableCell>No of Days</StyledTableCell>
                            <StyledTableCell>Reason</StyledTableCell>
                            <StyledTableCell>Leave Type</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredLeave.map((leavestatus, i) => (
                            <StyledTableRow
                                key={leavestatus.leaveId}
                                onContextMenu={(event) => handleRightClick(event, leavestatus.leaveId)}
                            >
                                <StyledTableCell component="th" scope="row">{i + 1}</StyledTableCell>
                                <StyledTableCell>{leavestatus.createdAt.split('T')[0]}</StyledTableCell>
                                <StyledTableCell>{leavestatus.leaveFrom.split('T')[0]} - {leavestatus.leaveTo.split('T')[0]}</StyledTableCell>
                                <StyledTableCell>{leavestatus.noOfDays}</StyledTableCell>
                                <StyledTableCell>{leavestatus.reason}</StyledTableCell>
                                <StyledTableCell>{leavestatus.leaveType}</StyledTableCell>
                                <StyledTableCell style={statusStyles[leavestatus.leaveStatus]}>
                                    {leavestatus.leaveStatus}
                                    {/* {leavestatus.leaveStatus.charAt(0).toUpperCase() + leavestatus.leaveStatus.slice(1).toLowerCase()} */}
                                </StyledTableCell>
                                <StyledTableCell> { leavestatus.leaveStatus == "PENDING" ? <DeleteForeverIcon sx={{color:"red", cursor:"pointer"}} onClick={()=>handleDeleteLeave( leavestatus.leaveId )} /> :null }  </StyledTableCell>

                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* {contextMenu.visible && (
                <div
                    style={{
                        position: 'absolute',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '5px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                    }}
                    onMouseLeave={handleCloseContextMenu}
                >
                    <Button
                        onClick={() => {
                            handleDeleteLeave(contextMenu.leaveId);
                            handleCloseContextMenu();
                        }}
                    >
                        <img src={deleteIcon} alt='Delete' style={{ height: '20px' }} />
                    </Button>
                </div>
            )} */}
        </div>
    );
}
