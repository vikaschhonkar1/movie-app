const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const axios = require("axios");
const app = express();
const port = 3000;

require("dotenv").config();
const apiKey = process.env.API_KEY;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Create MySQL connection
const db = mysql.createConnection({
  host: `${dbHost}`,
  user: `${dbUser}`,
  password: `${dbPass}`,
  database: `${dbName}`,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

// Define routes
app.get("/", (req, res) => {
  res.render("search");
});

app.post("/search", async (req, res) => {
  const searchQuery = req.body.searchQuery;
  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?apikey=${apiKey}&s=${searchQuery}`
    );
    const movies = response.data.Search;

    if (movies) {
      //   console.log('Fetched movies:', movies);
      res.render("results", { movies });
    } else {
      console.log("No movies found.");
      res.status(404).send("No movies found.");
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send("Error fetching movies");
  }
});

app.post("/favorites", (req, res) => {
  const { title, year, type, poster } = req.body;
  const movie = { title, year, type, poster };
  db.query("INSERT INTO favorites SET ?", movie, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      res.redirect("/favorites");
    }
  });
});

app.get("/favorites", (req, res) => {
  db.query("SELECT * FROM favorites", (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error fetching favorites from database");
    } else {
      res.render("favorites", { favorites: results });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
