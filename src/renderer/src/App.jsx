import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { RecordingProvider } from './components/RecordingContext';
import { Overview } from './pages/Overview';
import { Login } from './pages/Login';
import { Leave } from './pages/Leave';
import { ClockIn } from './pages/ClockIn';
import { Attendance } from './pages/Attendance';
import { Holiday } from './pages/Holiday';
import StartRecording from './components/StartRecording';
import StopRecording from './components/StopRecording';
import Screenshot from './components/Screenshot';
import { TrackingProvider } from './context/GlobleTracking';
import AppLayout from './Layout/AppLayout';
import OverviewPage from './pages/OverviewPage';
import Timer from './components/Timer';
import AttendancePage from './pages/AttendancePage';
import AppsUsed from './pages/AppsUsed';
import ScreenRecordingWithApi from './components/ScreenRecordingWithApi';

const App = () => {
  return (
    <RecordingProvider>
      <TrackingProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
              <Route path="/" element={<ClockIn />} />
            <Route path="/" element={<AppLayout />}>
              {/* <Route path="overview" element={<Overview />} /> */}
              <Route path="overview" element={<OverviewPage />} />
              <Route path="leave" element={<Leave />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="attendance-page" element={<AttendancePage />} />
              <Route path="holiday" element={<Holiday />} />
              <Route path="start-recording" element={<StartRecording />} />
              <Route path="stop-recording" element={<StopRecording />} />
              <Route path="screenshot" element={<Screenshot />} />
              <Route path="break" element={<Timer />} />
              <Route path="used-apps" element={<AppsUsed />} />
              <Route path="screen-record" element={<ScreenRecordingWithApi />} />
            </Route>
          </Routes>
        </HashRouter>
      </TrackingProvider>
    </RecordingProvider>
  );
};

export default App;