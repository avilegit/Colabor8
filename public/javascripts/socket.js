(function($){
  console.log('test');

  var window = document.getElementById('chat-window');
  var messages = document.getElementById('chat-messages');
  var input = document.getElementById('chat-input');
  var send = document.getElementById('chat-send');
  var label = document.getElementById('test-label');


  var socket = io.connect('http://localhost:3000')

  socket.on('connect', function(data){

    socket.emit('join','Hello World from client');
    console.log('client joining');

  });

  send.addEventListener('click',function(){
    console.log('push');
    socket.emit('chat', {
      message: input.value
    })

    label.innerHTML = input.value;


  });

  //listen for chat events

  socket.on('chat', function(data){

    console.log('caught callback from server');
    printToChat(data.message);
  })

  function printToChat(text){

    $('#chat-messages').append('<li class="list-group-item">' + text + '</li>');

  }
})