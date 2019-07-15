var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs-extra');

var model = require('../model/DAO');

router.route('/')
.get(function(req, res, next) {
  console.log('프로필 get 호출됨');
  var id = req.query.id;
  if(req.cookies.id) {
    model.showprofile(id,
      function(err, result_user, result_post, result_board) {
        if(err) {
          res.render('error', {err: err});
        }
        if(result_user && result_post) {
          model.showusers(req.cookies.id, 
            function(err, user) {
              if(err) {
                res.render('err', {err: err});
              } else {
                res.render('profile', {user: result_user[0], post: result_post, board: result_board, id: req.cookies.id});
              }
            }
          )
        } else {
          res.render('error', {err: '프로필 불러오기 실패'});
        }
      }
    );
  } else {
    console.log('로그인이 안되어있음');
    res.redirect('/users/login');
  }
})
.post(function(req, res, next) {
  console.log('프로필 post 호출됨');

  var student_id = req.body.student_id;
  var profession = req.body.profession;
  var email = req.body.email;
  var id = req.cookies.id;
  var name = "";
  var filePath = "";
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    name = fields.name;
  });
  
  form.on('end', function(fields, files) {
    console.log('ㅎㅇㄹ');
    for (var i = 0; i < this.openedFiles.length; i++) {
      var temp_path = this.openedFiles[i].path;
      var file_name = this.openedFiles[i].name;
      var index = file_name.indexOf('/'); 
      var new_file_name = file_name.substring(index + 1);
      var new_location = 'public/resources/images/'+name+'/';
      var db_new_location = 'resources/images/'+name+'/';
      filePath = db_new_location + file_name;
      fs.copy(temp_path,new_location + file_name, function(err) { 
        if (err) {
          console.error(err);
        }
      });
      model.addimg(name, filePath);
    }
  });

  if(student_id && profession && email) {
    model.addinfo(id, student_id, profession, email, 
      function(err, result, docs) {
        if(err) {
          res.render('error', {err: err});
        }
        if(result) {
          res.redirect('/users?id=' + req.cookies.id);
        } else {
          res.render('error', {err: '회원가입 실패'});
        }
      }
    )
  }
});

router.route('/register')
.get(function(req, res, next) {
  model.showusers(null,
    function(err, result) {
      if(err) {
        res.render('error', {'err': err});
      }
      if(result) {        
        res.render('register', {users: result});
      } else {
        res.render('register');
      }
    }
  );
})
.post(function(req, res, next) {
  console.log('register post 방식으로 호출됨');

  var id = req.body.id;
  var pw = req.body.pw;
  var repw = req.body.repw;
  var name = req.body.name;

  if(id && pw && repw && name) {
    if(pw && repw) {
      model.addUser(id, pw, name, 
        function(err, result) {
          if(err) {
            res.render('error', {err: err});
          }
          if(result) {
            res.redirect('/users/login');
          } else {
            res.render('error', {err: '회원가입 실패'});
          }
        }
      );
    }
  }
});

router.route('/login')
.get(function(req, res, next) {
  res.render('login');
})
.post(function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;

  if(id && pw) {
    model.authUser(id, pw, 
      function(err, result) {
        if(err) {
          res.render('error', {'err': err});
        }
        if(result) {
          res.cookie('id' , id);
          res.redirect('../');
        } else {
          res.redirect('register');
        }
      }
    );
  }
});

router.route('/logout')
.get(function(req, res, next) {
  res.clearCookie('id');
  res.redirect('/');
});

module.exports = router;
