var ioredis = require('ioredis');
var logger = require('../log/logger').getLogger('main');

var redisService = module.exports;
var redisClient = null;

redisService.init = (config) => {
  if (redisClient != null) {
    return;
  }

  redisClient = new ioredis(config);

  redisClient.on('connect', () => {
    logger.info("redis client connected with server");
  });

  redisClient.on('error', (err) => {
    logger.error("redis client error = %j", err);
  });
  
  redisClient.on('close', () => {
    logger.error("redis client close");
  });
  
  redisClient.on('end', () => {
    logger.error('redis client end');
  });
};

redisService.incr = (key, cb) => {
  redisClient.incr(key, (err, res) => {
    if (!!err) {
      logger.error("redis incr err = %j", err);
      cb(err, null);
      return;
    }

    cb(err, res);
  });
};

redisService.setKeyExpire = (key, value, expire, cb) => {
  redisClient.setex(key, expire, value, (err) => {
    if (!!err) {
      logger.error("redis setKeyExpire err = %j", err);
    }

    cb(err);
  });
};

redisService.setKeyForever = (key, value, cb) => {
  redisClient.set(key, value, (err) => {
    if (!!err) {
      logger.error("redis setKeyForever err = %j", err);
    }

    cb(err)
  });
};

redisService.getKey = (key, cb) => {
  redisClient.get(key, (err, res) => {
    if (!!err) {
      logger.error("redis getKey err = %j", err);
      cb(err, null);
      return;
    }

    cb(err, res);
  });
};