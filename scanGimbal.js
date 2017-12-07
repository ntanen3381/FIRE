var noble = require('noble');
var uuid = 'ab6baf91449e489d9200f2e67e3d2df0';
var url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi3/5.00/4.00/';
var exec = require('child_process').exec;
var http = require('http');
var sleep = require('sleep');
var distances = [];

noble.state = "poweredOn";
noble.on('stateChange', function(state){
        console.log('state:' + state);
        noble.startScanning([], true);
});

noble.startScanning([], true);

noble.on('discover', function(peripheral){
		var dataPacket = "" + peripheral.advertisement.manufacturerData;
		if (dataPacket != "undefined")
		{
			var packet = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')).substr(9, 32);
      			if(uuid == packet) 
      			{
         			var macAddress = peripheral.uuid;
  	 			var rssi = peripheral.rssi;
				var distance = calculateDistance(rssi);
	 			distances.push(distance);
	 			console.log('Device: ', macAddress, ' Distance: ', distance, ' ', uuid, ' ', rssi);
				exec('date "+%S"', function(error, stdout) {
					if (stdout % 10 == 0)
					{
						var average = 0.0;
						for (var i = 0; i < distances.length; i++)
						{
							average = average + distances[i];
						}
						average = average / distances.length;
						average = average * 3.28; 
	 					sendToServer(average, macAddress);
					}
				});
      			}
		}
});

function calculateDistance(rssi) {
  
  var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
var exec = require('child_process').exec;
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
   url += distance.toFixed(2) + '/location_form_single/';
   exec('x-www-browser ' + url, function(err, stdout) {
   });
   distances = [];
   sleep.sleep(5);
   url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi3/5.00/4.00/';
}
