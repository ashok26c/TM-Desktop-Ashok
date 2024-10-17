import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Autocomplete from '@mui/material/Autocomplete';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import plus from '../assets/image/plus.svg';
import axios from 'axios';
import { BaseApiURL } from '../context/ApiURL';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 8,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
};

const leaveOptions = [
  { label: 'Casual Leave', value: 'CASUALLEAVE' },
  { label: 'Sick Leave', value: 'SICKLEAVE' },
];

const sessionOptions = [
  { label: 'Full Day', value: 'FULLDAY' },
  { label: 'Half Day', value: 'HALFDAY' },
  { label: '1 Hour', value: '1HOUR' },
  { label: '10 minutes', value: '10MINUTES' },
];

export default function LeaveModal({onLeaveSubmitted}) {
  const token = localStorage.getItem('sessionToken');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [session, setSession] = useState(null); // State for leave session
  const [inputValue, setInputValue] = useState('');
  const [reason, setReason] = useState('');
  const [noOfDays, setNoOfDays] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Calculate number of days between two dates
  const calculateNoOfDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include the end date
    return daysDiff;
  };

  // Update number of days when leaveFrom or leaveTo changes
  useEffect(() => {
    if (leaveFrom && leaveTo) {
      const days = calculateNoOfDays(leaveFrom, leaveTo);
      setNoOfDays(days.toString());
    } else {
      setNoOfDays('');
    }
  }, [leaveFrom, leaveTo]);

  const apply_leave_api = `${BaseApiURL}/leave/apply-leave`;

  const handleSubmit = async (event) => {
    event.preventDefault(); // This line is necessary to prevent default form submission

    if (!value || !reason || !leaveFrom || !leaveTo || !session) {
      setErrorMessage('All fields are required');
      return;
    }

    const leaveData = {
      leaveType: value.value, // Correct value for leaveType
      leaveStatus: 'PENDING', // Assume a default leaveStatus; adjust as needed
      reason,
      noOfDays,
      leaveSession: session.value, // Add leaveSession to the data
      leaveFrom: new Date(leaveFrom).toISOString(), // Ensure correct format
      leaveTo: new Date(leaveTo).toISOString(), // Ensure correct format
    };

    try {
      const response = await axios.post(apply_leave_api, leaveData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('Leave application submitted successfully');
        handleClose();
        onLeaveSubmitted();
      } else {
        setErrorMessage('An error occurred');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while submitting the leave application';
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        onClick={handleOpen}
      >
        <img src={plus} alt="Plus Icon" style={{ height: '20px' }} />
        Apply Leave
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h2">
            Leave Form
          </Typography>

          <FormControl
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            onSubmit={handleSubmit}
          >
            <Autocomplete
              value={value}
              onChange={(event, newValue) => setValue(newValue)}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
              options={leaveOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label="Leave Type" />}
              sx={{ width: 300 }}
            />

            <Autocomplete
              value={session}
              onChange={(event, newSession) => setSession(newSession)}
              options={sessionOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label="Leave Session" />}
              sx={{ width: 300 }}
            />

            <TextField
              required
              id="reason"
              label="Reason"
              placeholder="Reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
            />

            <TextField
              id="noOfDays"
              label="Number of Days"
              placeholder="Number of days leave"
              type="number"
              value={noOfDays}
              InputProps={{ readOnly: true }} 
              sx={{ display:'none'}}
              fullWidth
            />

            <TextField
              required
              id="leaveFrom"
              label="Leave From"
              placeholder="Start date of leave"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={leaveFrom}
              onChange={(e) => setLeaveFrom(e.target.value)}
              fullWidth
            />

            <TextField
              required
              id="leaveTo"
              label="Leave To"
              placeholder="End date of leave"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={leaveTo}
              onChange={(e) => setLeaveTo(e.target.value)}
              fullWidth
            />

            <Button type="submit" variant="contained" sx={{ color: '#005BC4' }}>
              <FormLabel sx={{ color: '#FFFFFF' }}>Submit</FormLabel>
            </Button>
          </FormControl>

          {/* Snackbar for displaying error and success messages */}
          <Snackbar
            open={!!errorMessage}
            autoHideDuration={6000}
            onClose={() => setErrorMessage(null)}
          >
            <Alert onClose={() => setErrorMessage(null)} severity="error">
              {errorMessage}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity="success">
              {successMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Modal>
    </div>
  );
}
