const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.DB, { useNewUrlParser: true }, (err, result) => {
  if (result) {
    console.log("Database is connected");
  } else {
    console.log(err);
  }
});

module.exports = mongoose;
