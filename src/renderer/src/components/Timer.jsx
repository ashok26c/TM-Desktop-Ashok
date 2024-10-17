import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { 
  startTimer, 
  stopTimer, 
  resetTimer,
  incrementDuration,
  selectBreakDuration,
  selectIsBreakRunning
} from '../redux/break/breakSlice'; 

const Timer = () => {
  const dispatch = useDispatch();
  const duration = useSelector(selectBreakDuration);
  const isRunning = useSelector(selectIsBreakRunning);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        dispatch(incrementDuration());
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, dispatch]);

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

//   const handleStartStop = () => {
//     if (isRunning) {
//       dispatch(stopTimer());
//     } else {
//       dispatch(startTimer());
//     }
//   };

//   const handleReset = () => {
//     dispatch(resetTimer());
//   };

  return (
    <Box sx={{
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        width: "100vw"  
      }}>
        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h3" component="div" align="center" gutterBottom>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
  );
};

export default Timer;