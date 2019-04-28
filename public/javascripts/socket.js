(function(){

  var name;
  //Query DOM
  var windows = document.getElementById('chat-window'),
      output = document.getElementById('output-chat'),
      input = document.getElementById('chat-input'),
      send = document.getElementById('chat-send'),
      messages = document.getElementById('chat-messages'),
      label = document.getElementById('test-label')
      feedback = document.getElementById('feedback');

  $('#issueform').submit(function () {
    newIssue();
    //disable reload
    return false;
  });

  $('#searchform').submit(function () {
    issueSearch();
    return false;
  });

  $('#chat-form').submit(function () {
    if(input.value != ''){
      socket.emit('chat', {
        message: input.value,
        name: name,
        roomID: roomID
      })
    }
    //reset text
    input.value = '';

    return false;
  });


  window.onload = ()=>{
    //loadIssues();
  }

  $(document).ready(function(){
    url = document.URL;

    //getUsername();
    initRoom();
    loadIssues();

  });

  window.onunload = ()=>{
    console.log('leaving window')
    //socket.emit('unsubscribe',roomID);
    socket.close();
  }

  function initRoom(){
    send = {
      roomID    : roomID,
      sessionID : sessionID
    }
    //check if user has signed in already
    socket.emit('access-room', send, function(data){

      console.log('got call back :', send, data)
      //user signed in
      if(data != null){
        socket.emit('reconnect-user', data, function() {
          console.log('reconnected');
          name = data.username;
        })
      }
      //prompt for username
      else{
        getUsername();
      }
    })

  }

  function getUsername(){
    bootbox.prompt({
      title: "Enter a <b>username</b>",
      value: "",
      callback: function (result) {
          if (result === null || result === "") {
              getUserName();
          } else {
              name = result.trim();
              socket.emit('check-username', {
                roomID    : roomID,
                sessionID : sessionID,
                name      : name
              }, function(hit){

                if(hit){
                  bootbox.alert('Username already taken: ' + hit.username, function(){
                    getUsername();
                  });
                }
                else{
                  console.log('connecting SESH ', sessionID);
                  socket.emit('new-user',{
                    name      : name,
                    roomID    : roomID,
                    sessionID : sessionID
                  });    
                }
              });                           
          }
      }
    });
  }

  //listen for client join events
  socket.on('join', function(new_member){
    $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + new_member + " joined!" + '</li>');
  })

  socket.on('disconnect', function(removed_member){
    //$('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + removed_member + " disconnected!" + '</li>');
  })

  socket.on('chat', function(data){
    console.log('egeogegege');
    $('#chat-messages').append('<li class="list-group-item">' + data.name + ": " + data.message + '</li>');
    feedback.innerHTML = '';
  })

  socket.on('reload-issues',function(){
    loadIssues();
  })

  function newIssue(){
    var i_description  = document.getElementById('issueDescInput').value;
    var i_severity     = document.getElementById('IssueSeverityInput').value;
    var i_assignedTo   = document.getElementById('IssueAssignedToInput').value;
    var i_assignedBy   = name;
    var i_dueDate      = document.getElementById('datepicker').value;
    var i_issueDescription = document.getElementById('IssueDescriptionInput').value;
    var i_issueStatus = 'Open';
    
    var newIssue = {
      description     : i_description,
      severity        : i_severity,
      assignedTo      : i_assignedTo,
      assignedBy      : i_assignedBy,
      dueDate         : i_dueDate,
      issueStatus     : i_issueStatus,
      issueDescription: i_issueDescription,
      roomID          : roomID,
    }

    socket.emit('newIssue', newIssue, function(data){
    //$.post("/newIssue/",newIssue,function(data){

        //callback
        var i_issueID = data;
        newIssue.issueID = i_issueID
        
        loadIssues();

        document.getElementById('issueDescInput').value = '';
        document.getElementById('IssueAssignedToInput').value = '';
        document.getElementById('IssueDescriptionInput').value = '';
        document.getElementById('datepicker').value = '';
      });
  }

  function issueSearch(){
    var _searchType = document.getElementById('IssueSearchType').value;
    var _searchQuery = document.getElementById('issueSearch').value;

    var querypayload = {
      [_searchType] :_searchQuery,
      roomID        : roomID
    };

    socket.emit('searchIssues',querypayload, function(issues){
    //$.post("/search", query, function(data){

      loadsearchIssues(issues);

    });
    
  }

  socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data.name + ' is typing a message...</em></p>';
  });

  input.addEventListener('keypress',function(){
    socket.emit('typing', {
      name    : name,
      roomID  : roomID
    });
  })

})()

