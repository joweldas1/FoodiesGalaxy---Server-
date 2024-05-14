const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
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
app.use(cookieParser())



//token verify middle wire
const verifyToken=async(req,res,next)=>{
  const token = req.cookies?.token
  if(!token){return res.status(401).send({message:"Authorization failed"})}
  
  jwt.verify(token,process.env.TOKEN,(err,decode)=>{
    if(err){return res.status(403).send({message:"Forbidden Access"})}
    return req.decode=decode.loggedUser
  })
  next()
}

//user mail and token carry email verify
const authorizeUser = (req,res,next) =>{
   const tokenEmail = req.decode ;
   const userEmail = req.params.email
   if(tokenEmail!==userEmail){return res.status(403).send({message:"Forbidden request"})}
  
console.log("----->userEmail",userEmail);
console.log("----->tokenEmail",tokenEmail);
next()
  
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mwwnz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017"

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

    //token creation
    app.post("/jwt",async(req,res)=>{
      const user = req.body;
      const result = jwt.sign(user,process.env.TOKEN,{expiresIn:"365Days"})
      res
     .cookie('token',result,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({success:true})
    })

    app.get('/logout', async(req,res)=>{
      res
      .clearCookie("token",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge:0.
      })
      .send({success:true})
    })


    //resturat home data 
    app.post("/todays-meal",async (req,res)=>{
      const data = req.body
      console.log(data);
      const result = await restaurantUpload.insertOne(data)
      res.send(result)
    })
    
    app.patch('/updatePurchase/:id',async(req,res)=>{
      const query = {_id:new ObjectId(req.params.id)}
      const totalSell = req.body;
      console.log("totalSell----->",totalSell);
      const update = {$set:totalSell}
      const result = await restaurantUpload.updateOne(query,update)
      console.log(result);
      res.send(result)
      
    })

    app.get("/all-food", async(req,res)=>{
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

    app.get('/myOrder/:email',verifyToken,async(req,res)=>{
      console.log('161-->',verifyToken)
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

    app.get('/todaysMeal', async (req, res) => {
      const category = req.query.category;
      const price = req.query.price;
      const sell = req.query.sell;
      const searchQuery = req.query.search;
      const page = parseFloat(req.query.page);
      const size = parseFloat(req.query.size);  

      console.log([page,size]);
  
      let query = {};
      let sortQuery = {};
  
      if (searchQuery) {query.foodName = {$regex: searchQuery, $options: 'i'};}
      if (category) {query.category = category;}
      if (sell) {sortQuery.totalSell = (sell === "asc") ?1:-1;}
      if (price) {
        const newPrize = new RegExp(`^(${price}\\.\\d+|\\d+\\.\\d+) USD$`, 'i');
        sortQuery.price = {$regex: newPrize}}
  
      try {
        const data = await restaurantUpload.find(query).sort(sortQuery).skip((page-1)* size).limit(size).toArray();

          res.send(data);
      } catch (error) {
          res.status(500).send("Error fetching today's meals");
      }
  });
 

    app.get('/count',async(req,res)=>{
      const category = req.query.category;
      const price = req.query.price;
      const sell = req.query.sell;
      const searchQuery = req.query.search;
      const page = parseFloat(req.query.page);
      const size = parseFloat(req.query.size);  


         
      
      let query = {};
      if (searchQuery) {query.foodName = {$regex: searchQuery, $options: 'i'};}
      if (category) {query.category = category;}
      if (sell) {sortQuery.totalSell = (sell === "asc") ? -1 : 1;}
      


      const data = await restaurantUpload.countDocuments(query)
      res.send({data})
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