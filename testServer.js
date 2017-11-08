var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
io.on('connection', function(client){
  client.on('event', function(data){});
  client.on('disconnect', function(){});
  console.log('connected to server');
});
server.listen(3001);

io.on('connect', function(){  
  console.log('connected to server');
});

var scanner = io.of('/scanner'); 

scanner.on('connection', function(socket) {

    console.log('Scanner Connected');
    
    io.on('message', function(msg) {
	console.log('pi: ' + msg.pi + ' Gimbal id: ' + msg.GimbalId
			 + ' Distance: ' + msg.distance);
    });

    io.on('disconnect', function() {
        console.log('Scanner Disconnected');
    });
});

//http.listen(3000, function() {
  //  console.log('listening on *:3000');
//});
