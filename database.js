import mongoose from "mongoose";
import { Schema } from "mongoose";
mongoose.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

export { User };