## open-hospital
```
医院在线挂号与服务引导系统
```

### 安装部署

以centos操作系统为例

1. 安装nodejs v10.15.3，详见 [Node官网](https://nodejs.org/en/download/) ,或者用命令行安装
```
apt-get install nodejs
```
2. 安装npm v6.4.1，一般nodejs安装包自带，或者用命令行安装
```
apt-get install npm
```
3. 安装mysql服务，运行mysql服务，注意设置用户名和密码
```
apt-get install mysql-server
service mysql start
```
4. 安装redis服务，注意配置好redis服务
```
apt-get install redis-server
```
5. 进入项目根目录
```
cd OPEN-HOSPITAL
```
6. 安装项目依赖
```
npm install
```
7. 初始化mysql数据库，运行之前先修改db_init.sh文件中的数据库用户名和密码
```
bash ./misc/db_init.sh
```
8. 上传git

### 使用方式

1. 运行下面命令查看使用帮助
```
# node app.js help
```