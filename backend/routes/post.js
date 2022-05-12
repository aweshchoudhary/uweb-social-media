const router = require("express").Router();
const Post = require("../apps/models/Post");
const User = require("../apps/models/User");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "client/public/imgs/posts/"),
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

//create a post
router.post("/", upload.single("img"), async (req, res) => {
  try {
    const { userId, desc } = req.body;
    const newPost = await new Post({
      userId,
      desc,
      img: req.file.path,
    });
    const savedPost = await newPost.save();
    res.status(200).json({ message: "Post Created Successfully", savedPost });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});
//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await Post.updateOne({ $set: req.body });
      res.status(200).json({ message: "The post has been updated" });
    } else {
      res.status(403).json({ message: "you can update only your post" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});
//delete a post
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    const post = await Post.findById(req.params.id);
    await post.deleteOne();
    res.status(200).json({ message: "Your post has been deleted" });
  } else {
    res.status(500).json({ message: "You can only delete your post" });
  }
});
//like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({ message: "You liked this post" });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json({ message: "You disliked this post" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});

//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});
//get user's all post

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findById(req.params.username);
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});

//get all following posts
router.get("/timeline/:id", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.id);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
  }
});

module.exports = router;
