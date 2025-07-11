import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    username: String,
    password: String,
    isAdmin: { type: Boolean, default: false },
    isBaned: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const mensageSchema = new Schema({
    username: String,
    message: String,
    time: { type: Date, default: Date.now }
});
const Mensage = mongoose.model('Mensage', mensageSchema);

export { User, Mensage };