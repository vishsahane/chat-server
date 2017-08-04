// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var router = express.Router(); 
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

app.get('/abc', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' }); 

  var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/abc');

  var Cat = mongoose.model('Cat', { name: String });

  var kitty = new Cat({ name: 'Zildjian' });
  kitty.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('meow');
    }
  });



});

// Chatroom

var numUsers = 0;
console.log("server started>>>>>>>>>>>>>>>>>>>");
io.on('connection', function (socket) {
  var addedUser = false;
  console.log("connection event called>>>>>>>>>>>>>>>>>>>");
  // when the client emits 'new message', this listens and executes
  socket.on('new-message', function (data) {
    // we tell the client to execute 'new message'
    console.log("new-message event called>>>>>>>>>>>>>>>>>>>",data);
    socket.broadcast.emit('new-message', data);
  });

  socket.on('user-added', function (data) {
    console.log("user-added event called>>>>>>>>>>>>>>>>>>>",data);
    socket.broadcast.emit('user-added', data);
  });

  socket.on('user-left', function (data) {
    console.log("user-left event called>>>>>>>>>>>>>>>>>>>",data);
    socket.broadcast.emit('user-left', data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});