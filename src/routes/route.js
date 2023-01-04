const mongoose = require("mongoose");
const { Contact, User } = require("../models/schema");
const jwt = require("jsonwebtoken");
let bodyParser = require("body-parser");
require("dotenv").config();
const allRoutes = require("express").Router();
const cors = require("cors");
allRoutes.use(cors());
allRoutes.use(bodyParser.json());

// middleware for jwt verification

allRoutes.use("/", (req, res, next) => {
  if (req.headers.token) {
    const token = req.headers.token
    console.log(`headers.token = ${token}`);
    if (token) {
      console.log("Before")
      jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
          console.log("After")
          return res.status(401).json(err);
        }
        req.user = decoded.data;
        console.log(req.user)
        next();
      });
    } else {
      return res.status(401).json({
        status: "Failed",
        message: "Token is missing",
      });
    }
  } else {
    return res.status(403).json({
      status: "Failed",
      message: "Not authenticated user",
    });
  }
});

// get all contacts

allRoutes.get("/contacts", async (req, res) => {
  try {
    await Contact.find({ user: req.user })
      .then(data => {
        console.log(1);
        res.status(200).send({
            status: "success",
            message: data,
          })})
      .catch(err => {
            res.status(401).send({
              status: "Unable to Find",
              message: err.message,
            })
      })  
    } catch (err) {
      console.log(3);
      return res.status(404).json({
        status: "failure",
        mess: err.message,
      });
  }
});



// add contacts


allRoutes.post("/add", async (req, res) => {
  try {
    console.log(req.body);
    req.body.forEach(async (e) => {
      await Contact.create({ ...e, user: req.user });
    });
    return res.status(200).json({
      status: "success",
      mess: "Added all contacts",
    });
  } catch (err) {
    return res.status(404).json({
      status: "Failed",
      mess: err.message,
    });
  }
});



//search a contact using email


allRoutes.get("/:email", async (req, res) => {
  console.log(req.params.email);
  try {
    await Contact.find({ Email: req.params.email })
      .then((user) => {
        return res.status(200).json({
          status: "success",
          mess: user,
        });
      })
      .catch((err) => {
        return res.status(404).json({
          status: "Failed",
          message: "User does not exists",
        });
      });
  } catch (err) {
    return res.status(400).json({
      status: "Failed",
      message: err.message,
    });
  }
});

// deleting the selected contacts
allRoutes.delete("/delete/:id", async (req, res) => {
  // console.log(res.body) // ["63aeb62d50bc537f77529980","63aeb62e50bc537f77529982","63aeb62e50bc537f77529981"]
  console.log(req.params.id)
  try {
    
      await Contact.deleteMany({ _id: req.params.id })
        .then((data) => {
          console.log(data);
          res.status(200).json({
            status: "success",
            message: "Selected contacts Deleted Successfully",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.status(400).json({
            status: "failed",
            message: "unable to delete",
          });
        });
    
   
  } catch (err) {
    return res.status(400).json({
      status: "Failed",
      message: "No Contacts Deleted",
    });
  }
});

module.exports = allRoutes;

// {
//   "Name": "Grey",
//   "Designation": "GreySloan memorial",
//   "Company": "Surgeon",
//   "Industry": "Surgeon",
//   "Email": "Grey@gmail.com",
//   "Phone_number": 53446754765,
//   "Country": "USA"
// }
