const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('../DB/conn');
const User = require('../model/userSchema');
const nodemailer = require('nodemailer');





const emails =['pavanrjadhav1994@gmail.com'];


let transporter = nodemailer.createTransport({
    host: "smtp.pobox.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EUSER, // generated ethereal user
        pass: process.env.EPASSWORD, // generated ethereal password
    },
  });





generateAuthToken = async function(data) {
    try{
        let token = jwt.sign({email:data,}, process.env.SECRET_KEY);
        return token;
    }
    catch(err){
        res.status(400).json({error: "Something went wrong"});  
        console.log(err);
    }
}


router.post('/login', async (req,res) => {
    let token;
   
    try{

        let token;
        const{ email, password} = req.body;
       
        // console.log(email+" "+password);

        if( !email || !password){
            return res.status(401).json({error: "Please fill the data"});
        }

        const userLogin = await User.findOne({ email: email });

    //    user login
      if(userLogin){
            // console.log("hello from user exist but not verified")
                if(userLogin.isVerified){

                    const isMatch = await bcrypt.compare(password, userLogin.password);

                    const token = await userLogin.generateAuthToken();
                    
                        res.cookie('jwttoken',token,
                    {
                        maxAge:new Date(Date.now() + 20 ),
                        httpOnly:true
                    });

                    //    console.log(`This is postman cookies ${req.cookies.jwttoken}`);

                    if(!isMatch)
                    {
                        res.status(400).json({error: "Wrong Password"});                  
                    }
                    else{     
                        res.send({message: "user Login Successful"});
                        // console.log(token);
                        // console.log(userLogin);
                    }
                }
                else{
                    res.status(400).json({error: "User Exist but Email not Verified"});
                }
            }
        else{
            res.status(400).json({error: "Email does not Exist"});
        }
      }
    catch(err){
        res.send({messahe:"error occured"});
    }
    
})



router.post('/signup', async (req, res) => {
    //creating token
    const Token = Math.floor(100000 + Math.random() * 900000);

    const {name, email, phone, city, state, country, password, cpassword } = req.body;

    if(!name || !email || !phone || !city || !state || !country || !password || !cpassword){
        return res.status(422).json({error: "plz fill all fields properly"});
    }

     try{

        const userExists = await User.findOne({email:email});
        if(userExists){ 
              //if user verified status is false
                    if(userExists.isVerified){
                        return res.status(422).json({error: "Email already exists"});
                    }
                    else{

                        // const Token = function () {
                        //     return Math.floor(Math.pow(10, 5) + Math.random() * (Math.pow(10, 6) - Math.pow(10, 5) - 1));
                        // }

                        userExists.name=name,
                        userExists.email=email,
                        userExists.phone=phone,
                        userExists.city=city,
                        userExists.state=state,
                        userExists.country=country,
                        userExists.password=password,
                        userExists.emailToken=Token


                        //  executing code here for password hashing
                        await userExists.save();
            
                        
                        //sending verification mail to the user
                        var mailOptions = {
                            from:`<noreply@test.in>`,
                            to:userExists.email,
                            subject:'Your :: Verification code',
                            html:`
                                <h3> Your one time email verification code is ${Token} </h3>
                               `
                                //   <h2> ${userExists.name}! Thanks for registering on our site </h2>
                        }
            
                        //sending mail to the user
            
                        transporter.sendMail(mailOptions, function(error,info){
                            if(error){
                                console.log(error);
            
                            }else{
                                res.status(201).json({ message: "Verification mail is sent to your email Please verify"});
                                console.log("Verification mail is sent to your email Please verify");
                            }
                        })
            
                        // res.status(201).json({ message: "User Registered successfully"});
                        res.status(201).json({ message: "Please verify your email"});
                        

                    }

            }
        
        else if(password != cpassword){
            return res.status(422).json({error: "Password are not matching exists"});
        }
        else{
            const emailToken = Token;
            const user = new User({name, email, phone, city, state, country, password, cpassword, emailToken});
            //  executing code here for password hashing
            await user.save();

            
            //sending verification mail to the user
            var mailOptions = {
                from:`<noreply@teamsg.in>`,
                to:user.email,
                subject:'TeamSG :: Verification code',
                html:`<h2> ${user.name}! Thanks for registering on our site </h2>
                <h3> Your one time email verification code is ${Token} </h3>
               `
            }

            //sending mail to the user

            transporter.sendMail(mailOptions, function(error,info){
                if(error){
                    console.log(error);

                }else{
                    res.status(201).json({ message: "Verification mail is sent to your email Please verify"});
                    console.log("Verification mail is sent to your email Please verify");
                }
            })

            // res.status(201).json({ message: "User Registered successfully"});
            res.status(201).json({ message: "Please verify your email"});
            
        }
     }
     catch(err) {
         console.log(err);
     }
});



//verifying the user
router.post('/user-verify', async(req,res) => {
    try{
        const {otp} = req.body;
        if(!otp){
            res.status(400).json({error: "Error Occured"}); 
        }
        else{
            // console.log("otp is "+otp);

            const user = await User.findOneAndUpdate({emailToken:otp},{
                $set:{    
                    emailToken:null,
                    isVerified:1
                }
            });
            console.log("user"+user);
            if(user){
                res.send({message:"User verification successfull"});
                // res.redirect('/login');
            }else{
                res.status(400).json({error: "Verification unsuccessfull -OR- User Does not exist Try Again"});  
                console.log("User Does not exist Try Again");
            }
        }
    }
    catch(err){
        console.log(err);
    }

})



module.exports = router;
