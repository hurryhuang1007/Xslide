// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// const url = 'C:/data/test_svs/slide-2019-02-18T10-15-45-R2-S11.mrxs'
// const vips = require('./vips')


// console.time('缩略图加载')
// try {
//   vips.Image.openslideload(url, {
//     associated: 'thumbnail',
//     async: async (e, img) => {
//       if (e) return console.error('缩略图加载失败')
//       console.timeEnd('缩略图加载')
//       let buffer = img.writeToBuffer('.jpg')
//       global.buffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
//       // img.writeToFile('1.jpg')
//       // let imgBit = await createImageBitmap(new Blob([buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)], { type: 'image/jpeg' }))
//       // let imgBit = await createImageBitmap(buffer)
//       // document.querySelector('#canvas').getContext('2d').drawImage(imgBit, 0, 0)
//       // imgBit.close()
//       console.log('!!!')
//     }
//   })
// } catch (e) {
//   console.log('error')
// }
