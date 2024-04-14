//IMPORTING MODULES
require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
//const session = require("express-session");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const exphbs = require("express-handlebars");
const requireToken = require("./middleware/requiredToken");
const port = 8000;
const app = express();

//CONNECTION TO  ATLAS DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Check for DB errors
db.on("error", function (err) {
  console.log("DB Error");
});

var movies = require("./models/movies");
var User = require("./models/user");

// Initialize built-in middleware for urlencoding and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", ".hbs");

// app.get('/', (req, res) => {
//   res.render('home', {  title: "Welcome to the project" });
// });
app.get("/", (req, res) => {
  res.json({ message: "Lets get started !!" });
});
//sign-up route
app.get("/signup", async (req, res) => {
  var { email, password } = req.body;

  try {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return new Error(err);

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return new Error(err);
        }
        password = hash;

        const user = new User({ email, password });

        user.save().then((user) => {
          res.json({ user });
        });
      });
    });
  } catch (err) {}
});

// Sign-in route
app.get("/signin", async (req, res) => {
  var { email, password } = req.body;

  try {
    User.findOne({ email }).then((user) => {
      if (user) {
        if (user.email !== email)
          return res.status(404).json({ message: "Unable to login!" });

        bcrypt.compare(password, user.password).then((isCompared) => {
          if (!isCompared)
            return res.status(404).json({ message: "Unable to login!!" });

          const token = jwt.sign({ userId: user._id }, "secret", {
            expiresIn: "1d",
          });

          res.status(200).json({ message: "login Successfully", token });
        });
      } else {
        return res.status(404).json({ message: "Unable to login!" });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
//pagination route
app.get("/api/allMovies/:page/:perPage/:title", function (req, res) {
  const page = parseInt(req.params.page);
  const perPage = parseInt(req.params.perPage);
  const titleFilter = req.params.title || "";
  let query = {};
  if (titleFilter) {
    query = { title: { $regex: new RegExp(titleFilter, "i") } };
  }

  movies
    .countDocuments(query)
    .then((totalCount) => {
      const totalPages = Math.ceil(totalCount / perPage);

      if (page < 1 || page > totalPages) {
        throw new Error("Invalid page number");
      }

      const skip = (page - 1) * perPage;

      return movies.find(query).skip(skip).limit(perPage);
    })
    .then((movieList) => {
      res.render("paginationmovies", { movie: movieList });
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

//GET route to fetch all movies
// app.get("/allMovies", (req, res) => {
//   movies
//     .find()
//     .then((movie) => {
//       if (movie && movie.length > 0) {
//         res.render("allMovies", { movie: movie });
//       } else {
//         res.send("No movies available");
//       }
//     })
//     .catch((err) => {
//       res.status(500).send(err.message);
//     });
// });
// --------
app.get("/allMovies", (req, res) => {
  movies
    .find()
    .then((movie) => {
      if (movie && movie.length > 0) {
        res.json(movie); // Return movie data as JSON
      } else {
        res.status(404).json({ message: "No movies available" }); // Return a JSON message if no movies are available
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message }); // Return a JSON error message with status code 500
    });
});
// -------



//CREATE MOVIES
// POST route to create a new movie
// app.post('/api/Movies', (req, res) => {
//   const data = req.body;

//   const newMovie = new movies(data);

//   newMovie.save()
//       .then(savedMovie => {
//           res.status(201).json(savedMovie);
//       })
//       .catch(err => {
//           res.status(500).json({ error: err.message });
//       });
// });

app.post("/api/Movies", requireToken, (req, res) => {
  const data = req.body;

  const user = req.user;
  const newMovie = new movies(data);

  newMovie
    .save()
    .then((savedMovie) => {
      res.status(201).json(savedMovie);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//GET MOVIES BY ID
// GET route to fetch a specific movie by its _id
app.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;

  movies
    .findById(movieId)
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//UPDATE MOVIES
// PUT route to update a specific movie by its _id
app.put("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  const updateData = req.body;

  movies
    .findByIdAndUpdate(movieId, updateData, { new: true })
    .then((updatedMovie) => {
      if (!updatedMovie) {
        return res
          .status(404)
          .json({ error: "Movie not found or could not be updated" });
      }
      res.json(updatedMovie);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//DELETE MOVIES
// DELETE route to delete a specific movie by its _id
app.delete("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;

  movies
    .findByIdAndDelete(movieId)
    .then((deletedMovie) => {
      if (!deletedMovie) {
        return res
          .status(404)
          .json({ error: "Movie not found or could not be deleted" });
      }
      res.json({ message: "Movie deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//WE WILL TRY TO ADD MORE ROUTES AFTER COMPLETING ABOVE ONES

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
