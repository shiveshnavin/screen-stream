const express = require('express');
const app = express();
const http = require('http').createServer(app);
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path')
const https = require("https");
const fs = require("fs");

// Set the path to the FFmpeg binary within the Node.js application
ffmpeg.setFfmpegPath(ffmpegPath);

app.get('/stream', (req, res) => {
    const command = ffmpeg()
        .input(':10.0')
        .inputFormat('x11grab')
        .videoCodec('libx264')
        .inputFPS(25)
        .size('1024x768')
        .outputFormat('mpegts')

        .outputOptions(['-crf 0', '-preset ultrafast'])
        .on('error', (err) => {
            console.error(`FFmpeg error: ${err.message}`);
            res.write(`FFmpeg error: ${err.message}`);
        });

    res.writeHead(200, {
        'Content-Type': 'video/mp2t',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'binary', // Set the content transfer encoding to binary
        'Accept-Ranges': 'bytes', // Set the accept ranges header to bytes
        'Content-Disposition': 'inline'
    });

    command.pipe(res, { end: true });
});

app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});


http.listen(5599, () => {
    console.log('HTTP Screen stream on http://127.0.0.1:5599/stream');
});


const port = 5499
var privateKey = fs.readFileSync('./common-creds/ssl/semibit.key.pem');
var certificate = fs.readFileSync('./common-creds/ssl/semibit.pem');
https
    .createServer({
        key: privateKey,
        cert: certificate
    }, app)
    .listen(port, () => {
        console.log('HTTPS Screen stream on http://127.0.0.1:5499/stream');
    });