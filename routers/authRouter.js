const Router = require('express')

const authRouter = Router();

authRouter.post('/register', (req, res) => {
  console.log(req.body)
  res.send('User registered successfully!')
});

module.exports = authRouter;