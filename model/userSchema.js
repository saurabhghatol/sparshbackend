const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    emailToken:{
        type:Number,
        // required:true
    },
    isVerified:{
        type:Boolean,
        default:0
    },
    tokens:[
        {
            token:{
                type: String,
                requirde:true
            }
        }
    ]
});


userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});


// Genarting token

userSchema.methods.generateAuthToken = async function() {
    try{
        // we need to pass payload and unique key which is id 
        let token = jwt.sign({_id:this._id,}, process.env.SECRET_KEY);
        // we are adding token in tokens 
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch(err){
        console.log(err);
    }
}


// collection creation
const User  = mongoose.model('USER',userSchema);

module.exports = User;