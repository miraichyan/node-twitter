const express = require('express');
const fs = require('fs');
const passport = require('passport');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 8080;

const promiseRetry = require('promise-retry');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  reconnectTries: 60,
  reconnectInterval: 1000,
  poolSize: 10,
  bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect
};

const promiseRetryOptions = {
  retries: options.reconnectTries,
  factor: 2,
  minTimeout: options.reconnectInterval,
  maxTimeout: 5000
};

const connect = () => {
  return promiseRetry((retry, number) => {
    logger.info(`MongoClient connecting to ${url} - retry number: ${number}`)
    return mongoose.connect(config.db, options).catch(retry)
  }, promiseRetryOptions)
}

const models_path = __dirname+'/app/models';
fs.readdirSync(models_path).forEach(file => {
  require(models_path+'/'+file);
});

require('./config/passport')(passport, config);
require('./config/express')(app, config, passport);
require('./config/routes')(app, passport, auth);

app.listen(port);
console.log('Express app started on port ' + port);
module.exports = app;

//module.exports = { connect }