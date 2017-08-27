const fs = require("fs");
const exec = require('child_process').exec;

var filePath = "";
var countdownSeconds = 0;
var intervalId = "";
var countdownIsRunning = false;
var recorderPath = "";


fs.readFile("default.conf.xml", "utf-8", function(err, data){
  if(err){
    return console.log(err);
  }
  var parser = new DOMParser();
  xmlDoc = parser.parseFromString(data, "text/xml");

  document.getElementById("acq-time").value = xmlDoc.getElementsByTagName("acq-time")[0].childNodes[0].nodeValue;
  document.getElementById("sample-rate").selectedIndex = xmlDoc.getElementsByTagName("sample-rate")[0].childNodes[0].nodeValue;
  document.getElementById("sr-time-series").selectedIndex = xmlDoc.getElementsByTagName("sr-time-series")[0].childNodes[0].nodeValue;
  document.getElementById("num-chan").selectedIndex = xmlDoc.getElementsByTagName("num-chan")[0].childNodes[0].nodeValue;
  document.getElementById("frequency").value = xmlDoc.getElementsByTagName("frequency")[0].childNodes[0].nodeValue;
  document.getElementById("rf-gain").value = xmlDoc.getElementsByTagName("rf-gain")[0].childNodes[0].nodeValue;
  document.getElementById("if-gain").value = xmlDoc.getElementsByTagName("if-gain")[0].childNodes[0].nodeValue;
  document.getElementById("bb-gain").value = xmlDoc.getElementsByTagName("bb-gain")[0].childNodes[0].nodeValue;
  document.getElementById("dig-gain").value = xmlDoc.getElementsByTagName("dig-gain")[0].childNodes[0].nodeValue;
  document.getElementById("filename").value = xmlDoc.getElementsByTagName("filename")[0].childNodes[0].nodeValue;
  document.getElementById("start-now").checked = (xmlDoc.getElementsByTagName("start-now")[0].childNodes[0].nodeValue == "true")? true : false;
  document.getElementById("start-time").value = new Date().toLocaleString();

  recorderPath = xmlDoc.getElementsByTagName("recorder-path")[0].childNodes[0].nodeValue;
  if(recorderPath == "/"){
    alert("please set the path to the recorder in default.conf.xml inside the recorder-path tag");
  }
});

function openFolderSelector(){
  document.getElementById("dir-selector").click();
}

function closedFolderSelector(){
  try{
    filePath = document.getElementById("dir-selector").files[0].path;
    filePath += "/filename.bin";
    document.getElementById("filename").value = filePath;
    document.getElementById("filename").focus();
    document.getElementById("filename").setSelectionRange(filePath.length, filePath.length);
  }catch(e){
    //console.log(e);
  }

}

function controlData(){
  if(document.getElementById("filename").value == ""){
    alert("missing filename!");
    return false;
  }
  var fftSize = document.getElementById("sample-rate").value / document.getElementById("sr-time-series").value;
  if(Math.floor(fftSize) !== fftSize){
    alert("fft size is not integer!");
    return false;
  }
  var decimation = fftSize / document.getElementById("num-chan").value;
  if(Math.floor(decimation) !== decimation){
    alert("frequency decimation is not integer!");
    return false;
  }
  return true;
}

function start(){
  if(countdownIsRunning){
    clearInterval(intervalId);
    document.getElementsByClassName("start-button")[0].value = "start";
    countdownIsRunning = false;
  }else{
    if(!controlData()){
      return false;
    }

    if(document.getElementById("start-now").checked){
      var fftSize = document.getElementById("sample-rate").value / document.getElementById("sr-time-series").value;
      var decimation = fftSize / document.getElementById("num-chan").value
      var command = '--working-directory="'+ recorderPath + '" -x bash -c "sudo python2 PulsChan.py ' +
        document.getElementById("acq-time").value + " " +
        document.getElementById("sample-rate").value + " " +
        document.getElementById("frequency").value + " " +
        document.getElementById("rf-gain").value + " " +
        document.getElementById("if-gain").value + " " +
        document.getElementById("bb-gain").value + " " + fftSize + " " + decimation + " " +
        document.getElementById("dig-gain").value + " " +
        document.getElementById("filename").value + '"';
      exec('gnome-terminal ' + command + '"', function(error, stdout, stderr){
        console.log(stdout);
        if(stderr)  alert("ERROR: " + stderr);
      });
    }
    else{
      countdownSeconds = parseInt((Date.parse(document.getElementById("start-time").value) - Date.parse(new Date().toLocaleString()))/1000);
      console.log(countdownSeconds);
      if(countdownSeconds >= 0){
        intervalId = setInterval(countdown, 1000);
        document.getElementsByClassName("start-button")[0].value = "stop";
        countdownIsRunning = true;
      }else{
        alert("wrong start time!");
      }
    }
  }

}

function countdown(){
  if(countdownSeconds == 0){
    clearInterval(intervalId);
    document.getElementsByClassName("start-button")[0].value = "start";
    countdownIsRunning = false;
    if(controlData()){
      var fftSize = document.getElementById("sample-rate").value / document.getElementById("sr-time-series").value;
      var decimation = fftSize / document.getElementById("num-chan").value
      var command = "cd " + recorderPath + " && sudo python2 PulsChan.py " +
        document.getElementById("acq-time").value + " " +
        document.getElementById("sample-rate").value + " " +
        document.getElementById("frequency").value + " " +
        document.getElementById("rf-gain").value + " " +
        document.getElementById("if-gain").value + " " +
        document.getElementById("bb-gain").value + " " + fftSize + " " + decimation + " " +
        document.getElementById("dig-gain").value + " " +
        document.getElementById("filename").value;
      exec('gnome-terminal -x sh -e "' + command + '"', function(error, stdout, stderr){
        console.log(stdout);
        if(stderr)  alert("ERROR: " + stderr);
      });
    }
  }
  if(!controlData()){
    clearInterval(intervalId);
    document.getElementsByClassName("start-button")[0].value = "start";
    countdownIsRunning = false;
  }
  console.log(countdownSeconds);
  var hours = Math.floor(countdownSeconds / 3600);
  var minutes = Math.floor((countdownSeconds - (hours*3600))/60);
  var seconds = Math.floor((countdownSeconds -(hours*3600) -(minutes*60)));
  document.getElementById("countdown").innerHTML = hours + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  countdownSeconds--;
}
