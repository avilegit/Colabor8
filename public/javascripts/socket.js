console.log('test');

//Query DOM
var window = document.getElementById('chat-window'),
    output = document.getElementById('output-chat'),
    input = document.getElementById('chat-input'),
    send = document.getElementById('chat-send'),
    messages = document.getElementById('chat-messages')
    label = document.getElementById('test-label');


var socket = io.connect('http://localhost:3000')

socket.on('connect', function(data){

  socket.emit('join','Hello World from client');
  console.log('client joining');

});

send.addEventListener('click',function(){
  if(input.value != ''){
    socket.emit('chat', {
      message: input.value
    })
  }
});


//listen for chat events

socket.on('chat', function(data){

  console.log('caught callback from server');
  $('#chat-messages').append('<li class="list-group-item active">' + data.message + '</li>');
  input.value = '';
})
