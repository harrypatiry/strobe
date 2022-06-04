const { audio } = require('./index.js')

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const audio1 = document.getElementById('audio')
audio1.src = audio