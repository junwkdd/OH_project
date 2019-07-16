var express = require('express');
var router = express.Router();

var model = require('../model/DAO');

/* GET home page. */
router.route('/')
.get(function(req, res, next) {
  console.log('index get 호출됨');
  model.showpost(req.cookies.id, 
    function(err, result_post, name) {
      if(err) {
        res.render('err', {err: err});
      } else {
        model.showusers(null, 
          function(err, result_users) {
            if(err) {
              res.render('err', {err: err});
            } else {
              model.showusers(req.cookies.id, 
                function(err, result_user) {
                  if(err) {
                    res.render('err', {err: err});
                  } else {
                    res.render('index', {'post' : result_post, 'users': result_users, 'user': result_user[0], 'name': name, 'id': req.cookies.id});
                  }
                }
              );
            }
          }
        );
      }
    }
  );
})
.post(function(req, res, next) {
  console.log('index post 호출됨');
  var content= req.body.content;
  var comment = req.body.comment;
  var post_id = req.body.post_id;

  if(req.cookies.id) {
    if(content) {
      model.addpost(content, req.cookies.id, 
        function(err, result) {
          if(err) {
            console.log('err: ' + err);
            res.render('error', {err: '게시물 작성 실패'});
          } else {
            res.redirect('/');
          }
        }
      );
    }

    if(comment) {
      model.addcomment(comment, req.cookies.id, post_id, 
        function(err, result, docs) {
          if(err) {
            console.log('err: ' + err);
            res.render('error', {err: '댓글 작성 실패'});
          } else if(result) {
            console.log('댓글 작성 성공');
            res.send({result: docs[0].comments});
          }
        }
      );
    }
  } else {
    console.log('로그인이 안되어있음');
    res.redirect('/users/login');
  }
})
.put(function(req, res, next) {
  if(req.cookies.id) {
    var post_id = req.body.post_id;
    var flag = req.body.flag;

    if(post_id) {
      if(flag == 1) {
        model.addlike(post_id, req.cookies.id, 
          function(err, result, docs) {
            if(err) {
              console.log('err: ' + err);
              res.render('error', {err: '좋아요 추가 실패'});
            } else if(result) {
              console.log(docs);
              res.send({result: docs[0].like});
            }
          }
        );
      } else {
        model.sublike(post_id, req.cookies.id, 
          function(err, result, docs) {
            if(err) {
              console.log('err: ' + err);
              res.render('error', {err: '좋아요 삭제 실패'});
            } else if(result) {
              console.log('docs[0]:' + docs[0]);
              res.send({result: docs[0].like});
            }
          }
        )
      }
    }
  } else {
    res.redirect('/users/login');
  }
})
.delete(function(req, res, next) {
  var post_id = req.body.post_id;
  
  model.show_like_users(post_id, 
    function(err, result) {
      if(err) {
        console.log('err: ' + err);
        res.render('error', {err: '좋아요 유저 삭제 실패'});
      } else {
        res.send({like_users: result});
      }
    }
  )
});


module.exports = router;
