/********************************************************************************* 
 * * ITE5315 – Project 
 * * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. 
 * * * Group member Name: ABHAY & Prarabdha Student IDs: N01581911 & N01578947 Date: 16th April 2024 
 * *********************************************************************************/
//SCHEMA FOR DATABASE
let mongoose = require('mongoose');

// Define the nested schema for "imdb"
let imdbSchema = mongoose.Schema({
  rating: { 
    type: Number, 
  },
  votes: { 
    type: Number, 
  },
  id: { 
    type: Number, 
  }
});

let awardSchema = mongoose.Schema({
  wins: { 
    type: Number, 
  },
  nominations: { 
    type: Number, 
  },
  text: { 
    type: String, 
  }
});

// Define the nested schema for "viewer" under "tomatoes"
let viewerSchema = mongoose.Schema({
  rating: { 
    type: Number,
  },
  numReviews: { 
    type: Number, 
  },
  meter: { 
    type: Number, 
  }
});

let criticSchema = mongoose.Schema({
  rating: { 
    type: Number, 
  },
  numReviews: { 
    type: Number, 
  },
  meter: { 
    type: Number, 
   }
});

// Define the main schema for "Movie"
const movieSchema = mongoose.Schema({
  plot: { 
    type: String, 
  },
  genres: { 
    type: [String], 
  },
  runtime: { 
    type: Number, 
  },
  cast: { 
    type: [String], 
  },
  num_mflix_comments: { 
    type: Number, 
  },
  poster: { 
    type: String, 
  },
  title: { 
    type: String, 
    required: true 
  },
  fullplot: { 
    type: String, 
  },
  lastupdated: { 
    type: String, 
  },
  languages: { 
    type: [String], 
    required: true 
  },
  released: { 
    type: Date, 
    
  },
  directors: { 
    type: [String], 
  },
  writers: { 
    type: [String], 
  },
  awards: { 
    type: awardSchema, 
  },
  year: { 
    type: Number, 
  },
  imdb: { 
    type: imdbSchema,  
  }, // Embed the "imdb" nested schema
  countries: { 
    type: [String], 
  },
  type: { 
    type: String, 
  },
  tomatoes: {
    viewer: { 
      type: viewerSchema,  
    }, // Embed the "viewer" nested schema under "tomatoes"
    dvd: { 
      type: Date,  
    },
    website: { 
      type: String, 
    },
    production: { 
      type: String, 
    },
    lastUpdated: { 
      type: Date, 
    },
    boxOffice: { 
      type: String, 
    },
    consensus: { 
      type: String, 
    },
    fresh: { 
      type: Number, 
    },
    rotten: { 
      type: Number, 
    },
    critic: { 
      type: criticSchema, 
    }
  },
  metacritic: { 
    type: Number, 
  },
  rated: { 
    type: String, 
  }
});

// Create a model based on the "Movie" schema
module.exports = mongoose.model("movies", movieSchema);

