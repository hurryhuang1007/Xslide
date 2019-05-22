const { remote } = require('electron')
const fn = remote.require('./fn')
window.fn = fn

const url = 'C:/data/test_svs/slide-2019-02-18T10-15-45-R2-S11.mrxs'
// fn.getInfos(url, a => window.a = a)
fn.getThumbnail(url, async buffer => {
  // window.buffer = buffer
  let imgBit = await createImageBitmap(new Blob([buffer], { type: 'image/jpeg' }))
  let canvas = document.querySelector('#canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.getContext('2d').drawImage(imgBit, 0, 0, canvas.width, canvas.height)
  imgBit.close()
})

// console.time('缩略图加载')
// try {
//   vips.Image.openslideload(url, {
//     associated: 'thumbnail',
//     // async: async (e, img) => {
//     //   if (e) return console.error('缩略图加载失败')
//     //   console.timeEnd('缩略图加载')
//     //   let buffer = img.writeToBuffer('.jpg')
//     //   let imgBit = await createImageBitmap(new Blob([buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)], { type: 'image/jpeg' }))
//     //   // let imgBit = await createImageBitmap(buffer)
//     //   document.querySelector('#canvas').getContext('2d').drawImage(imgBit, 0, 0)
//     //   imgBit.close()
//     //   console.log('!!!')
//     // }
//   })
// } catch (e) {
//   console.log('error')
// }

// setTimeout(async () => {
//   console.time('get buffer')
//   let buffer = remote.getGlobal('buffer')
//   console.timeEnd('get buffer')
//   let imgBit = await createImageBitmap(new Blob([buffer], { type: 'image/jpeg' }))
//   let canvas = document.querySelector('#canvas')
//   canvas.width = 0.995 * window.innerWidth
//   canvas.height = 0.995 * window.innerHeight
//   canvas.getContext('2d').drawImage(imgBit, 0, 0, canvas.width, canvas.height)
//   imgBit.close()
//   console.log('!!!')
// }, 1000);

// console.time('get array')
// remote.getGlobal('array')
// console.timeEnd('get array')