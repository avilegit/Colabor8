var io = require('socket.io-client')
  , io_server = require('socket.io').listen(3001);

assert = require('assert');

describe('basic socket.io example', function() {

  var socket;

  beforeEach(function(done) {
    // Setup
    socket = io.connect('http://localhost:3001', {
  

    });

    socket.on('connect', () => {
      done();
    });

    socket.on('disconnect', () => {
      // console.log('disconnected...');
    });
  });

  afterEach((done) => {
    // Cleanup
    if(socket.connected) {
      socket.disconnect();
    }
    io_server.close();
    done();
  });

  it('should communicate', (done) => {
    // once connected, emit Hello World
    io_server.emit('echo', 'Hello World');

    socket.once('echo', (message) => {
      // Check that the message matches
      assert(message === "Hello World");
      done();
    });

    io_server.on('connection', (socket) => {
      assert(socket != null);
    });
  });

});