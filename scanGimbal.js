var noble = require('noble');
var addressToTrack = '3ba17c55c919';
var url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi1/7.00/1.00/';
noble.state = "poweredOn";
noble.on('stateChange', function(state){
        console.log('state:' + state);
        noble.startScanning([], true);
});

noble.startScanning([], true);
 
noble.on('discover', function(peripheral){
   if(peripheral.uuid == addressToTrack){
         var macAddress = peripheral.uuid;
	 var uuid = peripheral.advertisement.manufacturerData;
  	 var rssi = peripheral.rssi;
	 var distance = calculateDistance(rssi);
	 console.log('Device: ', macAddress, ' Distance: ', distance, ' ', uuid, ' ', rssi);
	 sendToServer(distance, macAddress);
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
   var http = require('http');
   var exec = require('child_process').exec;
   var sleep = require('sleep');
   url += distance.toFixed(2) + '/location_form_single/';
   exec('x-www-browser ' + url, function(err, stdout) {
	sleep.sleep(10);
   });
   sleep.sleep(10);
   url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi1/7.00/1.00/';
}
