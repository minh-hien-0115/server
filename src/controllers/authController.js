const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const asyncHandle = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.PASSWORD,
    },
});

const getJsonWebToken = async (email, id) => {
    const payload = {
        email,
        id,
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' });
    return token;
}

// const verificationCode = Math.round(1000 + Math.random() * 9000)
    // try {
    //     await transporter.sendMail({
    //     from: `AppChat <${process.env.USERNAME_EMAIL}>`,
    //     to: email,
    //     subject: "Yêu cầu xác thực",
    //     html: `
    //     <div style="max-width:600px;margin:0 auto;padding:20px;font-family:sans-serif;border:1px solid #ddd;border-radius:10px;">
    //       <h2 style="color:#4A90E2;">Mã xác nhận AppChat</h2>
    //       <p>Chào bạn,</p>
    //       <p>Chúng tôi đã nhận được yêu cầu xác thực tài khoản của bạn. Mã xác nhận này có thể được sử dụng để xác thực tài khoản của bạn.</p>
    //       <p>Vui lòng sử dụng mã bên dưới để hoàn tất đăng ký:</p>
    //       <div style="font-size:28px; font-weight:bold; margin:20px 0; padding:10px; background:#f0f0f0; border-radius:8px; text-align:center; letter-spacing:4px;">
    //         ${verificationCode}
    //       </div>
    //       <p>Mã xác thực này chỉ có hiệu lực trong 60 giây.</p>
    //       <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    //       <hr />
    //       <p style="font-size:12px;color:#888;">AppChat - Ứng dụng nhắn tin bảo mật</p>
    //     </div>
    //   `,
    //     });

    //     console.log("Email đã gửi đến:", email, "với mã:", verificationCode);
    //     // return verificationCode;

    //     // res.status(200).json({
    //     //     message: "Email đã được gửi thành công!!!",
    //     //     data: {
    //     //         code: verificationCode
    //     //     }
    //     // })

    //     return 'OK'

    // } catch (error) {
    //     // console.error(`Không thể gửi Email: ${error}`);
    //     // res.status(401)
    //     // throw new Error(`Gửi email thất bại`);
    //     return error;
    // }

    // try {
    //     await transporter.sendMail({
    //       from: `Hỗ trợ Application AppChat <${process.env.USERNAME_EMAIL}>`,
    //       to: email,
    //       subject: "Mã xác thực Email của bạn",
    //       text: "",
    //       html: `<b>Mã xác thực của bạn là: ${verificationCode}</b>`,
    //     });
    // } catch (error) {
    //     console.log("Không thể gửi Email")
    // }

const handleSendMail = async (val, email) => {
    try {
        await transporter.sendMail(val)
        return 'OK'
    } catch (error) {
        return error;
    }
}

const verification = asyncHandle(async (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.round(1000 + Math.random() * 9000)

    try {
        const data = {
            from: `AppChat <${process.env.USERNAME_EMAIL}>`,
            to: email,
            subject: "Yêu cầu xác thực",
            html: `
            <div style="max-width:600px;margin:0 auto;padding:20px;font-family:sans-serif;border:1px solid #ddd;border-radius:10px;">
              <h2 style="color:#4A90E2;">Mã xác nhận AppChat</h2>
              <p>Chào bạn,</p>
              <p>Chúng tôi đã nhận được yêu cầu xác thực tài khoản của bạn. Mã xác nhận này có thể được sử dụng để xác thực tài khoản của bạn.</p>
              <p>Vui lòng sử dụng mã bên dưới để hoàn tất đăng ký:</p>
              <div style="font-size:28px; font-weight:bold; margin:20px 0; padding:10px; background:#f0f0f0; border-radius:8px; text-align:center; letter-spacing:4px;">
                ${verificationCode}
              </div>
              <p>Mã xác thực này chỉ có hiệu lực trong 60 giây.</p>
              <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
              <hr />
              <p style="font-size:12px;color:#888;">AppChat - Ứng dụng nhắn tin bảo mật</p>
            </div>
          `,
        };

        await handleSendMail(data);

        res.status(200).json({
            message: 'Send verification code successfully!!!',
            data: {
                code: verificationCode,
            },
        });
    } catch (error) {
        res.status(401);
        throw new Error('Can not send email');
    }

    // const { email } = req.body;
    // // const verificationCode = Math.round(1000 + Math.random() * 9000)

    // try {
    //     await handleSendMail(verificationCode, email)
    //     res.status(200).json({
    //         message: "Email đã được gửi thành công!!!",
    //         data: {
    //             code: verificationCode
    //         }
    //     })
    //     console.log("Email gửi đến:", email, "với mã:", verificationCode);
    // } catch (error) {
    //     res.status(401)
    //     throw new Error(`Gửi email thất bại`);
    // }
})

const register = asyncHandle(async (req, res) => {
    const { username, email, password } = (req.body);
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        res.status(401)
        throw new Error("Email đã tồn tại!!!");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
        username: username ?? '',
        email,
        password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
        message: "Tạo mới tài khoản thành công!!!",
        data: {
            email: newUser.email,
            id: newUser.id,
            accesstoken: await getJsonWebToken(email, newUser.id),
        },
    });
});

const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email })

    if (!existingUser) {
        res.status(403).json({
            message: 'Người dùng không tồn tại!!!'
        })
        throw new Error('Người dùng không tồn tại');

    }

    const isMatchPassword = await bcrypt.compare(password, existingUser.password)

    if (!isMatchPassword) {
        res.status(401)
        throw new Error("Email hoặc Mật khẩu không đúng!");
    }
    res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accesstoken: await getJsonWebToken(email, existingUser.id),
        }
    })
})

const forgotPassword = asyncHandle(async (req, res) => {
    const { email } = req.body;
    const randomPassword = Math.round(100000 + Math.random() * 999000);

    const user = await UserModel.findOne({ email });

    if (user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(`${randomPassword}`, salt);

        try {
            await UserModel.findByIdAndUpdate(user._id, {
                password: hashedPassword, isChangePassword: true,
            })
            const data = {
              from: `AppChat <${process.env.USERNAME_EMAIL}>`,
              to: email,
              subject: "Mật khẩu mới",
              html: `
                <div style="max-width:600px;margin:0 auto;padding:20px;font-family:sans-serif;border:1px solid #ddd;border-radius:10px;">
                  <h2 style="color:#4A90E2;">Mật khẩu mới</h2>
                  <p>Chào bạn,</p>
                  <p>Chúng tôi đã nhận được yêu cầu đổi mật khẩu của bạn. Mật khẩu này được sử dụng để đăng nhập vào ứng dụng của bạn.</p>
                  <p>Vui lòng sử dụng mật khẩu bên dưới để đăng nhập vào ứng dụng:</p>
                  <div style="font-size:28px; font-weight:bold; margin:20px 0; padding:10px; background:#f0f0f0; border-radius:8px; text-align:center; letter-spacing:4px;">
                    ${randomPassword}
                  </div>
                  <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                  <hr />
                  <p style="font-size:12px;color:#888;">AppChat - Ứng dụng nhắn tin bảo mật</p>
                </div>
                `,
            };

            await handleSendMail(data)
            res.status(200).json({
                message: "Mật khẩu mới đã được gửi đến email của bạn thành công",
                data: [],
            });
        } catch (error) {
            res.status(500).json({
                message: 'Không thể gửi email',
                data: [],
            });
        }
    } else {
        res.status(401).json({
            message: "Người dùng không tồn tại",
        });
    }
});

module.exports = {
    register,
    login,
    verification,
    forgotPassword
}