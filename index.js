const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5300;


app.use(express.json())
app.use(cors());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozyesnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        //await client.connect();
        // Send a ping to confirm a successful connection
        //await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Collections
        const usersCollection = client.db('NestFinderDB').collection('users')
        const propertiesCollection = client.db('NestFinderDB').collection('properties')


        //users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const assignment = req.body;
            const result = await usersCollection.insertOne(assignment)
            res.send(result);
        })

        //Collectuser

        app.get('/collectUser/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }

            const result = await usersCollection.findOne(query)
            res.send(result);
        })




        //admin role
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })

        //agent role
        app.patch('/agents/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'agent'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.get('/agents', async (req, res) => {
            const email = req.query.email
            // console.log(email)
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let agent = false
            if (user) {
                agent = user?.role === 'agent'
            }
            res.send({ agent })
        })

        //add property from agent
        app.post('/properties', async (req, res) => {
            const property = req.body;
            const result = await propertiesCollection.insertOne(property)
            res.send(result)
        })

        //my added property api by email
        app.get('/properties', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = { agentEmail: email }
            const result = await propertiesCollection.find(query).toArray()
            res.send(result)


        })

        //manage properties for admin from properties, where load all properties
        app.get('/allProperties', async (req, res) => {
            const result = await propertiesCollection.find().toArray()
            res.send(result)
        })



        //verify or reject property
        app.patch('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const { status } = req.body; // Get the status from the request body
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: status // Update the status based on the request body
                }
            };
            const result = await propertiesCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });




    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Nest Finder Server is OnGoing!')
})
app.listen(port, () => {
    console.log(`Server is running on port${port}`)
})