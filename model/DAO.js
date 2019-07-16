const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'oh_db';
var db;
var ObjectId = require('mongodb').ObjectID;

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


MongoClient.connect(url, {useNewUrlParser: true} , function(err, client) {
    console.log("Connected successfully to server");
    console.log("db Name is " + dbName);

    db = client.db(dbName);
});

exports.showpost = function(id, callback) {
    console.log('showpost 호출됨');

    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var name;

    user.toArray(function(err, docs) {
        if(err) {
            console.log('err:' + err);
        } 
        if(docs.length > 0) {
            name = docs[0].name;
        } else {
            console.log('로그인이 안되어있음');
        }
    });

    var mysort = { _id: -1 };

    var post = db.collection('post');
    var posts = post.find({}).sort(mysort);
    
    posts.toArray(function(err, docs) {
        if (err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            console.log('게시물 찾음');
            callback(null, docs, name);
        }
    });
}

exports.addUser = function (id, passwords, name, callback) {
    console.log('add User 호출됨');
    var users = db.collection('users');
 
    users.insertMany([{ "id": id, "passwords": passwords, "name": name }],
        function (err, result) {
            if (err) {
                console.log('err: ' + err);
                callback(err, null);
            } else {
                console.log('사용자 추가 됨');
                callback(null, result);
            }
        }
    );
};

exports.authUser = function (id, password, callback) {
    console.log('authUser 호출됨');

    var users = db.collection('users');
    var user = users.find({ 'id': id, 'passwords': password });

    user.toArray(function (err, docs) {
        if (err) {
            console.log('err:' + err);
            callback(err, null);
        } else if(docs.length > 0) {
            console.log('유저를 찾음');
            callback(null, docs);
        } else {
            console.log('유저 정보 없음');
            callback(null, null);
        }
    });
};

exports.addpost = function(content, id, callback) {
    console.log('addpost 호출됨');

    var post = db.collection("post");
    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');
    var like = 0;

    user.toArray(function(err, docs) {
        post.insertMany([{"name": docs[0].name, "id": id, "content": content, "date": date, 'like': like, 'like_user': []}], 
            function(err, result) {
                if (err) {
                    console.log('게시물 추가 안됨');
                    callback(err, null);
                } else {
                    console.log('게시물 추가 됨');
                    callback(null, result);
                }
            }
        );
    });
};

exports.addcomment = function(content, id, post_id, callback) {
    console.log('addcomment 호출됨');

    post_id = new ObjectId(post_id);
    var posts = db.collection("post");
    var post = posts.find({"_id": post_id});
    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');

    user.toArray(function(err, docs) {
        var comment = {'name': docs[0].name, 'id': id, 'content': content, 'date': date};
        posts.updateOne({"_id": post_id}, {$push: {'comments': comment}},
            function(err, result) {
                if (err) {
                    console.log('댓글 추가 안됨');
                    callback(err, null);
                } else {
                    console.log('댓글 추가 됨');
                    post.toArray(function(err, docs) {
                        callback(null, result, docs);
                    });
                }
            }
        );
    });
};

exports.addcomment2 = function(content, id, post_id, callback) {
    console.log('addcomment2 호출됨');

    post_id = new ObjectId(post_id);
    var boards = db.collection("board");
    var board = boards.find({"_id": post_id});
    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');

    user.toArray(function(err, docs) {
        if(err) {
            console.log('err: ' + err);
            callback(err, null);
        } else {
            var comment = {'name': docs[0].name, 'id': id, 'content': content, 'date': date};
            boards.updateOne({"_id": post_id}, {$push: {'comments': comment}},
                function(err, result) {
                    if (err) {
                        console.log('댓글 추가 안됨');
                        callback(err, null);
                    } 
                    if(result) {
                        console.log('댓글 추가 됨');
                        board.toArray(function(err, docs) {
                            if(err) {
                                console.log('err: ' + err);
                                callback(err, null);
                            } else {
                                console.dir(docs);
                                callback(null, result, docs);
                            }
                        });
                    }
                }
            );
        }
    });
};

exports.addlike = function(post_id, id, callback) {
    console.log('addlike 호출됨');

    post_id = new ObjectId(post_id);


    var posts = db.collection("post");
    var post = posts.find({'_id': post_id});

    post.toArray(function(err, docs) {
        posts.updateOne({"_id": post_id}, {$set: {'like': docs[0].like + 1}},
            function(err, result) {
                if(err) {
                    console.log('좋아요 증가 실패');
                    callback(err, null);
                } else {
                    console.log('좋아요 증가 성공');
                    posts.updateOne({"_id": post_id}, {$push: {'like_user': id}},
                        function(err, docs) {
                            if(err) {
                                console.log('좋아요 유저 추가 실패');
                            } else {
                                console.log('좋아요 유저 추가 성공');
                                post.toArray(function(err, docs) {
                                    callback(null, result, docs);
                                });
                            }
                        }
                    );
                }
            }
        );
    });
};

exports.sublike = function(post_id, id, callback) {
    console.log('sublike 호출됨');

    post_id = new ObjectId(post_id);

    var posts = db.collection("post");
    var post = posts.find({'_id': post_id});

    post.toArray(function(err, docs) {
        posts.updateOne({"_id": post_id}, {$set: {'like': docs[0].like - 1}},
            function(err, result) {
                if(err) {
                    console.log('좋아요 감소 실패');
                    callback(err, null);
                } else {
                    console.log('좋아요 감소 성공');
                    posts.updateOne({"_id": post_id}, { $pull: { like_user: id }},
                        function(err, docs) {
                            if(err) {
                                console.log('좋아요 유저 삭제 실패');
                            } else {
                                console.log('좋아요 유저 삭제 성공');
                                post.toArray(function(err, docs) {
                                    callback(null, result, docs);
                                });
                            }
                        }
                    );
                }
            }
        );
    });
};

