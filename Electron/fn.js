const vips = require('./vips')
const fs = require('fs')
const { ipcMain } = require('electron')
// const PQueue = require('p-queue').default
// const toArrayBuffer = require('to-arraybuffer')

// let queue = new PQueue({concurrency: Math.max(require('os').cpus().length * 2, 1)})
let imageObjectPool = {}
let imageObjectLoadedFn = {}
const fnName2Fn = { getInfos, getThumbnail, getImage }
ipcMain.on('vips_fn', async (e, callbackChannel, message) => {
  try {
    e.sender.send(callbackChannel, await fnName2Fn[message.fnName](...message.args))
  } catch (err) {
    err.type = 'error'
    e.sender.send(callbackChannel, err)
  }
})
// ipcMain.on('vips_fn', async (e, callbackChannel, message) => e.sender.send(callbackChannel, await queue.add(async () => await fnName2Fn[message.fnName](...message.args))))

async function getInfos(url) {
  let img = await getImageObject(url)
  let infos = img.getFields().reduce((o, i) => {
    o[i] = img.get(i)
    return o
  }, {})
  // console.log(infos)
  return infos
}

async function getThumbnail(url, props = {}) {
  let img = await getImageObject(url, props)
  if (!props.associated) return await thumbnailImageBuffer(img, 3000)
  return await writeToJpgBuffer(img)
}

async function getImage(url, props = {}) {
  // props.autocrop = true
  let img = await getImageObject(url, props)
  if (props.left || props.top || props.width || props.height) img = await crop(img, props)
  return await writeToJpgBuffer(img)
}

function thumbnailImageBuffer(img, width) {
  return new Promise(async (res, rej) => {
    if (img.width <= width) {
      res(await writeToJpgBuffer(img))
      return
    }

    let thumbnailFilename = img.filename.substring(0, img.filename.lastIndexOf('.') + 1) + 'thumbnail.jpg'
    if (fs.existsSync(thumbnailFilename)) {
      fs.readFile(thumbnailFilename, (e, buffer) => res(buffer))
      return
    }

    img.thumbnailImage(width, {
      async: async (e, i) => {
        if (e) {
          rej(e)
        } else {
          let buffer = await writeToJpgBuffer(i)
          res(buffer)
          fs.writeFile(thumbnailFilename, buffer, e => { })
        }
      }
    })
  })
}

function crop(img, props = {}) {
  return new Promise((res, rej) => {
    if (!props.left && !props.top && !props.width && !props.height) {
      res(img)
      return
    }
    let left = props.left || 0
    let top = props.top || 0
    let width = props.width ? Math.min(props.width, img.width - left) : (img.width - left)
    let height = props.height ? Math.min(props.height, img.height - top) : (img.height - top)
    img.crop(left, top, width, height, { async: (e, img) => e ? rej(e) : res(img) })
  })
}

function writeToJpgBuffer(img, props = {}) {
  return new Promise((res, rej) => img.writeToBuffer('.jpg', Object.assign(props, { async: (e, buffer) => e ? rej(e) : res(buffer) })))
  // return new Promise((res, rej) => res(img.writeToBuffer('.jpg', props)))
}

function getImageObject(url, props = {}) {
  return new Promise((res, rej) => {
    if (props.associated && props.level) {
      rej('specify only one of level or associated image')
      return
    }
    let k = `${url}.${props.associated || props.level || 0}.${!!props.autocrop}`
    if (imageObjectPool[k]) {
      res(imageObjectPool[k])
      return
    }
    if (imageObjectLoadedFn[k]) {
      imageObjectLoadedFn[k].push({ res, rej })
      return
    }
    // log.info('init image object, k:' + k)
    imageObjectLoadedFn[k] = []
    // 异步初始化的image对象GC似乎有问题
    vips.Image.openslideload(
      url,
      Object.assign(
        {
          level: props.level,
          autocrop: props.autocrop,
          associated: props.associated
        },
        {
          async: (e, img) => {
            if (e) {
              rej(e)
              imageObjectLoadedFn[k].forEach(i => i.rej(e))
            } else {
              imageObjectPool[k] = img
              res(img)
              imageObjectLoadedFn[k].forEach(i => i.res(img))
            }
            delete imageObjectLoadedFn[k]
          }
        }
      )
    )

    // let img, success
    // try {
    //   img = vips.Image.openslideload(url,{level: props.level, autocrop: props.autocrop, associated: props.associated})
    //   success = !!img
    // } catch (e) {
    //   success = false
    // }
    // if (success) {
    //   imageObjectPool[k] = img
    //   res(img)
    //   imageObjectLoadedFn[k].forEach(i => i.res(img))
    // } else {
    //   rej('init image object fail')
    //   imageObjectLoadedFn[k].forEach(i => i.rej('init image object fail'))
    // }
    // delete imageObjectLoadedFn[k]
  })
}
