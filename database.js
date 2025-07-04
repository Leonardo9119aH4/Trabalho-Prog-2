const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true });

function database(){
    const userSchema = new Schema({
        username: String,
        password: String
    });
}

module.exports = {database};