const express = require("express");
const app = express();
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const connect = require("./config");
const Book = require("./models/Book");
const User = require("./models/User");
dotenv.config();
connect();

app.use(express.json());

app.post(
  "/api/register",
  asyncHandler(async (req, res) => {
    console.log("hi");
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error("Please Enter all Fields");
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      res.status(200);
      throw new Error("User already Exists");
    }
    const user = await User.create({
      username,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the user");
    }
  })
);

app.post(
  "/api/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error("Please Enter all Fields");
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      if (userExists.password === password) {
        res.status(200).json({
          _id: userExists._id,
          username: userExists.username,
        });
      } else {
        res.status(200);
        throw new Error("Failed to Login");
      }
    }
  })
);

app.get(
  "/api/books",
  asyncHandler(async (req, res) => {
    const { username } = req.query;

    const books = await Book.find({ username });
    res.status(200).json(books);
  })
);

app.post("/api/addbook", async (req, res) => {
  const data = req.body;
  console.log(data);
  const book = await Book.create({
    username: data.username,
    title: data.title,
    author: data.author,
    isbn: data.isbn,
    description: data.description,
    published_date: data.date,
    publisher: data.publisher,
  });

  if (book) {
    res.status(201).send("book added successfully");
  }
});

app.delete("/api/deletebook", async (req, res) => {
  const { id } = req.query;
  const data = await Book.deleteOne({ _id: id });
  res.status(200).send("book deleted successfully");
});

app.put(
  "/api/updatebook",
  asyncHandler(async (req, res) => {
    const book = req.body;
    console.log(book);
    const data = await Book.updateOne({ _id: book._id }, book);
    if (data) {
      res.status(200).send("Updated successfully");
    }
  })
);

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static("frontend/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/frontend/build/index.html"));
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log("backend is running at port 5000");
});
