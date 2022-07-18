const accountController = require('../controllers/userController')
const auth = require('../utils/auth')
var baseCommonApiUrl = C.baseApiUrl;
module.exports = function (app){
    // app.post('/signup',accountController.signup);
    // app.post('/login',accountController.login);
    app.post(`${baseCommonApiUrl}createAccount`,accountController.createAccount);
    app.post(`${baseCommonApiUrl}createWallet`,accountController.createWallet);
    app.post(`${baseCommonApiUrl}compileGenerateAbiByteCode`,accountController.generateAbiByteCode);
    app.post(`${baseCommonApiUrl}deployContract`,accountController.deployContract);
    app.post(`${baseCommonApiUrl}signTransaction`,accountController.signTransaction);
    app.post(`${baseCommonApiUrl}getTransaction`,accountController.getTransaction);
    app.post(`${baseCommonApiUrl}connectContract`,accountController.connectContract);
 };
