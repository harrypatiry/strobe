// Modules to control application life and create native browser window
const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
    // autoHideMenuBar: true,
  })

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/ui/index.html')

  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    },
    {
        label: 'Developer',
        submenu: [
            {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click() {
                    mainWindow.webContents.toggleDevTools();
                }
            }
        ]
      },
  ]
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('file-request', (event) => {  
    // If the platform is 'win32' or 'Linux'
    if (process.platform !== 'darwin') {
      // Resolves to a Promise<Object>
        dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: 'Upload',
            // Restricting the user to only Text Files.
            filters: [ 
                { 
                    name: 'Audio Files', 
                    extensions: ['mp3', 'wav'] 
                }, ],
            // Specifying the File Selector Property
            properties: ['openFile']
      }).then(file => {
            // Stating whether dialog operation was
            // cancelled or not.
            if (file.canceled) {
                console.log("dialog cancelled: " + file.canceled);
                const filepath = file.filePaths[0].toString();
                console.log(filepath);
                event.reply('file', filepath);
            } else {
                  // get first element in array which is path to file selected
                const filePath = file.filePaths[0];

                // get file name
                const fileName = path.basename(filePath);

                // path to app data + fileName = "C:\Users\John\AppData\Roaming\app_name\picture.png"
                let audioPath = path.join(app.getPath('userData'), fileName);

                // copy file from original location to app data folder
                fs.copyFile(filePath, audioPath, (err) => {
                    if (err) throw err;
                    console.log(fileName + ' uploaded.');
                });
                console.log(filePath);
                event.reply('file', filePath);
            } 
      }).catch(err => {
            console.log(err)
      });
    }
    else {
        // If the platform is 'darwin' (macOS)
        dialog.showOpenDialog({
            title: 'Select the File to be uploaded',
            defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: 'Upload',
            filters: [ 
                { 
                    name: 'Text Files', 
                    extensions: ['mp3', 'wav'] 
                }, ],
            // Specifying the File Selector and Directory 
            // Selector Property In macOS
            properties: ['openFile', 'openDirectory']
      }).then(file => {
            // Stating whether dialog operation was
            // cancelled or not.
            if (file.canceled) {
              console.log("dialog cancelled: " + file.canceled);
              const filepath = file.filePaths[0].toString();
              console.log(filepath);
              event.reply('file', filepath);
          } else {
                // get first element in array which is path to file selected
              const filePath = file.filePaths[0];

              // get file name
              const fileName = path.basename(filePath);

              // path to app data + fileName = "C:\Users\John\AppData\Roaming\app_name\picture.png"
              let audioPath = path.join(app.getPath('userData'), fileName);

              // copy file from original location to app data folder
              fs.copyFile(filePath, audioPath, (err) => {
                  if (err) throw err;
                  console.log(fileName + ' uploaded.');
              });
              console.log(filePath);
              event.reply('file', filePath);
          } 
    }).catch(err => {
        console.log(err)
      });
    }
  });