function loadIssues(){

// Querying open issues
// 
//   

  var queryOpenIssues = {
    roomID: roomID, 
    status: 'Open'
  };

  socket.emit('getIssues', queryOpenIssues, function(popenIssues){
    var issuesList = document.getElementById('issue-list');

    issuesList.innerHTML = '';

    if(popenIssues.length){
      for (var i = 0; i < popenIssues.length; i++) {
        var desc       = popenIssues[i].description;
        var severity   = popenIssues[i].severity;
        var assignedTo = popenIssues[i].assignedTo;
        var assignedBy = popenIssues[i].assignedBy;
        var status     = popenIssues[i].issueStatus;
        var issuedesc  = popenIssues[i].issueDescription;
        var issuesID   = popenIssues[i].uuid;
        var dueDate    = popenIssues[i].dueDate;
       
        $('#issue-list').append('<li class="list-group-item">' + '<div class="card bg-light mb-3">' +
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-open"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-calendar-day"></i>' + ' '+ dueDate + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-success">Close</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                            
                                '</div>' + '</li>');
      
      }
    }
    else{
      $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-primary mb-3">' +
                                '<div class="card-body">' + 
                                '<h5 class="card-title">' + 'No assigned issues' + '</h5>' +  
                                '</div>' +                                                       
                                '</div>' + '</li>');
    }
  });

// Querying closed issues
// 
// 
//   

  var queryClosedIssues = {
    roomID: roomID, 
    status: 'Closed'
  };

  socket.emit('getIssues', queryClosedIssues, function(pclosedIssues){
    var completeList = document.getElementById('complete-list');

    completeList.innerHTML = '';

    if(pclosedIssues.length){
      for (var i = 0; i < pclosedIssues.length; i++) {
        var desc       = pclosedIssues[i].description;
        var severity   = pclosedIssues[i].severity;
        var assignedTo = pclosedIssues[i].assignedTo;
        var assignedBy = pclosedIssues[i].assignedBy;
        var status     = pclosedIssues[i].issueStatus;
        var issuedesc  = pclosedIssues[i].issueDescription;
        var issuesID   = pclosedIssues[i].uuid;
        var dueDate    = pclosedIssues[i].dueDate;

        $('#complete-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' + 
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-closed"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-calendar-day"></i>' + ' '+ dueDate + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-primary">Reopen</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                             
                                '</div>' + '</li>');
        
      }
    }
    else{
      $('#complete-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' +
                                '<div class="card-body">' + 
                                '<h5 class="card-title">' + 'Completed jobs go here' + '</h5>' + 
                                '</div>' +                                                       
                                '</div>' + '</li>');
    }
  });
}

function loadsearchIssues(Issues){
  var issuesList = document.getElementById('issue-list');
  issuesList.innerHTML = '';


  if(Issues.length){
    for (var i = 0; i < Issues.length; i++) {
      var desc = Issues[i].description;
      var severity = Issues[i].severity;
      var assignedTo = Issues[i].assignedTo;
      var assignedBy = Issues[i].assignedBy;
      var status = Issues[i].issueStatus;
      var dueDate = Issues[i].dueDate;
      var issuedesc = Issues[i].issueDescription;
      var issuesID = Issues[i].uuid;

      if(status == 'Open'){
        $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + 
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-open"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-door-open"></i>' + ' '+ dueDate + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-success">Close</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                            
                                '</div>' + '</li>');
      }
      else{
        $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' + 
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-closed"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-primary">Reopen</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                             
                                '</div>' + '</li>');
      }
    }
  }
  else{
    $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' +
                                '<div class="card-body">' + 
                                '<h5 class="card-title">' + 'No issues found!' + '</h5>' + 
                                '</div>' +                                                       
                                '</div>' + '</li>');
  }
}

function flipStatus(pID,pstatus){
  var update_query = {
    uuid: pID,
    status: pstatus,
    roomID: roomID
  };

  socket.emit('updateStatus',update_query, function(){
  //$.post("/updatestatus", update_query, function(data){
    loadIssues();
  });
}

function deleteIssue(ID){
  var delete_query = {
    uuid: ID,
    roomID: roomID
  };

  socket.emit('deleteIssue',delete_query,function(){
  //$.post("/deleteissue", delete_query, function(data){
    loadIssues();
  });
}

function checkSearch(){

  if(document.getElementById('issueSearch').value == ''){
    loadIssues();
  }
}