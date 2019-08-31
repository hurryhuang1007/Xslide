const remote = global.nodeRequire('electron').remote

const supportFileType = ['jpg', 'jpeg', 'png', 'tif', 'svs', 'mrxs']

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
