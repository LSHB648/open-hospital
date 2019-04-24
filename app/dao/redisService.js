var ioredis = require('ioredis');
var logger = require('../log/logger').getLogger('main');

var redisService = module.exports;

var REDIS_TIMEOUT = 1000;

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