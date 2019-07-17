var express = require('express');
var router = express.Router();
var formidable = require('formidable');

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
                                res.render('boardoutput', {post: result, id: req.cookies.id, user: user[0]}); 
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
                    res.render('err', {err: err});
                } else {
                    model.showusers(req.cookies.id, 
                        function(err, user) {
                            if(err) {
                                res.render('err', {err: err});
                            } else {
                                res.render('board', { 'board': result.docs, 'page': result.page, 'start': result.start, 'end': result.end, 'totalPage': result.totalPage, 'id': req.cookies.id, 'user': user[0] } );
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
                        res.send({result: docs[0].comments});
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
.get(function(req, res) {
    if(req.cookies.id) {
        model.showusers(req.cookies.id,
            function(err, user) {
                if(err) {
                    res.render('err', {err: err});
                } else {
                    res.render('boardinput', {id: req.cookies.id, user: user[0]});
                }
            }
        );
    } else {
        console.log('로그인이 안되어있음');
        res.redirect('/users/login');
    }
})
.post(function(req, res) {
    console.log('/boardinput post 호출됨');

    // var title= req.body.title
    // var content = req.body.content

    // if(title && content) {
    //     if(req.cookies.id) {
    //         model.addboard(title, content, req.cookies.id, null,
    //             function (err, result) {
    //                 if (err) {
    //                     res.render('err', {err: err});
    //                 } else {
    //                     res.redirect('../board');
    //                 }
    //             }
    //         );
    //     } else {
    //         res.redirect('/users/login');
    //     }
    // }


    var form = new formidable.IncomingForm();
    var filepath;
    form.uploadDir = 'C:/Node-workspace/OH_project/public/images/board/';
    
    form.on('fileBegin', function (name, file) {
        file.path = form.uploadDir + file.name;
        if(file.path == 'C:/Node-workspace/OH_project/public/images/board/') {
            file.path = 'undefined';
        } else {
            filepath = file.path;
        }
        filepath = file.path;
        console.log('filepath: ' + filepath);
    });
    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name);
    });
    form.on('error', function(err) {
    if(err) {
        res.render('err: ' + {err: err});
    }
    });
    form.parse(req, function(err, fields, files) {
        var title = fields.title;
        var content = fields.content;

        model.addboard(title, content, req.cookies.id, filepath,
            function (err, result) {
                if (err) {
                    res.render('err', {err: err});
                } else {
                    res.redirect('../board');
                }
            }          
        );
    });
});


module.exports = router;