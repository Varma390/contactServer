const express = require("express");
const { body } = require("express-validator");
const { User, Contact } = require("../models/schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const signrouter = express.Router();
const cors = require("cors");
signrouter.use(cors());

signrouter.get('/login',(req,res) => {
  console.log(req.body)

    res.send({
        status: "success",
        message: "User Route WORKING",
        data : req.body
    })
})

signrouter.post('/login', async (req,res) => {
  console.log(req.body)
  const {Email, Password} = req.body
  try {
      await User.findOne({Email}) // finding user in DB
      
      .then(data => {
        console.log(data._id)
          if (!data) { // if user not found
              res.status(409).json({
                  status: "Failed",
                  message: "User doesn't exist with the given email. Please proceed to sign up"
                })
          }
          else {
              (async function (){ // immediately invoked function
                  await bcrypt.compare(Password, data.Password) // comapring the password in DB
                  .then(() => { // if all good
                    // console.log(data._id)
                      const token = jwt.sign({ // generate token
                          exp: Math.floor(Date.now() / 1000) + 60 * 60,
                          // data: "63b0390243bbf4cfa1edde5f"
                          data: data._id
                      }, process.env.JWT_SECRET_KEY)
                      res.status(200).json({
                          status: "Success",
                          message: "User Logged in successfully",
                          Token: token,
                        });
                  })
                  .catch(err => { // if password encryption failed
                      res.status(409).json({
                          status: "password encryption Failed",
                          message: err.message
                        })
                  })
                  })();
      }})
      .catch(err => { // fetching from DB fail
        console.log("Failed - cant access database Error")
          res.status(403).json({
              status: "Failed - cant access database",
              message: err.message,
            })
      })
  } catch(err) { // if error while working in this current route
      res.status(400).json({
          status: "Failed",
          message: err.message,
        })
  }
})


signrouter.post(
    "/signup",
    body("Email").isEmail(),
    body("Password").isLength({ min: 5 }),
    async (req, res) => {
      console.log("From signup route");
      try {
        console.log(req.body);
        const { Email, Password, confirmPassword } = req.body;
        let userData = await User.findOne({ Email });
        if (userData) {
          return res.status(409).json({
            status: "Existed Email",
            message:
              "User already exists with the given email. Please proceed to sign in",
          });
        }
        console.log(Password);
        // console.log(Password, confirmPassword);
        if (Password !== confirmPassword) {
          return res
            .status(400)
            .send("Password and confirm password are not matching");
        }
  
        bcrypt.hash(Password, 10, async function (err, hash) {
          // Store hash in your Password DB.
          if (err) {
            console.log("error in hash")
            return res.status(500).json({
              status: "Failed",
              message: err.message,
            });
          }
          userData = await User.create({
            Email: Email,
            Password: hash,
            // name: Email.split("@")[0],
          });
          res.json({
            status: "Success",
            message: "User successfully created",
            userData,
          });
        });
      } catch (e) {
        return res.json({
          status: "Failed",
          message: e.message,
        });
      }
    }
  );
  

  module.exports = signrouter;


// const express = require("express");
// const router = express.Router();
// const { User, Contact } = require("../models/schema");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// router.post("/signUp", async(req, res) => {
//     const { userEmail, password } = req.body
    
//     try {

//         const data = await User.findOne({ userEmail: userEmail })
//         if (data) {
//             res.send({ message: "user already Exist!" })
//         }
//         else {
//             bcrypt.hash(password, 10, async function (err, hash) {
//                 if (err) {
//                     return res.json({ message: err.message })
//                 }
//                 else{
//                     const data = await UserDetails.create({
//                         userEmail,
//                         password: hash
//                     })
//                     res.json({message: "Congratulations signUp sucessfull!",data});
//                     console.log(data);
//                 }
//             })
//         }
//     }

//     catch (e) {
//         res.send({
//             message: e.message
//         })
//     }
// })

// router.post("/login",async (req, res) => {
//     const { userEmail, password } = req.body
//     try {

//         const isuser = await User.findOne({ userEmail: userEmail });
//         if (isuser) {
//             const ispassword =  bcrypt.compare(password, isuser.password);
//             if (ispassword) {
//                 token = jwt.sign({ id:isuser.id}, "secret")
//                 res.json({ message:"success", token:token })
                
//             }
//             else{
//                 res.json({message:"Invalid"})
//             }
//         }
//         else {
//             res.json({ message: "Unregistered" })
//         }
//     }
//     catch (e) {
//         res.send({
//             message: e.message
//         })
//     }
// });

// module.exports = router;