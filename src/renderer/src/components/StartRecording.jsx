import React, { useContext, forwardRef } from 'react';
import { RecordingContext } from './RecordingContext';
import { Button } from '@mui/material';
const StartRecording = forwardRef((props, ref) => {
    const { startRecording, isRecording } = useContext(RecordingContext);
    return (
        <div>
            <Button 
                sx={{display: 'none'}}
                onClick={startRecording}
                disabled={isRecording}
                className={isRecording ? 'is-danger' : ''}
                ref={ref}
            >
                {isRecording ? 'Recording' : 'Start Recording'}
            </Button>
        </div>
    );
});
export default StartRecording;

// import React, { useContext } from 'react';
// import { RecordingContext } from './RecordingContext';
// import { Button } from '@mui/material';

// const StartRecording = () => {
//     const { startRecording, isRecording } = useContext(RecordingContext);

//     return (
//         <div>
//             <Button
//                 variant="contained" 
//                 color="primary" 
//                 onClick={startRecording}
//                 disabled={isRecording}
//                 className={isRecording ? 'is-danger' : ''}
//             >
//                 {isRecording ? 'Recording' : 'ClockIn'}
//             </Button>
//         </div>
//     );
// };

// export default StartRecording;