const router = require("express").Router();
const User = require("../apps/models/User");
const bcrypt = require("bcryptjs");

//register
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({
      fullName,
      username,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).json({ message: "Register Successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
    console.log(err);
  }
});

// login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const a = username.search("@");
  try {
    let user;
    a
      ? (user = await User.findOne({ email: username }))
      : (user = await User.findOne({ username }));

    if (user) {
      const comparePass = await bcrypt.compare(password, user.password);
      if (comparePass) {
        res.status(200).json({ message: "Login successfully", user });
      } else {
        res.status(400).json({ message: "Password is wrong" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong. Try again" });
  }
});

module.exports = router;
