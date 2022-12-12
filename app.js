
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3001;
const cookieParser = require('cookie-parser');
var path  = require('path');

require('dotenv').config()

const app = express();
app.use(cors({ origin:true, credentials:true }));
app.use(express.json());
app.use(require('./router/auth'));


app.get('/',(req,res) => {
    res.send(`Hello world from home`);
});

app.listen(port || process.env.port, ()=> {
    console.log(`server is running on port no ${port}`);   
})
