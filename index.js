const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4h5cla.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomCollection = client.db("oasisDB").collection("rooms");
    const bookingCollection = client.db("oasisDB").collection("bookings");
    const reviewCollection = client.db("oasisDB").collection("reviews");

    app.get("/rooms", async (req, res) => {
      const result = await roomCollection.find().toArray();
      res.send(result);
    });

    app.get("/roomDetail/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.findOne(query);
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/roomDetail/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBooking = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBooked = {
        $set: {
          booking: updatedBooking,
        },
      };
      const result = await roomCollection.updateOne(
        filter,
        updateBooked,
        options
      );
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("oasis server");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
