const { remote } = require('electron')
const fn = remote.require('./fn')
window.fn = fn

const url = './test_file/Mirax2-Fluorescence-2.mrxs'
fn.getThumbnail(url, async buffer => {
  // window.buffer = buffer
  let imgBit = await createImageBitmap(new Blob([buffer], { type: 'image/jpeg' }))
  let canvas = document.querySelector('#canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.getContext('2d').drawImage(imgBit, 0, 0, canvas.width, canvas.height)
  imgBit.close()
})

setTimeout(() => {
  alert('getInfos will be start')
  fn.getInfos(url, console.log)
  alert('done')
}, 5000)
