import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    username: String,
    password: String,
    whenCreated: { type: Date, default: Date.now },
    messagesSent: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

const messageSchema = new Schema({
    username: String,
    message: String,
    time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

export { User, Message as Message };