const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

//Custom Middlewares
app.use((req, res, next) => {
  //console.log('Hello from the middleware!!!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Can't find ${req.originalUrl} on thi server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on thi server!`);
  // err.status = 'fail';
  // err.statusCode = '404';
  //In middleware functions whaterver we pass into next, express will assume it as error object
  next(new AppError(`Can't find ${req.originalUrl} on thi server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
