import mongoose from "mongoose";
import { Schema } from "mongoose";

// Troque pelos seus dados do Atlas:
const MONGO_URI = "mongodb+srv://<user>:<password>@<clusterURL>/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Conectado ao MongoDB Atlas!"))
.catch((err) => console.error("Erro ao conectar ao Atlas:", err));

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