const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const app = express()
const port =process.env.PORT||3000


app.use(cors())
app.use(express.json())



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mwwnz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017"
       const uri=  "mongodb://localhost:27017/?directConnection=true"

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
    const restaurantUpload = client.db("FoodiesGalaxy").collection("restaurantMeal")
    const customerOrder = client.db("FoodiesGalaxy").collection("customerOrder")


    //resturat home data 
    app.post("/todays-meal",async (req,res)=>{
      const data = req.body
      console.log(data);
      const {result} = await restaurantUpload.insertOne(data)
      res.send(result)
    })
    app.get('/todaysMeal',async(req,res)=>{
      const data = await restaurantUpload.find().toArray()
      res.send(data)
    })
    app.get('/food-details/:id',async(req,res)=>{
      const id = req.params.id
      const query = {_id:new ObjectId(id)}
      const data = await restaurantUpload.findOne(query)
      res.send(data)
    })

    //Ordered data 
    app.post("/customer-ordered",async(req,res)=>{
      const order = req.body;
      const result = await customerOrder.insertOne(order)
      res.send(result)
    })


    app.get('/ordered',async(req,res)=>{
     const result = await customerOrder.find().toArray()
     res.send(result)
    })

    app.get('/myOrder/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email:email}
      const result = await customerOrder.find(query).toArray()
      res.send(result)
    })


    app.get('/updateQty/:id',async(req,res)=>{
      console.log(req);
      const id = req.params.id;
      const query =  {_id:new ObjectId(id)}
      const result = await customerOrder.findOne(query)
      res.send(result)
      
    })

    app.delete('/removeOrder/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email:email}
      const result = await customerOrder.deleteMany(query)
      res.send(result)
    })

    app.patch('/updatedQuantity/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id) }
      const quantity = req.body;
      const updateData = {$set:quantity};
      const result = await customerOrder.updateOne(query,updateData)
      res.send(result)
    })

    app.patch('/updateStatus/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)};
      const status= req.body;
      const updateStatus = {$set:status}
      const result = await customerOrder.updateOne(query,updateStatus)
      res.send(result)

    })




   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
  }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })