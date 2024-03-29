var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');

var monk = require('monk');
var db = monk('127.0.0.1:27017/assignment2')

var productsRouter = require('./routes/products');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var corsOptions = {
  "origin": "http://localhost:3000",
  "credentials":true
  }
app.use(cors(corsOptions))


app.use(express.static('public'), function(req,res,next){
  req.db = db;
  next();
})

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/', productsRouter);


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
  res.render('error');
});

// module.exports = app;

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("productservice server listening at  http://%s:%s", host, port);
})