// <--- Modules --->
const express = require('express'); // imports express module
const session = require('express-session')// imports session module
const flash = require('express-flash'); // imports flash module
const mongoose = require('mongoose'); // imports mongoose module
const uninqueValidator = require('mongoose-unique-validator'); // imports unique validator

// <--- DB Settings --->
mongoose.connect('mongodb://localhost/dojo-secrets', {useNewUrlParser: true}); // coonects app to DB; create DB on first connection

// ** Schema **
const CommentSchema = new mongoose.Schema({
    content: {
        type: String, 
        minlength: [6, 'The minimum length for message content is six characters'],
        maxlength: [50, 'The maximum length for message content is fifty characters'],
        required: [true, 'Comment content is required']
    },
}, {timestamps: true});

const SecretSchema = new mongoose.Schema({
    content: {
        type: String, 
        minlength: [6, 'The minimum length for comment content is six characters'],
        maxlength: [50, 'The maximum length for comment content is fifty characters'],
        required: [true, 'Secret content is required']
    },
    comments: [CommentSchema]
}, {timestamps: true});

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address'], // REGEX email pattern
        unique: true
    },
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        minlength: [2, 'The minimum length for first name is two characters'],
        maxlength: [20, 'The maximum length for first name is twenty characters']
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        minlength: [2, 'The minimum length for last name is two characters'],
        maxlength: [20, 'The maximum length for last name is twenty characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    birthday: {
        type: Date,
        required: [true, 'Birthday is required']
    },
    secrets: [SecretSchema]
}, {timestamps: true});

// Unique value plugin for schema
UserSchema.plugin(uninqueValidator, {message: 'Email address is already in use, please login to continue, or use a different email address'});

// <--- Server Constructors --->
const app = express(); // constructs express server
const server = app.listen(8000); // port-listening

// <--- Server Settings --->
app.set('view engine', 'ejs'); // sets templating engine to ejs
app.set('views', __dirname + '/views'); // maps view dir
app.use(express.urlencoded({extended: true})); // allows POST routes
// ** Session Settings ***
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'logAuthSecKey',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));
app.use(flash()); // flash messages

// <--- Routing --->
const index = require(__dirname + '/routes/index.js')(app, server); // Index
const users = require(__dirname + '/routes/users.js')(app, server, mongoose, UserSchema); // Users
const secrets = require(__dirname + '/routes/secrets.js')(app, server, mongoose, UserSchema, SecretSchema, CommentSchema); // Secrets