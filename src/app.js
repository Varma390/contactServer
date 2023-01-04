const express = require("express");
const app = express();
const allRoutes = require("./routes/route");
const signroute = require("./routes/user");
app.use(express.json());

// const cors = require("cors");

// app.use(cors({
//   origin:"http://localhost:3000/",
//   methods: ["GET","POST","DELETE"]
// }))

app.use("/hello", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Welcome to CONTACT MANAGER app backend API.",
  });
});

//Routes
app.use("/user", allRoutes);
app.use("/", signroute);

module.exports = app;
