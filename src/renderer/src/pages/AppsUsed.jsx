import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useTracking } from '../context/GlobleTracking';
import { useSelector } from 'react-redux';
import { selectReviewedApps } from '../redux/appReview/appReviewSlice';
import { Typography } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function AppsUsed() {
  const [appData, setAppData] = useState([]);
  const { appDurations } = useTracking();
  const reviewedApps = useSelector(selectReviewedApps);

  useEffect(() => {
    const processedData = Object.keys(appDurations).map(appName => {
      const reviewedApp = reviewedApps.find(app => app.appName === appName);
      return {
        name: appName,
        duration: appDurations[appName],
        status: reviewedApp ? reviewedApp.appReview : 'NEUTRAL'
      };
    });
    setAppData(processedData);
  }, [appDurations, reviewedApps]);

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PRODUCTIVE': return 'green';
      case 'UNPRODUCTIVE': return 'red';
      default: return 'orange';
    }
  };

  return (
    <div className="right-content" style={{ height: "100vh", width: "84vw", display: 'flex', flexDirection: 'column',  marginTop:50 }}>
         <Typography sx={{display:"flex", justifyContent:"center", fontSize:40, fontWeight:"bold"}}> Today Used App History</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>App Name</StyledTableCell>
              <StyledTableCell align="right">Duration</StyledTableCell>
              <StyledTableCell align="right">Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appData.map((app) => (
              <StyledTableRow key={app.name}>
                <StyledTableCell component="th" scope="row">
                  {app.name}
                </StyledTableCell>
                <StyledTableCell align="right">{formatDuration(app.duration)}</StyledTableCell>
                <StyledTableCell align="right" style={{ color: getStatusColor(app.status) }}>
                  {app.status}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}