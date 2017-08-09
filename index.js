var app = require('electron').app
var BrowserWindow = require('electron').BrowserWindow;

app.on("ready", function(){
  var mainWindow = new BrowserWindow({
    width:500,
    height:700
  });
  mainWindow.loadURL("file://" + __dirname + "/index.html");
})
