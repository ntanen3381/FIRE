var noble = require('noble');
var addressToTrack = '0a19dd286279';
var io = require('socket.io')(http); 
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
	 var sleep = require('sleep');
    	 sleep.sleep(5)
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



   var socket = io('http://localhost/client');
   var linearScale = d3.scale.linear()
        .domain([0, 20])
        .range([20, 1000]);   
        
    socket.on('connected', function(msg) {
        console.log('connected to server');

    });   

    socket.on('message', function(msg) {
                
        var yVal = filter(linearScale(msg.accuracy));

        TweenLite.to(user, 2, {
            y: yVal,
            ease: 'easeOutExpo'
        });

    });
    

