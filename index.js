const express = require('express')
const cors = require('cors')
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send("server is running")
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwkdxvy.mongodb.net/?retryWrites=true&w=majority`;
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
    client.connect();


    const classCollection = client.db('Alldata').collection('classes')
    const usersCollection = client.db('Alldata').collection('users')
    const instructorCollection = client.db('Alldata').collection('instructor')
    const selectCollection = client.db('Alldata').collection('select')
    const enrolCollection = client.db('Alldata').collection('enrol')



    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already Exits' })
      }
      
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users',async(req,res)=>{
      const result =  await usersCollection.find().toArray();
      res.send(result)
    })
    // user admin 
    app.patch('users/admin/:id', async(req,res)=>{
      const id = req.params.id
      const filter = { _id : new ObjectId(id)}
      const updateDoc = {
        $set : {
          role : 'admin'
        },

      };
      const result = await usersCollection.updateOne(filter,updateDoc)
      res.send(result)
    })
    app.delete('users/:id', async(req,res)=>{
      const id = req.params.id
      const filter = { _id : new ObjectId(id)}
      const result = await usersCollection.deleteOne(filter)
      res.send(result)
    })


    app.get('/classes', async (req, res) => {
      const result = await classCollection.find().toArray()
      res.send(result)
    })

    app.get('/instructor', async (req, res) => {
      const result = await instructorCollection.find().toArray()
      res.send(result)
    })
    app.get('/selects', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([])
      }
      const query = { email: email }
      const result = await selectCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/selects', async (req, res) => {
      const item = req.body
      const result = await selectCollection.insertOne(item)
      res.send(result)
    })

    // delet selct class api 
    app.delete('/selects/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await selectCollection.deleteOne(query)
      res.send(result)
    })
    // update class enrol api 


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log('server is running is this ' + port)
})