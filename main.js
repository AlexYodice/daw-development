const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    }
  })

  // Load the index.html file
  win.loadFile(path.join(__dirname, 'src', 'index.html'))
  
  // Open the DevTools for debugging
  win.webContents.openDevTools()
}

function createInstrumentLibraryWindow() {
  console.log('Creating instrument library window')
  const parentWindow = BrowserWindow.getFocusedWindow()
  
  const libraryPath = path.join(__dirname, 'src', 'instrumentLibrary.html')
  console.log('Loading library from:', libraryPath)
  console.log('File exists:', require('fs').existsSync(libraryPath))
  
  const libraryWindow = new BrowserWindow({
    width: 800,
    height: 600,
    modal: true,
    parent: parentWindow,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    }
  })

  // Show developer tools immediately
  libraryWindow.webContents.openDevTools()
  
  libraryWindow.loadFile(libraryPath)
    .then(() => {
      console.log('Library window loaded successfully')
      libraryWindow.show()
    })
    .catch(err => {
      console.error('Failed to load library window:', err)
      console.error('Error details:', err.stack)
    })
}

// Add IPC handlers
ipcMain.on('open-instrument-library', () => {
  console.log('Received open-instrument-library request')
  createInstrumentLibraryWindow()
})

// Update the IPC handler
ipcMain.on('create-software-instrument-track', () => {
  console.log('Received create-software-instrument-track request')
  try {
    createInstrumentLibraryWindow()
  } catch (error) {
    console.error('Failed to create instrument library window:', error)
  }
})

ipcMain.on('instrument-selected', (event, instrument) => {
  console.log('Instrument selected:', instrument)
  const mainWindow = BrowserWindow.getAllWindows()[0]
  mainWindow.webContents.send('instrument-selected', instrument)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 