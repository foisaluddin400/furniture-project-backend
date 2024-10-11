const express = require("express");
const cors = require('cors');
const app = express();
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);







const uri = 'mongodb://localhost:27017'
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlk7a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
    await client.connect();

    const database = client.db("furniture")
    const menuCollection = database.collection("menu")

    const cartdatabase = client.db("furniture")
    const cartCollection = cartdatabase.collection("carts")

    const adressdatabase = client.db("furniture")
    const adressCollection = adressdatabase.collection("adress")

    const userdatabase = client.db("furniture")
    const userCollection = userdatabase.collection("users")

    const paymentdatabase = client.db("furniture")
    const paymentCollection = paymentdatabase.collection("payments")





    // eti useSecure e used hoice jate amra sohoje userHome e dekhaite pari
    //middlewared
    const verifyToken = (req, res, next) => {
      console.log("inside verified token", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "fordibben access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "fordibben access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.get('/menu', async(req, res) => {
        const cursor = menuCollection.find()
        const result = await cursor.toArray();
        res.send(result)
    });
//product details
   // prodict add api
   app.post('/menu', verifyToken, verifyAdmin, async(req, res) => {
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

      app.delete('/menu/:id',verifyToken,verifyAdmin, async(req, res) => {
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
      app.patch('/menu/:id', verifyToken,verifyAdmin, async(req, res) => {
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

      app.get("/users", verifyToken, verifyAdmin,  async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });


      // admin related api jwt
    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });


//user delete
      app.delete("/users/:id",verifyToken,verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      });
      //user k admin korar jonno update
      app.patch("/users/admin/:id",verifyToken, verifyAdmin, async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              role: "admin",
            },
          };
          const result = await userCollection.updateOne(filter, updatedDoc);
          res.send(result);
        }
      );

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



      

      //jwt
        app.post("/jwt", async (req, res) => {
          //jwt create korci eti authprovider e giyece 1st-step
          const user = req.body;
          const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
            expiresIn: "1h",
          });
          res.send({ token });
        });
 

        //payment 
        app.post('/create-payment-intent', async(req, res) => {
          const {price} = req.body;
          const amount = parseInt(price * 100);
          console.log(amount,'amount inside the intent')
    
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
          })
          res.send({clientSecret: paymentIntent.client_secret})
        });

         // Check if user has an address
    app.get('/check-address/:email', async (req, res) => {
      const email = req.params.email;
      const existingAddress = await adressCollection.findOne({ user: email });
      if (existingAddress) {
        res.send({ hasAddress: true });
      } else {
        res.send({ hasAddress: false });
      }
    });

    
        app.get('/payments/:email', verifyToken, async(req, res) => {
          const query ={email: req.params.email}
          if(req.params.email !== req.decoded.email){
            return res.status(403).send({ message: 'forbidden access' });
          }
          const result = await paymentCollection.find(query).toArray();
          res.send(result);
        });
    
        app.post('/payments', async(req, res) => {
          const payment = req.body;

          
          const paymentResult = await paymentCollection.insertOne(payment)
          console.log('payment info', payment);
          const query = {
            _id:{
              $in : payment.cartIds.map(id => new ObjectId(id))
            }
          };
          const deletResult = await paymentCollection.deleteMany(query);
          res.send({paymentResult, deletResult})
        });

        app.get('/payments', verifyToken,verifyAdmin, async(req, res) => {
          const cursor = paymentCollection.find()
          const result = await cursor.toArray();
          res.send(result)
      });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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