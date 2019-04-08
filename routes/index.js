var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');
var assert = require('assert')
const mongo = require('mongodb').MongoClient
const mongourl = 'mongodb://localhost:27017/Colabor8'

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/Issues',function(req,res,next){

  var issues;
  mongo.connect(mongourl, function(err, client){
    assert.equal(null,err);
    //db created
    var db = client.db('Colabor8');
    db.collection("Issues").find({}).toArray(function(err,result){
      assert.equal(null,err);
      console.log('all items, ',result);
      issues = result;
      client.close();

      //synchronous send
      res.send(issues);
    });
  });
});

router.post('/newissue',function(request,response){
  //newissue is stored in body store this in mongo 
  var id = uuidv1();
  var newIssue = {
    description : request.body.description,
    severity : request.body.severity,
    assignedTo : request.body.assignedTo,
    assignedBy : request.body.assignedBy,
    issueStatus : request.body.issueStatus,
    issueDescription: request.body.issueDescription,
    uuid: id
  };

  //send back to client
  mongo.connect(mongourl, function(err, client){
    assert.equal(null,err);
    //db created
    var db = client.db('Colabor8');
    db.collection("Issues").insertOne(newIssue, function(err,result){
      assert.equal(null,err);
      console.log('item inserted, ',newIssue);
      client.close();
    });
  });
  
  //can send this back asynchronously, dont need to wait for mongo to insert
  response.send(id);
});
module.exports = router;
