//Noble is used for scanning Bluetooth Low Energy Devices and receiving data for the signal
var noble = require('noble');
//This is the UUID of one Gimbal to match devices found from scanning, pull a database of multiple Gimbals when you get to that point
var uuid = 'ab6baf91449e489d9200f2e67e3d2df0';
//Standard url to hit to update distance of a Gimbal, change pi3 to name of the Raspberry Pi, 5.00 and 4.00 represent x and y coordinates
//on a plane in feet
var url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi3/5.00/4.00/';
var exec = require('child_process').exec;
var http = require('http');
var sleep = require('sleep');
var distances = [];

//Powers on noble
noble.state = "poweredOn";
noble.on('stateChange', function(state){
        console.log('state:' + state);
        noble.startScanning([], true);
});

//Starts the scanner, infinte loop, wont stop
noble.startScanning([], true);

//Function to discover the gimbal, work on it to use a database
noble.on('discover', function(peripheral){
		//Gets the data packet of the device, uuid is hidden inside it (can't check mac address because it changes constantly)
		var dataPacket = "" + peripheral.advertisement.manufacturerData;
		if (dataPacket != "undefined")
		{
			//Parses out the uuid and checks it to the one stored in the database, once its written
			var packet = JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')).substr(9, 32);
      			if(uuid == packet) 
      			{
         			var macAddress = peripheral.uuid;
  	 			var rssi = peripheral.rssi;
				//Calculates the distance found for the Gimbal
				var distance = calculateDistance(rssi);
	 			distances.push(distance);
	 			console.log('Device: ', macAddress, ' Distance: ', distance, ' ', uuid, ' ', rssi);
				//Checks the internal clock for ten seconds on the clock
				exec('date "+%S"', function(error, stdout) {
					if (stdout % 10 == 0)
					{
						var average = 0.0;
						//Averages out the distances collected and sends them to the server
						for (var i = 0; i < distances.length; i++)
						{
							average = average + distances[i];
						}
						average = average / distances.length;
						//Converts from meters to feet
						average = average * 3.28; 
						//Sends the distance to the server
	 					sendToServer(average, macAddress);
					}
				});
      			}
		}
});

//Calculates the distance of the rssi value found, these distances are an estimate but not completely accurate
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

//Sends the final distance of a Gimbal to the server
function sendToServer(distance, macAddress) {
   url += distance.toFixed(2) + '/location_form_single/';
   exec('x-www-browser ' + url, function(err, stdout) {
   });
   distances = [];
   sleep.sleep(5);
   //Resets the url and distances array
   url = 'http://django-env.nfjak4vxpm.us-west-2.elasticbeanstalk.com/indoor_mapping/location_form/pi3/5.00/4.00/';
}
