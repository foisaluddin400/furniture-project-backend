const express = require("express");
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());








const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlk7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("furniture")
    const menuCollection = database.collection("menu")

    const cartdatabase = client.db("furniture")
    const cartCollection = cartdatabase.collection("carts")

    const adressdatabase = client.db("furniture")
    const adressCollection = adressdatabase.collection("adress")

    const userdatabase = client.db("furniture")
    const userCollection = userdatabase.collection("users")



    app.get('/menu', async(req, res) => {
        const cursor = menuCollection.find()
        const result = await cursor.toArray();
        res.send(result)
    });
//product details
   // prodict add api
   app.post('/menu', async(req, res) => {
    const user = req.body;
    console.log(user)
    const result = await menuCollection.insertOne(user);
    res.send(result)
   });
    app.get('/menu/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await menuCollection.findOne(query);
        res.json(product);
      });

      app.delete('/menu/:id', async(req, res) => {
        const id = req.params.id;
        const query ={_id: new ObjectId(id)};
        const result = await menuCollection.deleteOne(query);
        res.send(result)
      });


      app.get('/menu/:id', async(req, res) => {
        const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await menuCollection.findOne(query);
      res.send(result);
      });
      app.patch('/menu/:id', async(req, res) => {
        const id = req.params.id;
        const item = req.body;
        const filter ={_id :new ObjectId(id)};
        const updateDoc ={
          $set:{
            title : item.title,
            category: item.category,
            price: item.price,
            description:item.description,
            img: item.img,
            color: item.color,
          }
        }
        const result = await menuCollection.updateOne(filter,updateDoc);
        res.send(result)
      });

      //menu update

      //add to cart 
      app.post('/carts', async(req, res) => {
        const user = req.body;
        const result = await cartCollection.insertOne(user);
        res.send(result)
      });
      app.get('/carts', async(req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const cursor = cartCollection.find(query);
        const result = await cursor.toArray()
        res.send(result)
      });
      app.delete('/carts/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await cartCollection.deleteOne(query);
        res.send(result)
      });


      //user relted api
      app.post('/users', async(req, res) => {
        const user = req.body;
        const query = {email: user.email};
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'User already exists', insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      // adress releted api
      app.get('/adress', async(req, res) => {
        const email = req.query.email;
        const query = {user:email};
        const cursor = adressCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });
      app.post('/adress', async(req, res) => {
        const user = req.body;
        const existingAdress = await adressCollection.findOne({user: user.user});
        if(existingAdress){
          return res.status(400).send({message : 'Address already exists for this user.'});
        }
        const result = await adressCollection.insertOne(user);
        res.send(result)

      });

      app.put('/adress/:id', async(req, res) => {
        const id = req.params.id;
        const updatedAdress = req.body;
        const query = {_id:new ObjectId(id)};
        const result = await adressCollection.updateOne(query, {$set: updatedAdress});
        res.send(result)
      });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('purniture server running')
});
app.listen(port, () => {
    console.log(`Server started on port, ${port}`);
});