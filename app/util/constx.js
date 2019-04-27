module.exports = {
  'MODULE_TYPE': {
    'admin': 'admin',
    'patient': 'patient',
    'doctor': 'doctor'
  },
  'USER_TYPE': {
    'admin': 'Admin',
    'doctor': 'Doctor',
    'registrar': 'Registrar',
    'patient': 'Patient'
  },
  'REG_STATUS': {
    'waiting': 'Waiting',
    'working': 'Working',
    'done': 'Done'
  },
  'CHARGE_STATUS': {
    'waiting': 'Waiting',
    'paid': 'Paid'
  },
  'ACTION': {
    'registerUser': 'RegisterUser',
    'deRegisterUser': 'DeRegisterUser',
    'getUser': 'GetUser',
    'editUser': 'EditUser',
    'listUser': 'ListUser',
    'logIn': 'LogIn',
    'logOut': 'LogOut',
    'registerDepartment': 'RegisterDepartment',
    'deRegisterDepartment': 'DeRegisterDepartment',
    'getDepartment': 'GetDepartment',
    'editDepartment': 'EditDepartment',
    'listDepartment': 'ListDepartment',
    'addDoctor': 'AddDoctor',
    'removeDoctor': 'RemoveDoctor',
    'addSchedule': 'AddSchedule',
    'removeSchedule': 'RemoveSchedule',
    'listSchedule': 'ListSchedule',
    'editGuide': 'EditGuide',
    'getGuide': 'GetGuide',
    'addRegistration': 'AddRegistration',
    'removeRegistration': 'RemoveRegistration',
    'editRegistration': 'EditRegistration',
    'listRegistration': 'ListRegistration',
    'callRegistration': 'CallRegistration',
    'addPrescription': 'AddPrescription',
    'listPrescription': 'ListPrescription',
    'addCharge': 'AddCharge',
    'onlinePay': 'OnlinePay'
  },
  'RES_CATEGORY': {
    'response': 'Response',
    'push': 'Push'
  },
  'ERR_MSG': {
    '200': 'The api was called successfully.',
    '401': 'The request format must be json.',
    '402': 'The action %s is not supported.',
    '403': 'The parameter %s is required.',
    '404': 'The value %s of parameter %s is error.',
    '405': 'The resource %s already exists.',
    '406': 'The resource id %s is not found.',
    '407': 'The system internal exception.',
    '408': 'The operation is not permitted.',
    '409': 'The user not exists or password wrong.',
    '410': 'The doctor already belongs to a department.',
    '411': 'The doctor do not belongs to the department.'
  },
  'PREFIX': {
    'cookieCache': 'Cookie_'
  },
  'TIMEOUT': {
    'cookie': 300000
  }
};