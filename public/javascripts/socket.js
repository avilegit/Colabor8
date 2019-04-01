(function(){


  var person = prompt("Enter your name", "");
  if (person == null || person == "") {
    name = "Anon";
  } else {
    name= person;
  }
})();

//Query DOM
var window = document.getElementById('chat-window'),
    output = document.getElementById('output-chat'),
    input = document.getElementById('chat-input'),
    send = document.getElementById('chat-send'),
    messages = document.getElementById('chat-messages'),
    label = document.getElementById('test-label')
    feedback = document.getElementById('feedback');

var socket = io.connect('http://localhost:3000')

socket.on('connect', function(){

  socket.emit('join',name);
  console.log('client joining', name);

});
input.addEventListener('keypress',function(){
  socket.emit('typing', name);
})

send.addEventListener('click',function(){
  if(input.value != ''){
    socket.emit('chat', {
      message: input.value,
      name: name
    })
  }
});


//listen for client join events
socket.on('join', function(new_member){
  console.log('got client name',new_member);
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + new_member + " joined!" + '</li>');
  //$('#room-members').append('<li><a>' + new_member + '</a></li>');
  //document.getElementById('room-members').innerHTML += '<li><a' + new_member + '</a></li>';
})

socket.on('disconnect', function(removed_member){
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + removed_member + " disconnected!" + '</li>');
  //$('#room-members').append('<li><a>' + new_member + '</a></li>');
  //document.getElementById('room-members').innerHTML += '<li><a' + new_member + '</a></li>';
})




socket.on('chat', function(data){

  console.log('caught callback from server');
  $('#chat-messages').append('<li class="list-group-item active">' + data.name + ": " + data.message + '</li>');
  feedback.innerHTML = '';

  //reset text
  input.value = '';
})

socket.on('typing', function(data){
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});
