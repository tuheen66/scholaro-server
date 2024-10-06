const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gnzeig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

    const collegeCollection = client.db("scholaro").collection("colleges");
    const myCollegeCollection = client.db("scholaro").collection("myColleges");
    const reviewCollection = client.db("scholaro").collection("reviews");

    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    app.get("/college/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/college-name/:name", async (req, res) => {
      const collegeName = req.params.name;
      let query = {};
      if (collegeName) {
        query = { name: collegeName };
      }
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/colleges/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await myCollegeCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-college/:collegeName", async (req, res) => {
      const name = req.params.collegeName;
      const query = { name: name };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    app.post("/myCollege", async (req, res) => {
      const myCollege = req.body;

      const query = { email: myCollege.email };
      const existing = await myCollegeCollection.findOne(query);
      if (existing) {
        return res.send({ message: "already added", insertedId: null });
      }

      const result = await myCollegeCollection.insertOne(myCollege);
      res.send(result);
    });

    app.put("/myColleges/:id", async (req, res) => {
      const id = req.params.id;
      const { candidate_name, email, subject, phone, address, photo } =
        req.body;

      const updatedDocument = {
        candidate_name,
        email,
        subject,
        phone,
        address,
        photo,
      };

      const query = { _id: new ObjectId(id) };
      const options = {
        $set: updatedDocument,
      };
      const result = await myCollegeCollection.updateOne(query, options);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
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
  res.send("Scholaro server is running");
});

app.listen(port, () => {
  console.log(`Scholaro server is on port: ${port}`);
});
