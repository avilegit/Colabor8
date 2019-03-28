//(function($){
console.log('test');

//Query DOM
var window = document.getElementById('chat-window'),
    messages = document.getElementById('chat-messages'),
    input = document.getElementById('chat-input'),
    send = document.getElementById('chat-send'),
    label = document.getElementById('test-label');


var socket = io.connect('http://localhost:3000')

socket.on('connect', function(data){

  socket.emit('join','Hello World from client');
  console.log('client joining');

});
//if (document.readyState === "complete") {
//  console.log('done');

send.addEventListener('click',function(){
  console.log('push');
  socket.emit('chat', {
    message: input.value
  })
  console.log('push 2');

  label.innerHTML = input.value;
});
//}

//listen for chat events

socket.on('chat', function(data){

  console.log('caught callback from server');
  printToChat(data.message);
})

function printToChat(text){

  $('#chat-messages').append('<li class="list-group-item">' + text + '</li>');

}
//});