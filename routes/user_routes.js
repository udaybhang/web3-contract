const accountController = require('../controllers/userController')
const auth = require('../utils/auth')
module.exports = function (app){
    // app.post('/signup',accountController.signup);
    // app.post('/login',accountController.login);
    app.post('/v1/createAccount',accountController.createAccount);
    app.post('/v1/createWallet',accountController.createWallet);
    app.post('/v1/compileGenerateAbiByteCode',accountController.generateAbiByteCode);
    app.post('/v1/deployContract',accountController.deployContract);
 };