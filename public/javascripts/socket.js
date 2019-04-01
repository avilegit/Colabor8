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

window.onload = ()=>{
  loadIssues();
}

var socket = io.connect('http://localhost:3000')

socket.on('connect', function(){
  socket.emit('join',name);
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
  $('#chat-messages').append('<li class="list-group-item active">' + data.name + ": " + data.message + '</li>');
  feedback.innerHTML = '';
  //reset text
  input.value = '';
})

function newIssue(){

  var i_description = document.getElementById('issueDescInput').value;
  var i_severity = document.getElementById('IssueSeverityInput').value;
  var i_assignedTo = document.getElementById('IssueAssignedToInput').value;
  var i_issueStatus = 'Open';

  var newIssue = {
    description : i_description,
    severity : i_severity,
    assignedTo : i_assignedTo,
    issueStatus : i_issueStatus
  }

  //this can be ported to mongodb for later
  if (localStorage.getItem('issues') == null) {
    var issues = [];
    issues.push(newIssue);
    localStorage.setItem('issues', JSON.stringify(issues));
  } else {
    var issues = JSON.parse(localStorage.getItem('issues'));
    issues.push(newIssue);
    localStorage.setItem('issues', JSON.stringify(issues));
  }

}

function loadIssues(){
  console.log('loading issues');
  var issues = JSON.parse(localStorage.getItem('issues'));
  var issuesList = document.getElementById('issues-list');

  issuesList.innerHTML = '';

  //alert(issues.length.toString())
  if(issues){
    for (var i = 0; i < issues.length; i++) {
      var id = issues[i].id;
      var desc = issues[i].description;
      var severity = issues[i].severity;
      var assignedTo = issues[i].assignedTo;
      var status = issues[i].status;

      issuesList.innerHTML +=   '<div class="well">'+
                                //'<h6>Issue ID: ' + id + '</h6>'+
                                '<p><span class="label label-info">' + status + '</span></p>'+
                                '<h3>' + desc + '</h3>'+
                                '<p><span class="glyphicon glyphicon-time"></span> ' + severity + '</p>'+
                                '<p><span class="glyphicon glyphicon-user"></span> ' + assignedTo + '</p>'+
                                '<a href="#" onclick="setStatusClosed(\''+id+'\')" class="btn btn-warning">Close</a> '+
                                '<a href="#" onclick="deleteIssue(\''+id+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>';
    }
  }

}

socket.on('typing', function(data){
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
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
