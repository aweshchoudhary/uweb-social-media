const router = require("express").Router();
const User = require("../apps/models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "client/public/imgs/profiles/"),
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
});

//update user
router.put("/:id", upload.single("profileImg"), async (req, res) => {
  if (req.params.id === req.body.userId || req.body.isAdmin) {
    if (req.file) {
      const user = await User.findByIdAndUpdate(req.params.id, {
        profileImg: req.file.path,
      });
      res.json({ message: "Your Profile Photo has been Uploaded" });
    }
    if (req.body.password) {
      try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      } catch (error) {
        return res.status(400).json(error);
      }
    }
    if (req.body && !req.body.password) {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json({ message: "Account has been updated" });
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can only update your account" });
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.params.id === req.body.userId || req.body.isAdmin) {
    try {
      const user = await User.findByIdAnd(req.params.id);
      res.status(200).json({ message: "Account has been deleted" });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json({ message: "you can only delete your account" });
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(400).json({ message: "Something went wrong.  Try again" });
  }
});
//get a user
router.get("/", async (req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;
  try {
    const user = userId
      ? await User.findById(req.params.id)
      : await User.findOne({ username });
    if (user) {
      const { password, updatedAt, ...others } = user._doc;
      res.status(200).json(others);
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong.  Try again" });
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });
        res.status(200).json({ message: "user has been followed" });
      } else {
        console.log();
        res.status(403).json({ message: "you already follow this user" });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong. Try again" });
    }
  } else {
    res.status(403).json({ message: "you can't follow yourself" });
  }
});
//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json({ message: "user has been unfollowed" });
      } else {
        res.status(403).json({ message: "you don't  follow this user" });
      }
    } catch (err) {
      res.status(500).json({ message: "Something went wrong. Try again" });
    }
  } else {
    res.status(403).json({ message: "you can't follow yourself" });
  }
});

module.exports = router;
