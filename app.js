/*
 ** Call module dependencies
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session= require('express-session');
var cors=require('cors');
var passport=require('passport');


/*
 ** Configs
 */

require('./config/passport')(passport);


/*
 ** Call in router dependencies
 */
var indexController = require('./controllers/index.js');
var authenticationController = require('./controllers/authentication.js');
var usersController = require('./controllers/users.js');
var postsController = require('./controllers/posts.js');

/*
 ** Instantiate new express() object
 */
var app = express();


/*
 ** Use middlewares
 */
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/profile-images',express.static(path.join(__dirname, 'profile-images')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: "InAtypicalWebappIwilluseAlongerString,MaybeSomethingLike1234567890OkAmTiredNow.",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());


/*
 ** Setup routes from dependencies
 */

app.use('/flow/accounts', authenticationController);
app.use('/api/', indexController);
app.use('/api/profile',usersController)
app.use('/api/posts', postsController);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
