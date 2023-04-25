const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "auth-db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database");
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      const query = `INSERT INTO users (email, password) VALUES ('${email}', '${hash}')`;
      connection.query(query, (err, results) => {
        if (err) {
          console.error("Error registering user:", err);
          res.status(500).json({ message: "Internal server error" });
        } else {
          console.log({ message: "User registered successfully" });
          res.redirect("/login");
        }
      });
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email='${email}'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error finding user:", err);
      res.status(500).json({ message: "Internal server error" });
    } else if (results.length === 0) {
      res.status(401).json({ message: "Invalid username or password" });
    } else {
      const hash = results[0].password;
      bcrypt.compare(password, hash, (err, match) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          res.status(500).json({ message: "Internal server error" });
        } else if (!match) {
          res.status(401).json({ message: "Invalid username or password" });
        } else {
          res.json({ message: "Login successful" });
        }
      });
    }
  });
});
const port = process.env.PORT || 3002;
app.listen(3002, () => {
  console.log(`Server started on port ${port}`);
});
