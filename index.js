const express = require('express');

const cors = require('cors');
// express app chalou korar jonno
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');

// middleware use
app.use(cors());
app.use(express.json());


// undurstanding root
app.get('/', (req, res) => {
    res.send('Food making server is running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ldebrq.mongodb.net/?retryWrites=true&w=majority`;

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

        //------------------------- Restaurant Management all collection---------------------------------

        const foodCollection = client.db("restaurantDB").collection("foods")
        const orderCollection = client.db("restaurantDB").collection("carts")

        //------Read------------my all app.get collection restaurantDB code start hare-----------Read---------

        // get foods collection
        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray()
            res.send(result)

        })

        // this line code clint side home page top food collection app.get 
        app.get('/topFood', async (req, res) => {
            // console.log("ami ata dekte chai",req.query.topFood);
            let query = {};
            if (req.query?.topFood) {
                // query = { email: req.query.email }
                query = { topFood: req.query.topFood }
            }
            const result = await foodCollection.find(query).toArray();
            res.send(result);
        })

        // in this line of code i read specify single data in food collection

        app.get('/singleDetails/:id', async (req, res) => {
            const id = req.params.id;
            // console.log("singleDetails id:  ",id)

            const query = { _id: new ObjectId(id) }
            // console.log("this is query:   ",query)

            const result = await foodCollection.findOne(query);
            // console.log("find single data: ", result)
            res.send(result)
        })



        //--------------------- below this code i do not use but it work perfect----------------------
        // app.get('/Search', async (req, res) => {
        //     // console.log("ami ata dekte chai",req.query.topFood);
        //     let query = {};

        //     if (req.query?.FoodName) {
        //         // query = { email: req.query.email }
        //         query.FoodName = {$regex: req.query.FoodName, $options:"i"}
        //     }

        //     const result = await foodCollection.find(query).toArray();
        //     res.send(result);
        // })
        // -----------------------------------------------------------------------------------------------------

        //------Create------------my all app.get collection restaurantDB code start hare-----------Create---------

        app.post('/foods', async (req, res) => {
            const newFoods = req.body;
            // console.log(newBrand)
            const result = await foodCollection.insertOne(newFoods);
            res.send(result)
        })



        app.post('/carts', async (req, res) => {
            const newOrder = req.body;
            // console.log(newBrand)
            const result = await orderCollection.insertOne(newOrder);
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







// last use
app.listen(port, () => {
    console.log(`Food server is running port: ${port}`)
})
