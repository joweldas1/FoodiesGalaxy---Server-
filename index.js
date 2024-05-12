const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const app = express()
const port =process.env.PORT||3000


app.use(cors({ origin: [
  "http://localhost:5173",
  "https://foodies-galaxy-server.vercel.app",
  "https://foodiesgalaxy-3cae2.web.app",
],
credentials: true,}))

app.use(express.json())
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
// };


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mwwnz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017"
      //  const uri=  "mongodb://localhost:27017/?directConnection=true"

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
    const restaurantUpload = client.db("FoodiesGalaxy").collection("restaurantMeal");
    const customerOrder = client.db("FoodiesGalaxy").collection("customerOrder");
    const userPostedData = client.db("FoodiesGalaxy").collection("userPostedData")


    //resturat home data 
    app.post("/todays-meal",async (req,res)=>{
      const data = req.body
      console.log(data);
      const result = await restaurantUpload.insertOne(data)
      res.send(result)
    })
    
    app.post('/updatePurchase/:id',async(req,res)=>{
      const query = {_id:new ObjectId(req.params.id)}
      const totalSell = req.body;
      const update = {$set:totalSell}
      const result = await restaurantUpload.updateOne(query,update)
      console.log(result);
      res.send(result)
      
    })

    app.get("/all-food",async(req,res)=>{
      const data = await restaurantUpload.find().toArray()
      res.send(data)
    })

    app.get('/todaysMeal',async(req,res)=>{
      const category = req.query.category;
      const sort = req.query.sort;
      const sell = req.query.sell;
      const searchQuery = req.query.search
      const search=String(searchQuery)

      let query = {}
      let sortQuery={}


      if(category) query.category=category;
      if(search) query.foodName={$regex:search , $options:'i'}
      if(sell)sortQuery.totalSell=(sort==="asc")?1:-1;
      if(sort) sortQuery.price=(sort==="asc")?1:-1;

      const data = await restaurantUpload.find(query).sort(sortQuery).toArray()
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

    //-----> User Posted post, get API
    app.post('/user-post',async(req,res)=>{
      const data = req.body;
      const result = await userPostedData.insertOne(data)
      res.send(result)
    })

    app.get('/posted-data',async(req,res)=>{
      const result = await userPostedData.find().toArray()
      res.send(result)
    })

    //-----> single use data get and delete
    app.get('/user-uploaded/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {'uploadData.email':email}
      
      const result = await userPostedData.find(query).toArray()
      res.send(result)
    })
    

    app.delete('/delete-user-post/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await userPostedData.deleteOne(query)
      res.send(result)
    })

    app.get('/update-user-post/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await userPostedData.findOne(query)
      res.send(result)
    })


    app.put('/update-user-post/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const options ={upsert:true}
      const updateData = req.body
      const uploadServer ={
        $set:{
          "uploadData.imgURL":updateData.imgURL,
          "uploadData.itemName":updateData.itemName,
          "uploadData.country":updateData.country,
          "uploadData.review":updateData.review,
          "uploadData.ingredients":updateData.ingredients,
          "uploadData.description":updateData.description,
          "uploadData.updatedTime":updateData.updatedTime
        }
      }
      const result = await userPostedData.updateOne(query,uploadServer,options);
      res.send(result)

    })
  //  app.put('/update/:id',async(req,res)=>{
  //     const id={_id:new ObjectId(req.params.id)}
  //     const updateData=req.body;
  //     const options = {upsert:true}
  //     console.log(updateData);
  //     const updatedToServer={
  //       $set:{
  //         image:updateData.image,
  //         tourists_spot_name:updateData.tourists_spot_name,
  //         country_Name:updateData.country_Name,
  //         location:updateData.location,
  //         description:updateData.description,
  //         cost:updateData.cost,
  //         seasonality:updateData.seasonality,
  //         travel_time:updateData.travel_time,
  //         totalVisitorsPerYear:updateData.totalVisitorsPerYear,
  //       }
  //     };
  //     const result=await userData.updateOne(id,updatedToServer,options)
  //     res.send(result)


  //   })

    




   
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