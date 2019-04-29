var ws = require("nodejs-websocket")

var req = {};

req.Action = 'CallRegistration';
//req.Guide = {};
//req.Guide.Name = '海南省人民医院';
//req.Guide.Address = '海南省海口市人民路111号';
//req.Guide.Phone = '18768492388';
//req.Guide.WebSite = 'https://www.renmin.com';
//req.Guide.WebChat = 'hainanrenmin';
//req.Guide.Tips = '海南省资历最强的医院';
//req.Guide.RoadMap = 'http://www.renmin.com/roadMap.jpg';
//req.UserId = '6a7d38f3-aa0e-4fac-a72e-50cc856c3ad4';
//req.Content = '黄连一斤';
//req.ChargeId = '39a5c55a-0c91-44e2-bf48-4dec4faccc62';
//req.PrescriptionId = '0da159b3-2290-4a6e-8e5f-4fd8ff0fcb0e';
//req.ExamFee = 100;
//req.MedcFee = 100;
//req.TotalFee = 200;
req.RegistrationId = "10a58607-aad3-44da-bef5-c45422275e6a";
//req.DepartmentId = '7ac4a436-fd25-47c7-abdc-6c7f912b6996';
//req.DoctorId = '24159b7d-f5ca-458e-94d4-7f4cde771a22';
//req.Name = 'lushibao';
//req.Description = '保护眼睛人人有责啊';
//req.PassWord = Buffer.from('iamlushibao').toString('base64');
//req.Type = 'Doctor';
//req.RealName = '陆世宝';
//req.Cookie = Buffer.from('UserType=xxx&&UserId=rrr&&Random=ttt').toString('base64');
//req.Cookie = "VXNlclR5cGU9UGF0aWVudCYmVXNlcklkPTZhN2QzOGYzLWFhMGUtNGZhYy1hNzJlLTUwY2M4NTZjM2FkNCYmUmFuZG9tPWE4NWQ4MmNjLTVjYmQtNGE2OS04ODQzLTA1MDJjM2E1NjVmYg==";
//req.Cookie = "VXNlclR5cGU9QWRtaW4mJlVzZXJJZD1mYWZhMDFmNC04MzU3LTRkYTctOTVhYS1jODUyYmVlODA1ZTgmJlJhbmRvbT0yNDQyZDZkNC1mMGJlLTQ2ODEtYTBiMi00NWQ1YWQyOGI3ZDg=";
req.Cookie = "VXNlclR5cGU9RG9jdG9yJiZVc2VySWQ9MjQxNTliN2QtZjVjYS00NThlLTk0ZDQtN2Y0Y2RlNzcxYTIyJiZSYW5kb209ZTdlYzBjNmUtOGY4Ny00OTc4LWExNWMtZTA4YjliYTFhNzNm";

var conn = ws.connect("ws://127.0.0.1:8080", (err) => {
  console.info("websocket client connected to server, err = %j", err);

  conn.sendText(JSON.stringify(req));

  setTimeout(() => {
    console.info("wensocket client going to close");
    conn.close();
    process.exit(0);
  }, 5 * 100000);

  conn.on("text", (msg) => {
    console.info("websocket recv msg = %j", JSON.parse(msg));
  });
});