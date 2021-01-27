const { app, BrowserWindow, ipcMain } = require('electron');
const Reptile = require('./reptile')

const isDev = require('electron-is-dev');

function createWindow() {
    const win = new BrowserWindow({
        width: 850,
        minWidth: 360,
        height: 700,
        title: '基金管理工具',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            webviewTag: true,
        }
    })
    
    if (isDev) {
        win.loadURL('http://localhost:3000')
    }else{
        win.loadURL('http://img.chuansroom.com/fundManager/index.html')
    }
    this.reptile = new Reptile(win.webContents);
    
    // 客户端加载完毕之后会通知主进程 开始加载数据
    ipcMain.on('web-onload', (ev, data) => {
        this.reptile.setKeys(Object.keys(data));
        this.reptile.start();
    })
    
    ipcMain.on('update-data', () => {
        // 手动更新
        this.reptile.onHandleGetData();
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
