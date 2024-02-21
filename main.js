const { app, BrowserWindow } = require('electron/main')
const fs = require('fs')

/**
 * This function recursively finds a unique filename.
 * 
 * @param {string} fileName The filename being replaced
 * @param {string} extension The file extension
 * @param {number} num The increment
 * @returns A string containing the new filename - instead of a duplicate.
 */
function replaceFile(fileName, extension, num){

	if(fs.existsSync(fileName + (num > 0 ? "(" + num + ")" : "") + extension)){
		let newNumber = num + 1;
		return replaceFile(fileName, extension, newNumber);
	}else{
		return fileName + (num > 0 ? "(" + num + ")" : "") + extension;
	}
}

/**
 * This method creates a Browser Window in Electron and configures
 * various settings and callbacks.
 */
function createWindow(){

	const win = new BrowserWindow({
		show:false,
		icon: 'icon.png',
		titleBarOverlay: {
			show: true,
			color: '#262626'
		},
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			nodeIntegrationInWorker: false
		}
	})

	win.setMenu(null)
	win.loadFile('pages/index.html')

	win.once('ready-to-show', () => {
		win.show();
		win.maximize();
	});

	// File download callbacks
	win.webContents.session.on('will-download', (event, item, webContents) => {

		console.log(item.getFilename());

		const fileName = replaceFile('c:\\Users\\pelon\\Downloads\\Images\\' + item.getFilename().replace(".png", ""), ".png", 0);

		// Set the save path
		item.setSavePath(fileName);

		// Set callback for when an file is downloaded
		item.on("updated", function(){

			let total = item.getTotalBytes();
			let received = item.getReceivedBytes()

			if(total === 0){
				win.setProgressBar(1);
			}else{
				win.setProgressBar(received/total);
			}
		})

		// Set callback for when an file is finished downloading
		item.on("done", function(){

			let increment = 1;

			win.setProgressBar(increment);

			const id = setInterval(function(){

				increment = 0;
				win.setProgressBar(increment);

				if(increment < 0){
					clearInterval(id);
				}

			}, 400)
		})
	})
}

// Create callback to start the application.
app.whenReady().then(() => {

	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// Create call back to close application
app.on('window-all-closed', () => {
	app.quit()
})