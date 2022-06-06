const { ipcRenderer } = require('electron');
const { fs } = require('fs');
const jsmediatags = require('jsmediatags');
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let uploadFile = document.getElementById('upload');
let info = document.getElementById('info')
let title = document.getElementById('title')
let audioSource;
let analyser;
let dataArray
let audio

//upon clicking upload file, request the file from the main process
uploadFile.addEventListener('click', () => {
    ipcRenderer.send('file-request');
    if (audio != undefined){
        audio.pause()
        document.getElementById('audio-container').removeChild(audio)
    }
});

//upon receiving a file, process accordingly
ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
    playlist(file)
});

const playlist = (file) => {
    let listContainer = document.getElementById('playlist');
    let audioArray = [];
    audioArray.push(file)
    //display each item in audio array
    audioArray.forEach(item => {
        // get and display file metadata
        jsmediatags.read(item, {
            onSuccess: (tag) => {
                let li = document.createElement('li')
                listContainer.appendChild(li)
                li.innerHTML += `${tag.tags.title} - ${tag.tags.artist}`
                li.onclick = () => {audioSelect(item)}
            },
            onError: (error) => {
                console.log('error: ' + error)
            }
        })
    })
}

const audioSelect = (i) => {
    console.log(`${i} has been recieved from playlist choice`)
    // if (audio !== undefined) {
    //     audio.pause()
    // }
    player(i)
}
//animate ------------------------------------------ 

const player = (file) => {
    audio = new Audio(file)
    audio.controls = false
    audio.autoplay = true
    document.getElementById('audio-container').appendChild(audio)
    audio.play().catch(e => console.log(e))
    const audioCtx = new AudioContext();
    audioSource = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    let bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const animate = () => {
        window.requestAnimationFrame(animate)
        // analyser.getByteFrequencyData(dataArray)
        analyser.getByteTimeDomainData(dataArray);
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * canvas.height / 2;
    
            if(i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
    
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    animate()
}






