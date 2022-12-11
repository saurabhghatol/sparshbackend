const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
mongoose.set('strictQuery', true);


const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`connection successful`);
}).catch((err) => console.log('Error in connection' + err));

