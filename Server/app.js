import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { Worker } from 'worker_threads';
import createError from 'http-errors';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';


const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

let app = express();

// view engine setup
app.set('views', path.join(dirName, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(dirName, '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function startScraper() {
    // try {
    //     var myWorker = new Worker('./MainLoop.js');
    //     myWorker.onmessage = function (e) {
    //         console.log(`Message received from worker: ${e.data}`);
    //     }

    // } catch (error) {
    //     console.log(error);
    // }
}

export default app;
export { port, startScraper };
