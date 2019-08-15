// this module handles 'secret' routing
module.exports = (app, server, mongoose, UserSchema, SecretSchema, CommentSchema) => {
    // ** Document Model **
    const Comment = mongoose.model('Comment', CommentSchema); // Model to create comments
    const Secret = mongoose.model('Secret', SecretSchema); // Model to create secrets
    const User = mongoose.model('User', UserSchema); // Model to create users
    
    // <--- Routing --->
    // ** GET routes **
    // Root
    app.get('/secrets', (req, res) => {
        if (!req.session._id){
            res.redirect('/');
        } else {
            User.find()
                .then(users => {
                    var secrets = []; // creates array for secrets
                    // iterate through secrets to create an object to bind to the view model
                    for (var i = 0; i < users.length; i++) {
                        for (var j = 0; j < users[i].secrets.length; j++) {
                            secrets.push({user_id: users[i]._id, secret_id: users[i].secrets[j]._id, content: users[i].secrets[j].content});
                        }
                    }
                    res.render('secrets', {secrets: secrets, session: req.session});
                })
                .catch(err => console.log(err));
            }
    });

    // show
    app.get('/secrets/:userid/:secretid', (req, res) => {
        User.findOne({_id: req.params.userid})
            .then(user => {
                var secret = user.secrets.id(req.params.secretid);
                console.log(secret);
                res.render('show', {secret: secret, user_id: user._id});
            })
            .catch(err => console.log(err));
    })

    // ** POST routes **
    // new secrets
    app.post('/secrets', (req, res) => {
        User.updateOne({_id: req.session._id}, {
            $push: {secrets: {
                content: req.body.content
            }}
        }, {runValidators: true})
        .then( () => res.redirect('/secrets'))
        .catch(err => {
            console.log(err);
            for (var key in err.errors) {
                req.flash('postErrors', err.errors[key].message); // add error to formerrors
            }
            res.redirect('/secrets');
        })
    });

    // delete secret
    app.post('/secrets/destroy/:userid/:secretid', (req, res) => {
        User.findOne({_id: req.params.userid}) // queries DB for user
            .then(user => {
                user.secrets.pull(req.params.secretid); // chains the 'pull' command using the secret's id from url
                user.save(); // saves the update
                res.redirect('/secrets');
            })
            .catch(err => console.log(err));
    })

    // new comment
    app.post('/secrets/:userid/:secretid/comment', (req, res) => {
        User.findOne({_id: req.params.userid})
            .then(user => {
                const secret = user.secrets.id(req.params.secretid);
                secret.comments.push({content: req.body.content});
                user.save()
                    .then(res.redirect(`/secrets/${req.params.userid}/${req.params.secretid}`))
                    .catch(err => {
                        for (var key in err.errors) {
                            req.flash('postErrors', err.errors[key].message); // add error to formerrors
                        }
                        res.redirect(`/secrets/${req.params.userid}/${req.params.secretid}`);
                    })
            })
            .catch(err => {
                for (var key in err.errors) {
                    req.flash('postErrors', err.errors[key].message); // add error to formerrors
                }
                res.redirect(`/secrets/${req.params.userid}/${req.params.secretid}`);
            })
    });
};