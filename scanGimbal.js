var noble = require('noble');
var addressToTrack = '1fd5cbe68f13';
var socket = require('socket.io-client')('http://django-env.mfuhrkczbq.us-east-1.elasticbeanstalk.com', {reconnect: true});

socket.on('connect', function () {
       console.log('Connection established');
});

noble.state = "poweredOn";
noble.on('stateChange', function(state){
        console.log('state:' + state);
        noble.startScanning([], true);
});
noble.startScanning([], true);
 
noble.on('discover', function(peripheral){
    // if(peripheral.uuid == addressToTrack){
         var macAddress = peripheral.uuid;
  	 var rssi = peripheral.rssi;
 	 var localName = peripheral.advertisement.manufacturerData 
	 var distance = calculateDistance(rssi);
	 console.log('Device: ', macAddress, ' Distance: ', distance, ' ', localName, ' ', rssi);
	 sendToServer(distance, macAddress);
    // }
});

function calculateDistance(rssi) {
  
  var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
} 


function sendToServer(distance, macAddress) {
   socket.emit('deviceData', {pi: 11245, GimbalId: macAddress, Distance: distance});
   var sleep = require('sleep');
   sleep.sleep(10);
}
