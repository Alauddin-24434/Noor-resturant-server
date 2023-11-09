const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const cors = require('cors');
// express app chalou korar jonno
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors({

    origin: ['http://localhost:5173', 'https://resturent-5e702.web.app'],
    credentials: true // You can include this if you need to send cookies or authorization headers.
}));

// middleware use
// app.use(cors());
app.use(express.json());


app.use(cookieParser());



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

// middlewares
const logger = (req, res, next) => {
    console.log('log: info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log('token in the middleware', token);
    // no token available 
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)




        //------------------------- Restaurant Management all collection---------------------------------

        const foodCollection = client.db("restaurantDB").collection("foods")
        const orderCollection = client.db("restaurantDB").collection("carts")
        const userAddCollection = client.db("restaurantDB").collection("users")

        //------Read------------my all app.get collection restaurantDB code start hare-----------Read---------
        // auth related api
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                // sameSite: 'none'
            })
                .send({ success: true });
        })
        app.post('/logout', async (req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // Get all foods or implement pagination
        app.get('/foods', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const pageSize = 9;

            try {
                if (page === 1) {
                    // If page is 1, fetch all foods
                    const cursor = foodCollection.find();
                    const result = await cursor.toArray();
                    res.send(result);
                } else {
                    // For other pages, implement pagination
                    const cursor = foodCollection.find()
                        .skip((page - 1) * pageSize)
                        .limit(pageSize);

                    const result = await cursor.toArray();
                    res.send(result);
                }
            } catch (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });



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
        // ...

        // Read app.get orderCollection
        app.get('/carts', logger, verifyToken, async (req, res) => {
            console.log(req.query.email);
            console.log('token owner info', req.user)
            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }

            const result = await orderCollection.find(query).toArray();
            res.send(result);
        });



        app.post('/foods', async (req, res) => {
            const newFoods = req.body;
            // console.log(newBrand)
            const result = await foodCollection.insertOne(newFoods);
            res.send(result)
        })



        app.post('/orderingPage', async (req, res) => {
            const newOrder = req.body;
            // console.log(newBrand)
            const result = await orderCollection.insertOne(newOrder);
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const newOrder = req.body;
            // console.log(newBrand)
            const result = await userAddCollection.insertOne(newOrder);
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const cursor = userAddCollection.find();
            const result = await cursor.toArray()
            res.send(result)

        })
        // Read app.get orderCollection
        app.get('/addedUser', async (req, res) => {
            console.log(req.query.email);
            console.log('token owner info', req.user)
            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }

            const result = await userAddCollection.find(query).toArray();
            res.send(result);
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







// last use
app.listen(port, () => {
    console.log(`Food server is running port: ${port}`)
})
