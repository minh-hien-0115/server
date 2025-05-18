const Router = require('express');
const { register, login, verification, forgotPassword, createQR } = require('../controllers/authController');

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/verification', verification);
authRouter.post('/forgotPassword', forgotPassword);
authRouter.post('/QR', createQR);

module.exports = authRouter;