exports.showprofile = function(id, callback) {
    console.log('showprofile 호출됨');

    var mysort = { _id: -1 };

    var users = db.collection('users');
    var user = users.find({ 'id': id });
    var boards = db.collection('board');
    var board = boards.find({ 'id': id }).sort(mysort);
    var posts = db.collection('post');
    var post = posts.find({ 'id': id }).sort(mysort);


    user.toArray(function (err, user_docs) {
        if(err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            post.toArray(function(err, post_docs) {
                if(err) {
                    console.log('개인 post 찾기 실패');
                    callback(err, null);
                } else {
                    board.toArray(function(err, board_docs) {
                        if(err) {
                            console.log('개인 board 찾기 실패');
                        } else {
                            console.log('프로필 탐색 완료');
                            callback(null, user_docs, post_docs, board_docs);
                        }
                    });
                }
            })
        }
    });
};

exports.addinfo = function(id, student_id, profession, email, callback) {
    console.log('addinfo 호출됨');

    var users = db.collection('users');
    var user = users.find({'id': id});

    users.update({ "id": id }, {$set: {'email': email, 'student_id': student_id, 'profession': profession}}, 
    function (err, result) {
        if (err) {
            console.log('정보 추가 실패');
            callback(err, null);
        } else {
            console.log('정보 추가됨');
            user.toArray(function(err, docs) {
                if(err) {
                    console.log('err:' + err);
                } else {
                    console.log('정보 갱신 성공');                    
                    callback(null, result, docs);
                }
            })
        }
    });
};

exports.showusers = function(id, callback) {
    console.log('showusers 호출됨');

    var users = db.collection("users");
    if(id == null) {
        var user = users.find({});
    } else {
        var user = users.find({'id': id});
    }

    user.toArray(function(err, docs) {
        if(err) {
            console.log('err:' + err);
            callback(err, null);
        } else {
            console.log('유저 불러오기 성공');
            callback(null, docs);
        }
    });
};

exports.show_like_users = function(post_id, callback) {
    console.log('show_like_users 호출됨');

    post_id = new ObjectId(post_id);

    var posts = db.collection("post");
    var post = posts.find({'_id': post_id});

    post.toArray(function(err, docs) {
        if(err) {
            console.log('err: ' + err);
            callback(err, null);
        } else {
            console.log('좋아요 유저 불러오기 성공');
            callback(null, docs);
        }
    })
};

exports.addboard = function(title, content, id, callback) {
    console.log('addpost 호출됨');
    var users = db.collection('users');
    var counters = db.collection('counters');
    var counter = counters.find({});
    var board = db.collection('board');
    var user = users.find({ 'id': id });
    var date = moment().format('YYYY-MM-DD(hh:mm)');
    
    counter.toArray(function(err, docs) {
        post_id = docs[0].post_id;
        counters.update({"post_id": post_id}, {$set: {"post_id": parseInt(post_id)+1}});
    });
    user.toArray(function(err, docs) {
        board.insertMany([{"post_id": post_id, "title": title, "name": docs[0].name, "id": docs[0].id, "content": content, "date": date, "view": 0}], 
            function(err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (result) {
                    console.log('게시물 추가 됨');
                    callback(null, result);
                }
            }
        );
    });
};

exports.showboards = function(page, callback) {
    console.log('showboards 호출됨');
    var boards = db.collection("board");
    var board = boards.find({});
    board.toArray(function(err, docs) {
        totalCount = docs.length;
    });
    if(page == undefined) {
        var page = 1;
    } else {
        var page = parseInt(page);
    }    
    var limit = 10;
    var skip = (page  - 1)* limit;
    var mysort = { _id: -1 };

    var board = boards.find({}).sort(mysort).skip(skip).limit(limit);
    board.toArray(function(err, docs) {
        if(err) {
            callback(err, null);
        } else {
            var countList = 10;
            var countPage = 5;
            var totalPage = totalCount / countList;        
            var start = parseInt((page - 1)/countPage + 1);
            var end = parseInt(start + countPage - 1);
    
            if (~Number.isInteger(totalPage)) {
                totalPage = parseInt(++totalPage);
                console.log('totalPage: ' + totalPage);
            }
            if(end > totalPage) {
                end = totalPage;
            }
            callback(null, {'docs': docs, 'page': page, 'start': start, 'end': end, 'totalPage': totalPage})
        }
    });
};

exports.showboard = function(post_id, callback) {
    console.log('show board 호출됨');

    post_id = new ObjectId(post_id);
    var boards = db.collection("board");
    var board = boards.find({ "_id": post_id});

    board.toArray(function(err, docs) {
        if(err) {
            console.log('err: ' + err);
            callback(err, null);
        } else {
            var view = docs[0].view;
            console.log('view: ' + view);
            boards.updateOne({"_id": post_id}, {$set: {"view": view+1}});
            callback(null, docs[0]);
        }
    });
};

exports.addimg = function(id, filepath, callback) {
    console.log('addimg 호출됨');

    var users = db.collection('users');

    filepath = filepath.substring(35);
    
    users.updateOne({ "id": id }, {$set: {"filepath": filepath}}, 
        function(err, result) {
            if(err) {
                console.log('err: ' + err);
                callback(err, null);
            } else {
                console.log('이미지 저장 성공');
                callback(null, result);
            }
        }
    )
};