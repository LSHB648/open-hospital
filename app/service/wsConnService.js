var wsConnService = module.exports;
var wsConn = {};

wsConnService.set = (req) => {
  wsConn[req.userId] = req.conn;
};

wsConnService.get = (req) => {
  return wsConn[req.userId];
};