const vips = require('./vips')


exports.getInfos = async function (url, fn) {
  let img = await openslideload(url)
  let infos = img.getFields().reduce((o, i) => {
    o[i] = img.get(i)
    return o
  }, {})
  // console.log(infos)
  fn(infos)
}

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
