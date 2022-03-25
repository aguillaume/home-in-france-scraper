import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { Worker } from 'worker_threads';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';


const fileName = fileURLToPath(import.meta.url);

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(path.dirname(fileName), '../public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
    try {
        var myWorker = new Worker('./MainLoop.js');
        myWorker.onmessage = function(e) {
            console.log(`Message received from worker: ${e.data}`);
        }
        
    } catch (error) {
        console.log(error);
    }
}

export default app;
export { port, startScraper };
