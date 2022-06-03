const { ipcRenderer } = require('electron');
const jsmediatags = require('jsmediatags');
let uploadFile = document.getElementById('upload');
playpause = document.getElementById('play-pause');
let info = document.getElementById('info')
let title = document.getElementById('title')
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
    } else {
        audio.pause();
    }
})

//upon receiving a file, process accordingly
ipcRenderer.on('file', (event, file) => {
    console.log('obtained file from main process: ' + file);
    player(file)
});

const player = (file) => {
    audio = new Audio(file)
    audio.play().catch(e => console.log(e))
    jsmediatags.read(file, {
        onSuccess: (tag) => {
          console.log(tag)
          title.innerText = tag.tags.title;
          info.innerHTML = `<p>artist: ${tag.tags.artist}</p>`
        },
        onError: (error) => {
          console.log('error: ' + error)
        }
    })
}





