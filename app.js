var app = require('./app/application');
var shutdown = require('./app/log/logger').shutdown;
var logger = require('./app/log/logger').getLogger('main');

var HELP_DUMP = '' +
'usage:  node app.js env={environment} listenPort={port} enable={modules} [help]\n\n' +
'\thelp: 打印帮助文档，可选\n' +
'\tenv: 部署哪个环境，当前设置成oh_dev即可\n' +
'\tlistenPort: 监听端口\n' +
'\tenable: 部署哪个平台，可以同时部署多个平台，用逗号分隔即可\n' +
'\t\tadmin               后台管理员用户平台\n' +
'\t\tpatient             前台门诊用户平台\n' +
'\t\tdoctor              前台医生用户平台\n\n' +
'example:  node app.js env=oh_dev listenPort=8080 enable=admin,patient,doctor' +
'';

var ret = app.init();

if (ret === false) {
    console.error(HELP_DUMP);
    shutdown(() => {
        process.exit(2);
    });
}

if (ret === true && app.help) {
    console.info(HELP_DUMP);
    shutdown(() => {
        process.exit(0);
    });
}