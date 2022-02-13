//==========================================================================
// The following modules are required by nodejs
var mqtt = require('mqtt');
var http = require('http');
var https = require('https');
const serialport = require("serialport");
const Readline = require('@serialport/parser-readline')
const bodyParser = require('body-parser');
const express = require("express");
var app = express();
const fs = require('fs');
var logData, i = 0;


//==========================================================================



//==========================================================================
// MQTT clinet options
var optionsMosquitto = {
  host: 'mygardenauto.duckdns.org',
  port: 8883,
  protocol: 'mqtts',
  rejectUnauthorized: false
}

//initialize the MQTT client
var client = mqtt.connect(optionsMosquitto);

//setup the MQTT callbacks
client.on('connect', function() {
  console.log('Connected to MQTT server');
});

client.on('error', function(error) {
  console.log(error);
});

client.on('message', function(topic, message) {
  //Called each time a message is received
  console.log('Received message:', topic, message.toString());
});

// subscribe to topic room/temperature and room/humidity);
client.subscribe('room/temperature');
client.subscribe('room/humidity');

// publish message 'Hi here is nodejs' to topic 'room/temperature'
//client.publish('room/temperature', 'Hi here is nodejs');

//==========================================================================



//==========================================================================
// app use
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//==========================================================================



// Serial port is configured
//==========================================================================
var port = new serialport('/dev/ttyACM0', {
  baudRate: 57600,
});
const parser = port.pipe(new Readline({
  delimiter: '\r\n'
}));
//==========================================================================



//==========================================================================
// Get the current date function
function getDate() {

  let ts = Date.now();
  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let hour = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  return [year, month, date, hour, minutes, seconds];
}
//==========================================================================


//==========================================================================
// Disk data from the local file jsonData.json is used to configure the arduino at application startup
fs.readFile('./jsonData.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`);
  } else {

    console.log("Disk data: " + data);
    port.write(data);
  }
});

fs.readFile('./datalog.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`);
  } else {

    logData = data;
    //console.log("Disk logData: " + logData);
    logData = JSON.parse(logData);


  }
});
//==========================================================================


//==========================================================================
//logs the measured data
function saveData(data) {

  //console.log("I am doing my 5 minutes log");
  var [year, month, date, hour, minutes, seconds] = getDate();
  logDataParse = logData;
  logDataParse.time.push(year + "-" + month + "-" + date + " " + hour + ":" + minutes);
  data = JSON.parse(data);
  logDataParse.vBat.push(data.AN0);


  //temperature is calculated based on the AN1 value (Steinhart–Hart equation)
  let A = 0.000871812,
    B = 0.000257595,
    C = 0.000000142252;
  let R1 = 4300,
    R2 = 0,
    temp = 0,
    v = 0,
    logR2 = 0;
  v = 5 / 1024 * data.AN1;
  R2 = R1 / (5 / v - 1);
  logR2 = Math.log(R2);
  temp = 1 / (A + B * logR2 + C * Math.pow(logR2, 3));
  temp = temp - 273.15;
  temp = temp.toFixed(2);
  logDataParse.temp.push(temp);


  //console.log(JSON.stringify(logData));
  i = i + 1;
  //console.log(i);

  if (i == 96) {
    fs.writeFile('datalog.json', JSON.stringify(logData), function(err) {
      if (err) {
        throw err;
      }
    });

    i = 0;

  }
}
//==========================================================================


//==========================================================================
// Runs a function at an interval of 5 min

var minutes = 5,
  the_interval = minutes * 60 * 1000;
setInterval(function() {

  port.write("statusCheck");
  parser.once("data", saveData);

}, the_interval);
//==========================================================================



// GET requests
//==========================================================================
// The index.html is sent to the clinet
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});


// Get test arduino
app.get("/arduino", function(req, res) {
  res.send("Hello, this is the server");
});


// This get function configure the html "view" when the page is reloaded, it configurea the html/css based on the data that are read from arduino.
app.get("/initAtReset", function(req, res) {

  port.write("statusCheck");
  parser.once("data", function(data) {
    res.json(data);
    console.log("Data sent to clinet: " + data)
  })

});

app.get("/chart", function(req, res) {


  var timeDataPoints = [];
  var vBatDataPoints = [];
  var tempDataPoints = [];

  for (var i = 0; i < logData.time.length; i++) {
    timeDataPoints.push(logData.time[i]);
    vBatDataPoints.push(logData.vBat[i]);
    tempDataPoints.push(logData.temp[i]);
  };


  var data = {
    time: timeDataPoints,
    vBat: vBatDataPoints,
    temp: tempDataPoints
  };


  res.json(JSON.stringify(data));

});

//==========================================================================


// POST requests
//==========================================================================
// This post function received the data from index.js send them to arduino, reads them back and save them to a local file jsonData.json.
app.post("/app", function(req, res) {

  port.write(JSON.stringify(req.body));
  parser.once('data', function(data) {
    console.log("Data sent to arduino: " + data);
    res.json(data);

    fs.writeFile('jsonData.json', JSON.stringify(req.body), function(err) {
      if (err) {
        throw err;
      }
    });
  });
});
//==========================================================================



// The paths to certs are define and the http and https server is started
//==========================================================================
var privateKey = fs.readFileSync(__dirname + '/certs/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/server.crt', 'utf8');
var credentials = {
  key: privateKey,
  cert: certificate
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3080);
httpsServer.listen(3443);
//==========================================================================
