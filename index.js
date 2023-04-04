const express = require('express');
const child_process = require('child_process');

const app = express();

app.get('/stream', (req, res) => {
    // Check if ffmpeg is available in PATH
    const ffmpegPath = child_process.execSync('which ffmpeg').toString().trim();
    if (!ffmpegPath) {
        return res.status(500).send('FFmpeg is not installed or not available in PATH');
    }
    // Set the response headers to indicate that we're streaming video
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Transfer-Encoding': 'chunked'
    });

    // Spawn the ffmpeg process as a child process
    const ffmpegProcess = child_process.spawn('ffmpeg', [
        '-f', 'x11grab',
        '-probesize', '50M',
        '-r', '25',
        '-s', '1024x768',
        '-i', ':10.0',
        '-c:v', 'libx264',
        '-qp', '0',
        // '-t', '10',
        '-f', 'mpegts',
        'pipe:1'
    ]);
    // Pipe the ffmpeg output to the HTTP response
    ffmpegProcess.stdout.pipe(res);

    // Handle any errors that occur
    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`FFmpeg error: ${data}`);
    });

    ffmpegProcess.on('error', (error) => {
        console.error(`FFmpeg process error: ${error}`);
    });

    ffmpegProcess.on('exit', (code, signal) => {
        console.log(`FFmpeg process exited with code ${code} and signal ${signal}`);
    });

    res.on('close', () => {
        console.log('Client disconnected, stopping ffmpeg process');
        ffmpegProcess.kill();
    });
});

app.listen(5555, () => {
    console.log('Server running on port 5555');
});
