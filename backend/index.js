const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const connect = require("./apps/db/connect");
const cors = require("cors");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan("common"));
app.use(
  cors({
    origin: [...process.env.CONTENT.split(",")],
  })
);

app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

app.use(express.static(path.join(__dirname, "/build")));
app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "build", "index.html"))
);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
