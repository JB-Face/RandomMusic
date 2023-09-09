/*
 * @Descripttion: 
 * @version: 
 * @Author: JBFace
 * @Date: 2023-08-25 11:29:22
 * @LastEditors: JBFace
 * @LastEditTime: 2023-09-07 23:04:02
 */
/*
 * @Descripttion: 
 * @version: 
 * @Author: JBFace
 * @Date: 2023-08-25 11:29:22
 * @LastEditors: JBFace
 * @LastEditTime: 2023-08-25 18:30:35
 */
//引入两个模块：app 和 BrowserWindow

//app 模块，控制整个应用程序的事件生命周期。
//BrowserWindow 模块，它创建和管理程序的窗口。

const { app, BrowserWindow } = require('electron')
ipcMain = require('electron').ipcMain;
//在 Electron 中，只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口
let window

app.on('ready', () => {

  //创建一个窗口
  const mainWindow = new BrowserWindow(
    { height: 125,
      width: 800,
      transparent: true,
      resizable: false,
      frame: false,
      webPreferences: 
      { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true, }
    }
  )
  mainWindow.loadFile('./src/main.html')
  window = mainWindow;
})

ipcMain.on('window-close', function() {
  window.close();
})
