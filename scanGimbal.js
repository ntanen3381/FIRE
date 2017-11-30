var noble = require('noble');
var addressToTrack = 'acbc32977a7c';
var url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/loction_form/beacon1/5/6/';

//socket.on('connect', function () {
  //     console.log('Connection established');
//});

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
//   socket.emit('deviceData', {pi: 11245, GimbalId: macAddress, Distance: distance});
   url += Math.round(distance) + '/beacon2/5/4/' + Math.round(distance) + '/beacon3/4/5/' + Math.round(distance) + '/location_form_no_interface';
   var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  //Return the url part of the request object:
  res.write(url);
  res.end();
}).listen(8080);

   var sleep = require('sleep');
   sleep.sleep(10);
}
