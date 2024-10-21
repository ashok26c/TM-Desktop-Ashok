
// main.js (Electron's main process)
import { app, BrowserWindow, ipcMain, dialog, desktopCapturer, session } from 'electron';
import path from 'path'; // Import the path module
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { spawn } from 'child_process'; // Import the child_process module
import os from 'os';
const numCores = os.cpus().length; // to Get the number of CPU cores
console.log("🚀 ~ numCores:", numCores)


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            enableRemoteModule: true,
            // nodeIntegration: false,
            nodeIntegration: true, 
            contextIsolation: false, 
        }
    });
    mainWindow.loadURL('http://192.168.1.84:8000')

    let ffmpegProcess = null;
    let videoBuffer=Buffer.alloc(0);
    ipcMain.handle('start-ffmpeg', (event, args) => {
      if (!ffmpegProcess) {
        console.log("Spawning FFmpeg process");
        // Create the FFmpeg process to accept continuous streams
        ffmpegProcess = spawn('ffmpeg', [
          '-y',                   // Overwrite output
          '-f', 'webm',            // Input format
          '-i', '-',               // Pipe input from stdin
          '-vcodec', 'libvpx-vp9', // Use VP9 codec
          '-crf', '23',            // Quality level (lower CRF = better quality)
          '-f', 'webm',            // Output format
          'pipe:1'                 // Output to pipe
        ]);


        // ffmpegProcess = spawn('ffmpeg', [
        //   '-y',                  // Overwrite output files
        //   '-f', 'webm',           // Input format
        //   '-i', '-',              // Pipe input from stdin
        //   '-vcodec', 'libvpx-vp9',   // Video codec
        //   '-acodec', 'libvorbis',     // Audio codec
        //   '-preset', 'fast',      // Compression speed
        //   '-crf', '32',           // Quality level
        //   '-g','240',
        //   '-f','matroska',
        //   'pipe:1'
        // ]);
        // '-threads',numCores.toString(),




    
    
        ffmpegProcess.stdin.on('error', (err) => {
          console.error('FFmpeg stdin error:', err);
        });
         // Handle the FFmpeg output
         ffmpegProcess.stdout.on('data', (data) => {
            // Append the new data to the buffer
            videoBuffer = Buffer.concat([videoBuffer, data]);
            console.log("--------------------------------------:", videoBuffer.length)
      
            // Check if we have enough data (e.g., 20 seconds worth of video)
            // You might need to adjust the calculation based on your video bitrate
            const targetSize = 623625;
            console.log("--------------------------------------:", targetSize)

            if (videoBuffer.length >= targetSize) {
              // Send the data to the renderer
              mainWindow.webContents.send('ffmpeg-output', videoBuffer);
              videoBuffer = Buffer.alloc(0); // Reset the buffer after sending
            }
          });
        ffmpegProcess.on('close', (code) => {
          console.log(`FFmpeg process closed with code ${code}`);
          ffmpegProcess = null;  // Reset the process after it closes
        });  
      } 
      // Ensure the data being passed is an ArrayBuffer
      if (args.videoStream instanceof ArrayBuffer) {
        const buffer = Buffer.from(args.videoStream);
        console.log('Buffer size:', buffer.length); // Log the size of the buffer
        // Write the buffer to FFmpeg's stdin without closing the stream
        ffmpegProcess.stdin.write(buffer, (err) => {
          if (err) {
            console.error('Error writing buffer to FFmpeg stdin:', err);
            return;
          }
          console.log('Buffer successfully written to FFmpeg stdin');
        });
      } else {
        console.error('Expected videoStream to be an ArrayBuffer.');
      }
    });

    
  
  



    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });


    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // const startUrl = process.env.NODE_ENV === 'development'
    // ? 'http://localhost:3000'
    // : `file://${path.join(__dirname, '../renderer/index.html')}`;


      // IPC Handler for getting active window info
  ipcMain.handle('get-active-window', async () => {
    try {
      const { activeWindow } = await import('get-windows');
      const windowInfo = await activeWindow();
      return windowInfo;
    } catch (error) {
      console.error('Error getting active window:', error);
      return null;
    }
  });
}

app.whenReady().then(() => {
    createWindow();

    electronApp.setAppUserModelId('com.electron');

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });
    ipcMain.on('ping', () => console.log('pong'))

    ipcMain.handle('get-desktop-sources', async () => {
        const { desktopCapturer } = require('electron');
        return desktopCapturer.getSources({ types: ['screen'] });
    });

    ipcMain.on('stop-recording', () => {
        mainWindow.webContents.send('stop-recording');
    });

    ipcMain.handle('take-screenshot', async (event, sessionToken) => {
        console.log('Screenshot request received');
        const { desktopCapturer } = require('electron');
      
        try {
          const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 },
          });
      
          if (sources.length > 0) {
            const screen = sources[0]; // Get only the first screen
            const pngData = screen.thumbnail.toPNG(); // Get PNG data

            // Send the screenshot data back to the renderer process
            event.sender.send('screenshot-data', pngData);
            console.log('Screenshot data sent to renderer');
        } else {
            console.error('No screen sources found');
        }
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
    });

    session.defaultSession.setDisplayMediaRequestHandler(
        (request, callback) => {
          desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            // Grant access to the first screen found.
            callback({ video: sources[0], audio: 'loopback' })
          })
          // If true, use the system picker if available.
          // Note: this is currently experimental. If the system picker
          // is available, it will be used and the media request handler
          // will not be invoked.
        },
        { useSystemPicker: true }
      )

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    // const choice = dialog.showMessageBox(mainWindow, {
    //     type: 'question',
    //     buttons: ['Yes', 'No'],
    //     title: 'Confirm Close',
    //     message: 'Are you sure you want to close the application?'
    //   });
    if (process.platform !== 'darwin') {
        app.quit();
    }
});