## v1.0.0
```
CREATE DATABASE IF NOT EXISTS `open_hospital`;
USE `open_hospital`;

--
-- Table structure for table `oh_user`
--
DROP TABLE IF EXISTS `oh_user`;
CREATE TABLE `oh_user` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL COMMENT '用户登录名',
    `password` VARCHAR(255) NOT NULL COMMENT '用户登录密码，base64编码存储',
    `type` VARCHAR(64) NOT NULL COMMENT '用户类型，Admin-系统管理员，Doctor-医生用户，Registrar-挂号员，Patient-门诊用户',
    `real_name` VARCHAR(255) NOT NULL COMMENT '用户真实名称',
    `description` VARCHAR(255) NOT NULL COMMENT '用户简介，对医生用户有意义',
    `card_number` VARCHAR(255) NOT NULL COMMENT '医疗卡号，对门诊用户有意义',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_NAME` (`name`)
) ENGINE=InnoDB,CHARACTER SET=utf8;

INSERT INTO `oh_user` (id, name, password, type, real_name, description, card_number, create_time, update_time) VALUES \
                      ("fafa01f4-8357-4da7-95aa-c852bee805e8", "admin", "YWRtaW4=", "Admin", "系统管理员", "", "", 1548657435588, 1548657435588);

--
-- Table structure for table `oh_department`
--
DROP TABLE IF EXISTS `oh_department`;
CREATE TABLE `oh_department` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(64) NOT NULL COMMENT '科室名称',
    `description` VARCHAR(255) NOT NULL COMMENT '科室介绍',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_NAME` (`name`)
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_department_doctor`
--
DROP TABLE IF EXISTS `oh_department_doctor`;
CREATE TABLE `oh_department_doctor` (
    `department_id` VARCHAR(64) NOT NULL,
    `doctor_id` VARCHAR(64) NOT NULL,
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL,
    KEY `IDX_DEPARTMENT_DOCTOR` (`department_id`, `doctor_id`)
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_schedule`
--
DROP TABLE IF EXISTS `oh_schedule`;
CREATE TABLE `oh_schedule` (
    `department_id` VARCHAR(64) NOT NULL,
    `doctor_id` VARCHAR(64) NOT NULL,
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL,
    KEY `IDX_DEPARTMENT_DOCTOR` (`department_id`, `doctor_id`)
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_guide`
--
DROP TABLE IF EXISTS `oh_guide`;
CREATE TABLE `oh_guide` (
    `key` VARCHAR(64) NOT NULL COMMENT '导医项名称',
    `value` VARCHAR(255) NOT NULL COMMENT '导医项取值',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_registration`
--
DROP TABLE IF EXISTS `oh_registration`;
CREATE TABLE `oh_registration` (
    `id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `department_id` VARCHAR(64) NOT NULL,
    `doctor_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(16) NOT NULL COMMENT '挂号状态，Waiting-排队中，Working-正在问诊，Done-问诊结束',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_prescription`
--
DROP TABLE IF EXISTS `oh_prescription`;
CREATE TABLE `oh_prescription` (
    `id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `department_id` VARCHAR(64) NOT NULL,
    `doctor_id` VARCHAR(64) NOT NULL,
    `content` VARCHAR(254) NOT NULL COMMENT '处方内容',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL
) ENGINE=InnoDB,CHARACTER SET=utf8;

--
-- Table structure for table `oh_charge`
--
DROP TABLE IF EXISTS `oh_charge`;
CREATE TABLE `oh_charge` (
    `id` VARCHAR(64) NOT NULL,
    `prescription_id` VARCHAR(64) NOT NULL COMMENT '处方ID',
    `examination_fee` BIGINT NOT NULL COMMENT '检查费用/元',
    `medicine_fee` BIGINT NOT NULL COMMENT '医药费/元',
    `total_fee` BIGINT NOT NULL COMMENT '总费用/元',
    `status` VARCHAR(16) NOT NULL COMMENT '费用单状态，Waiting-待支付，Paid-已支付',
    `create_time` BIGINT(20) DEFAULT NULL,
    `update_time` BIGINT(20) DEFAULT NULL
) ENGINE=InnoDB,CHARACTER SET=utf8;
```