import uuidv1 from 'uuid/v1'
const { remote, ipcRenderer } = global.nodeRequire('electron')

const supportFileType = [
  'jpg', 'jpeg', 'png', 'tif', 'svs', 'mrxs', 'bif', 'hdpi', 'vms', 'vmu',
  'scn', 'tiff', 'svslide'
]

export {
  supportFileType
}

export function eventPreventDefault(e) {
  e.preventDefault()
}

export function getFileTypeByURL(url) {
  return url.substring(url.lastIndexOf('.') + 1).toLowerCase()
}

export function selectFile(callback) {
  let paths = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openFile'],
    filters: [
      { name: 'Support File Type', extensions: supportFileType },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (!paths || !paths[0]) return
  callback(paths[0])
}

export function vipsFnPromise(fnName, args = []) {
  return new Promise((resolve, reject) => {
    let callbackChannel = uuidv1()
    ipcRenderer.once(callbackChannel, (e, result) => result.type === 'error' ? reject(result) : resolve(result))
    ipcRenderer.send('vips_fn', callbackChannel, { fnName, args })
  })
}
global.vipsFnPromise = vipsFnPromise

export function jpgBuffer2ImageAsync(buffer) {
  return new Promise(resolve => {
    let img = new window.Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(new global.Blob([buffer], { type: 'image/jpeg' }))
  })
}

export function blob2BufferAsync(blob) {
  return new Promise(res => {
    let fileReader = new global.FileReader()
    fileReader.onload = () => res(new global.Uint8Array(fileReader.result))
    fileReader.readAsArrayBuffer(blob)
  })
}
