var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var irobot = require('./index');
var robot = new irobot.Robot('/dev/ttyUSB0');

//pageName is the same as fileName but with .html instead of .js
pageName = process.argv[1];
var n = pageName.lastIndexOf('/');
var pageName = pageName.substring(n + 1);
pageName = pageName.replace(".js", ".html");

//if port not given use this as default
var port = (process.argv[2] ? Number(process.argv[2]) : 2025);
app.listen(port);
console.log("listening on port ", port);

function handler(req, res) {
    fs.readFile(__dirname + '/' + pageName, processFile);

    function processFile(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + pageName);
        }
        res.writeHead(200);
        res.end(data);
    }
}

robot.on('ready', function() {
    console.log("Robot ready!.");
});

io.on('connection', onConnect);

function onConnect(socket) {
    console.log('connected');
    robot.sensorCount = 0;
    socket.on('drive', function(data) {
        console.log(data);
        robot.drive(data);
    });
    socket.on('sing', function(data) {
        console.log(data);
        robot.sing(data);
    });

    socket.on('safeMode', function(data) {
        robot.safeMode();
    });

    socket.on('fullMode', function(data) {
        robot.fullMode();
    });
}
robot.on('sensordata', function(data) {
    //console.log('SENSOR DATA', data);
    if(!robot.sensorCount) robot.sensorCount = 0;
    robot.sensorCount ++;
    if (robot.sensorCount*1 % 10==0)
    {
    io.sockets.emit('sensordata', data);
}
});
robot.on('bump', function(data) {
    console.log('BUMP', data);
    io.sockets.emit('bump', data);
});
