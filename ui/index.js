const { ipcRenderer } = require('electron');
const jsmediatags = require('jsmediatags');
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let uploadFile = document.getElementById('upload');
let playpause = document.getElementById('play-pause');
let info = document.getElementById('info')
let title = document.getElementById('title')
let container = document.getElementById('container');
let audioSource;
let analyser;
let audio

//upon clicking upload file, request the file from the main process
uploadFile.addEventListener('click', () => {
    ipcRenderer.send('file-request');
    if (audio != undefined){
        audio.pause()
    }
});

playpause.addEventListener('click', () => {
    if (audio.paused && audio.currentTime > 0 && !audio.ended) {
        audio.play();
        playpause.innerText = "PAUSE"
        
    } else {
        audio.pause();
        playpause.innerText = "PLAY"
    }
})

//upon receiving a file, process accordingly
ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
    player(file)
});

// const player = (file) => {
//     audio = new Audio(file)
//     // audio.play().catch(e => console.log(e))
//     jsmediatags.read(file, {
//         onSuccess: (tag) => {
//             console.log(tag)
//             title.innerText = tag.tags.title;
//             info.innerText = tag.tags.artist;
//         },
//         onError: (error) => {
//             console.log('error: ' + error)
//         }
//     })
//     return audio
// }

// animate ------------------------------------------ 

const player = (file) => {
    audio = new Audio(file)
    audio.play().catch(e => console.log(e))
    jsmediatags.read(file, {
        onSuccess: (tag) => {
            console.log(tag)
            title.innerText = tag.tags.title;
            info.innerText = tag.tags.artist;
        },
        onError: (error) => {
            console.log('error: ' + error)
        }
    })
    const audioCtx = new AudioContext();
    audioSource = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = canvas.width / bufferLength;
    let barHeight
    let x;

    const animate = () => {
        let x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray)
        drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray)
        requestAnimationFrame(animate)
    }
    animate()
}

const drawVisualiser = (bufferLength, x, barWidth, barHeight, dataArray) => {
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2
        ctx.fillStyle = 'white'
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth
    }
}






