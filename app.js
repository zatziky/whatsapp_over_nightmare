var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
const routerWhatsapp = require('./router/whatsapp.router');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/whatsapp/', routerWhatsapp);

// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);
this.server = app.listen(app.get('port'), (error) => {
    if (!error) {
        console.log(`app running on port: ${app.get('port')}! Build something amazing!`); // eslint-disable-line
    }
    else {
        console.log(error);
    }

});

module.exports = app;
