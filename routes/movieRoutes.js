const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/requiredToken");
const checkUserExist = require("../middleware/checkUser");
const { query, validationResult } = require("express-validator");
const movies = mongoose.model("movies");

const router = express.Router();

router.use(requireAuth);
router.use(checkUserExist);

/*
@type     -   GET
@route    -   /api/movies
@desc     -   Retrieves a paginated list of movies. Supports optional filtering by movie title. The request must include 'page' and 'perPage' as numeric query parameters to control pagination. The 'title' query parameter is optional and used for filtering the movie list by title, performing a case-insensitive search.
@access   -   private
*/
router.get(
  "/api/movies",
  [
    query("page").isNumeric().withMessage("Page must be a numeric value"),
    query("perPage").isNumeric().withMessage("perPage must be a numeric value"),
    query("title").optional().isString().withMessage("Title must be a string"),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page);
    const perPage = parseInt(req.query.perPage);
    const titleFilter = req.query.title || "";
    let query = {};
    if (titleFilter) {
      query = { title: { $regex: new RegExp(titleFilter, "i") } };
    }

    movies
      .countDocuments(query)
      .then((totalCount) => {
        const totalPages = Math.ceil(totalCount / perPage);
        if (page < 1 || page > totalPages) {
          return res.status(400).json({ error: "Invalid page number" });
        }

        const skip = (page - 1) * perPage;
        return movies
          .find(query)
          .skip(skip)
          .limit(perPage)
          .then((movieList) => {
            res.json({ movies: movieList, totalRecords: totalCount });
          });
      })
      .catch((err) => {
        if (!res.headersSent) {
          res.status(500).json({ error: err.message });
        }
      });
  }
);

/*
@type     -   POST
@route    -   /api/movies
@desc     -   Adds a new "Movie" document to the database using the provided data in the request body. The route expects a complete movie object as per the defined schema including required fields like 'title' and 'languages'. On successful creation, it returns the newly created movie object. If there's an error during creation, a failure message is returned with the error details.
@access   -   private (Requires user authentication)
*/
router.post("/api/movies", requireAuth, (req, res) => {
  const data = req.body;
  
  // Instantiate a new movie with the data from the request body
  const newMovie = new movies(data);

  // Save the new movie to the database
  newMovie
    .save()
    .then((savedMovie) => {
      // Respond with the saved movie and a 201 Created status
      res.status(201).json(savedMovie);
    })
    .catch((err) => {
      // Log the error for internal tracking
      console.error("Error saving the movie:", err);
      // Respond with a 500 Internal Server Error for other types of errors
      res.status(500).json({ error: "Internal server error" });
    });
});

/*
@type     -   GET
@route    -   /api/movies/:id
@desc     -   Retrieves a specific movie from the database using the movie's unique identifier (_id). The route parameter ':id' should be a valid MongoDB ObjectId. If the movie with the specified ID does not exist, the server returns a 404 Not Found error. If the ID is in an invalid format, a 400 Bad Request error is returned. A successful response includes the movie object. This route is designed to return detailed information about a single movie based on its ID.
@access   -   private (Requires user authentication)
*/
router.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;

  // Validate the movieId to check if it's a valid MongoDB ObjectId
  if (!movieId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid movie ID format" });
  }

  // Attempt to find the movie by ID
  movies
    .findById(movieId)
    .then((movie) => {
      // Check if the movie was not found
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      // Return the movie object if found
      res.json(movie);
    })
    .catch((err) => {
      // Log the error for debugging purposes
      console.error("Error retrieving the movie:", err);

      // Respond with 500 Internal Server Error if an unexpected error occurs
      res.status(500).json({ error: "Internal server error" });
    });
});

/*
@type     -   PUT
@route    -   /api/movies/:id
@desc     -   Updates a specific movie by its _id provided in the route parameter. The request must include an update object in the body. Validates the format of the provided _id and the non-emptiness of the update data. Returns the updated movie object if the update is successful. If no movie matches the provided _id or the update fails, returns a 404 Not Found error. If the _id format is invalid or the update data is empty, returns a 400 Bad Request error.
@access   -   private (Requires user authentication)
*/
router.put("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  const updateData = req.body;

  // Validate the movieId to check if it's a valid MongoDB ObjectId
  if (!movieId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid movie ID format" });
  }

  // Check for empty body
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "Update data cannot be empty" });
  }

  movies
    .findByIdAndUpdate(movieId, updateData, { new: true, runValidators: true })
    .then((updatedMovie) => {
      if (!updatedMovie) {
        return res
          .status(404)
          .json({ error: "Movie not found or could not be updated" });
      }
      res.json(updatedMovie);
    })
    .catch((err) => {
      console.error("Error updating the movie:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/*
@type     -   DELETE
@route    -   /api/movies/:id
@desc     -   Deletes a specific movie by its _id provided in the route parameter. Validates the format of the provided _id. If the movie exists and is successfully deleted, a success message is returned. If no movie matches the provided _id or the deletion fails, a 404 Not Found error is returned. If the _id format is invalid, a 400 Bad Request error is returned.
@access   -   private (Requires user authentication)
*/
router.delete("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;

  // Validate the movieId to check if it's a valid MongoDB ObjectId
  if (!movieId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid movie ID format" });
  }

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
      console.error("Error deleting the movie:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

module.exports = router;
