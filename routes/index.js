var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('lobby',{
    title: 'Colabor8',
    sessionID : req.sessionID
  });
});

router.get('/rooms/:id',function(req, res){

  console.log('new')
  res.render('room', {
    title: 'Colabor8',
    roomID: req.params.id,
    sessionID : req.sessionID
  });
});

module.exports = router;
