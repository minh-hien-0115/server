const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true,
        // unique: true,
    },
    email: {
        type: String,
        required: true,
        // unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    photoUrl: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    // phoneNumber: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    // address: {
    //     type: String,
    //     required: true,
    // },
    // role: {
    //     type: String,
    //     enum: ["admin", "user"],
    //     default: "user",
    // },
    // }, { timestamps: true, versionKey: false
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;