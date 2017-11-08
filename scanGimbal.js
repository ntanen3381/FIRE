var noble = require('noble');
var addressToTrack = '1fd5cbe68f13';
var server = require('http').createServer();
var socket = require('socket.io')(http://localhost/scanner);

socket.on('connect', function(){  
  console.log('connected to server');
});

noble.state = "poweredOn";
noble.on('stateChange', function(state){
        console.log('state:' + state);
        noble.startScanning([], true);
});
noble.on('scanStart', function(){
        console.log('scanStart');
        console.log(arguments);
});
 
noble.on('discover', function(peripheral){
     if(peripheral.uuid == addressToTrack){
         var macAddress = peripheral.uuid;
  	 var rss = peripheral.rssi;
 	 var localName = peripheral.localName; 
         console.log('found device: ', macAddress, ' ', localName, ' ', rss);
	 var distance = calculateDistance(rss);
	 console.log('Device: ', macAddress, ' Distance: ', distance);
	 sendToServer(distance, macAddress);	 
	 var sleep = require('sleep');
    	 sleep.sleep(10);
     }
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

   noble.on('discover', function(peripheral){
       socket.emit('deviceData', {pi: 11245, GimbalId: macAddress, Distance: distance});    
   });

   noble.startScanning([], true) //allows dubplicates while scanning

}
