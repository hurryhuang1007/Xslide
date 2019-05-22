const vips = require('./vips')


exports.getInfos = async function (url, fn) {
  let img = await openslideload(url)
  let infos = img.getFields().reduce((o, i) => {
    o[i] = img.get(i)
    return o
  }, {})

  // let infos = ['openslide.level-count', 'slide-associated-images',
  //   'openslide.level[0].height',
  //   'openslide.level[1].height',
  //   'openslide.level[2].height',
  //   'openslide.level[3].height',
  //   'openslide.level[4].height',
  // ].reduce((o, i) => {
  //   o[i] = img.get(i)
  //   return o
  // }, {})
  console.log(infos)
  // fn(JSON.stringify(infos.width))
  // fn()
}

// try {
//   !function () {
//     let img = vips.Image.openslideload('C:/data/test_svs/slide-2019-02-18T10-15-45-R2-S11.mrxs')
//     let infos = img.getFields().reduce((o, i) => {
//       o[i] = img.get(i)
//       return o
//     }, {})
//     console.log(infos)
//   }()
// } catch (e) {
//   console.log(e)
// }

exports.getThumbnail = async function (url, fn) {
  let img = await openslideload(url, { associated: 'thumbnail' })
  fn(buffer2ArrayBuffer(await writeToJpgBuffer(img)))
}

function openslideload(url, props) {
  return new Promise((res, rej) => {
    vips.Image.openslideload(url, {
      ...props,
      async: (e, img) => e ? rej(e) : res(img)
    })
  })
}

function writeToJpgBuffer(img, props) {
  return new Promise((res, rej) => {
    img.writeToBuffer('.jpg', {
      ...props,
      async: (e, buffer) => e ? rej(e) : res(buffer)
    })
  })
}

function buffer2ArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}
