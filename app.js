import httpStatus from 'http-status';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import logger from 'morgan';
import winston from 'winston';
import expressWinston from 'express-winston';
import { ValidationError } from 'express-validation';
import config from './src/config/env.js';
import routes from './index.route.js';
import APIError from './src/helpers/apiErrorHelper.js';

const app = express();
const __dirname = path.resolve();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (config.env === 'development') {
  app.use(logger('dev'));
}
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ],
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(cors());

app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.details;
    const error = new APIError(unifiedErrorMessage, httpStatus.BAD_REQUEST);
    return next(error);
  }
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(new APIError('Not found', httpStatus.NOT_FOUND));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);

  // if req.headers['accept-language'] is undefined, it is not a request from a browser
  if (req.headers['accept-language']) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = config.env === 'development' ? err : {};

    // render the error page
    res.render('error');
  } else {
    res.json({ message: err.message, status: err.status, stack: config.env === 'development' ? err.stack : '' });
  }
});

app.get("/", (req, res) => { 
  res.send("<h2>It's Working!</h2>"); 
}); 

const PORT = 3000; 

app.get('/tshirt', (req, res) => {
  res.status(200).send({
    tshirt: 'SHIRT',
    size: 'large'
  })
});

app.post('/tshirt/:id', (req, res) => {
  const { id } = req.params;
  const { logo } = req.body;

  if(!logo) {
    res.status(418).send({ message: 'We need a logo!' })
  }

  res.send({
    tshirt: 'SHIRT with your ${logo} and ID of ${id}',
  });
});

app.listen(PORT, () => { 
  console.log(`API is listening on port ${PORT}`); 
});

export default app;
