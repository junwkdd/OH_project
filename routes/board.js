var express = require('express');
var router = express.Router();

var model = require('../model/DAO');


router.route('/')
.get(function(req, res) {
    console.log('borad get 호출됨');  
    
    if(req.query.postid) {
        model.showboard(req.query.postid, 
            function(err, result) {
                if(err) {
                    res.render('err', err);
                } else {
                    model.showusers(req.cookies.id,
                        function(err, user) {
                            if(err) {
                                res.render('err', {err: err});
                            } else {
                                res.render('boardoutput', {post: result, id: req.cookies.id, name: user[0].name}); 
                            }
                        }
                    )
                }
            }
        );
    } else {
        model.showboards(req.query.page, 
            function(err, result) {
                if(err) {
                    console.log('err: ' + err);
                } else {
                    model.showusers(req.cookies.id, 
                        function(err, user) {
                            if(err) {
                                res.render('err', {err: err});
                            } else {
                                res.render('board', { 'board': result.docs, 'page': result.page, 'start': result.start, 'end': result.end, 'totalPage': result.totalPage, 'id': req.cookies.id, 'name': user[0].name } );
                            }
                        }
                    );
                }
            }
        );
    }
})
.post(function(req, res) {
    console.log('board post 호출됨');

    if(req.cookies.id) {
        if(req.body.comment) {
            model.addcomment2(req.body.comment, req.cookies.id, req.body.postid,
                function(err, result, docs) {
                    if(err) {
                        console.log('err: ' + err);
                        res.render('error', {err: '댓글 작성 실패'});
                    } else if(result) {
                        res.redirect('/users?id=' + req.cookies.id);
                    }
                }
            );
        }
    } else {
        console.log('로그인 안되어있음');
        res.redirect('/users/login');
    }
})

router.route('/input')
.post(function(req, res) {
    console.log('/boardinput post 호출됨');
    var title= req.body.title
    var content = req.body.content

    if(title && content) {
        if(req.cookies.id) {
            model.addboard(title, content, req.cookies.id,
                function (err, result) {
                    if (err) {
                        res.render('err', {err: err});
                    } else {
                        res.redirect('../board');
                    }
                }
            );
        } else {
        }
    }
    
})
.get(function(req, res) {
    if(req.cookies.id) {
        res.render('boardinput', {id: req.cookies.id});
    } else {
        console.log('로그인이 안되어있음');
        res.redirect('/users/login');
    }
});

module.exports = router;