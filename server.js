const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const { newTopSongs } = require("./data/cleanSongs")

const mongoUrl = "mongodb+srv://new_user90:nMepfddUO7kJmTER@cluster0.d0pe1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// model a specific set of rules for how the document will look like
// every document created should look like this: 
const songSchema = new mongoose.Schema({
  title: String,
  description: String,
  artist: String,
  released: String,
  writers: String,
  producer: String,
  position: Number,
  id: Number
});

// Mongoose = ORM - Object Relational Mapping.
// Model consist of schemas
// - MONGO_URL: connection string generated in MongoDB Cloud Atlas
// - RESET_DB: with value true so the seedDatabase function is called
const Song = mongoose.model("Song", songSchema);

if (process.env.RESET_DB) {
  const SeedDB = async () => {
    await Song.deleteMany();
    // operation we do in backend, save this in the data base 
    await newTopSongs.forEach((item) => {
      const newSong = new Song(item);
      newSong.save();
    });
  };
  SeedDB();
}

// Defines the port the app will run on. Defaults to 8080
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// Start defining your routes here
app.get("/", (req, res) => {
  res.send("500 greatest songs of all time");
});

// http://localhost:8080/songs
// http://localhost:8080/songs?page=1
// http://localhost:8080/songs?size=35
// http://localhost:8080/songs?page=1&size=35
// Endpoint that returns all songs
// async, that the function is asyncronus 
// the variabel song gets us all songs in alignment with the Schema 
// Why async await? - 

app.get("/songs", async (req, res) => {
  try {
    // page - 1, because
    // const songs = await Song.find()
    // res.json(songs);
    // if page is not sent in as a query parameter
    let { page, size } = req.query
    if (!page) {
      page = 1 
    } if (!size) {
      size = 100
    }
    const limit = parseInt(size, 100);
    const skip = (page - 1) * size 

    const songs = await Song.find().limit(limit).skip(skip)
    res.send({ page, size, data: songs })
  } catch (error) {
    res.status(400).json({ error: "error not a page or size" })
  }
});

// http://localhost:8080/songs/song/${id}
// End point that returns one song
app.get("/songs/song/:id", async (req, res) => {
  try {
    const singleSong = await Song.findOne({ id: req.params.id })

    if (singleSong) {
      res.json(singleSong)
    } else {
      // Error when the id format is valid, but no song is found with that id
      res.status(400).json({ error: "no song found with that id" })
    }
    // Error when format id os wrong and invalid dong id entered 
  } catch (err) {
    res.status(404).json({ error: "Invalid song id, doubble check song id value" })
  }
})

// Endpoint to get all songs that has been on top chart number one 
// The $eq is a MongoDB query operator matches documents 
// where the value is equal the field with specified value
// Totallt 119 songs has been number one on billbord, 
// Pagnation through mongoDB 

app.get('/songs/top-rated', async (req, res) => {
  try {
    let { page, size } = req.query
    if (!page) {
      page = 1 
    } if (!size) {
      size = 40
    }
    const limit = parseInt(size, 40);
    const skip = (page - 1) * size 

    const topSongs = await Song.find({ position: { $eq: 1 } }).limit(limit).skip(skip)
    res.send({ page, size, data: topSongs })
  } catch (error) {
    res.status(400).json({ error: "error not a page or size" })
  }
})

// http://localhost:8080/songs/artist/bob%20dylan
// end point for search for specific artist, using params 
app.get('/songs/artist/:artist', async (req, res) => {
  const artistName = req.params.artist

  // Added regex so that search includes non-case-sensitive strings and
  // if the name is included in the request 
  const artistSong = await Song.find({ artist: { $regex: new RegExp(artistName, "i") } });

  if (artistSong.length === 0) {
    res.status(404).json("Sorry, could not find any songs by that artis, check artis name")
  } 
  res.json(artistSong)
})

// http://localhost:8080/songs/title/my%20generation
// end point for search for specific song title, using params 
app.get('/songs/title/:title', async (req, res) => {
  const titleName = req.params.title

  // Added regex so that search includes non-case-sensitive strings and
  // if the name is included in the request 
  const titleSong = await Song.find({ title: { $regex: new RegExp(titleName, "i") } });

  if (titleSong.length === 0) {
    res.status(404).json("Sorry, could not find any songs by that title, check title name")
  } 
  res.json(titleSong)
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
