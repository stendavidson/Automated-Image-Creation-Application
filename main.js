const { app, BrowserWindow } = require('electron/main')

const createWindow = () => {
  const win = new BrowserWindow({
    show:false,
    icon: 'icon.png',
    titleBarOverlay: {
      color: '#262626'
    }
  })
  win.setMenu(null)
  win.loadFile('pages/index.html')
  win.maximize()
  win.focus()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform == 'win32') {
    app.quit()
  }
})