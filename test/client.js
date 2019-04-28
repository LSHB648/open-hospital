var ws = require("nodejs-websocket")

var req = {};

req.Action = 'RegisterUser';
req.Name = 'hzlushiliang';
req.PassWord = Buffer.from('iamhzlushiliang').toString('base64');
req.Type = 'Patient';
req.RealName = '陆世亮';

ws.connect("ws://127.0.0.1:8080", (conn) => {
  console.info("websocket client connected to server");

  conn.sendText(JSON.stringify(req));

  setTimeout(() => {
    console.info("wensocket client going to close");
    conn.close();
    process.exit(0);
  }, 5 * 1000);

  conn.on("text", (msg) => {
    console.info("websocket recv msg = %j", JSON.parse(msg));
  });
});