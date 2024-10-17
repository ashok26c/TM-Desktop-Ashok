import React, { createContext, useContext, useState, useEffect } from 'react';

const TrackingContext = createContext();

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider = ({ children }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [windowInfo, setWindowInfo] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [appDurations, setAppDurations] = useState({});

    // Function to fetch active window info
    const fetchActiveWindowInfo = async () => {
        try {
            const info = await window.electron.ipcRenderer.invoke('get-active-window');
            if (info) {
                const currentTime = new Date().getTime();

                // First time fetching or if tracking just started
                if (!windowInfo || !startTime) {
                    setWindowInfo(info);
                    setStartTime(currentTime);
                } else if (info.title !== windowInfo.title) {
                    // If the active window has changed
                    const duration = currentTime - startTime;
                    const appTitle = windowInfo.title;
                    const appName = windowInfo.owner.name;

                    // Update the duration for the previous window
                    setAppDurations(prevDurations => ({
                        ...prevDurations,
                        [appName]: (prevDurations[appName] || 0) + duration,
                    }));

                    // Set the new active window and start time
                    setWindowInfo(info);
                    setStartTime(currentTime);
                }
            }
        } catch (error) {
            console.error('Error fetching active window info:', error);
        }
    };

    useEffect(() => {
        if (isTracking) {
            // Fetch active window info at intervals if tracking is on
            const intervalId = setInterval(fetchActiveWindowInfo, 1000); // Fetch every second
            return () => clearInterval(intervalId);
        }
    }, [isTracking, windowInfo, startTime]);

    return (
        <TrackingContext.Provider value={{ isTracking, setIsTracking, windowInfo, appDurations }}>
            {children}
        </TrackingContext.Provider>
    );
};
