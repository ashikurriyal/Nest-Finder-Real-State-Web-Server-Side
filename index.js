const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
const app = express()
require ('dotenv').config()
const port = process.env.PORT || 5300;


app.use(express.json())
app.use(cors());


app.get('/', (req, res) => {
    res.send('Nest Finder Server is OnGoing!')
})
app.listen(port, () => {
    console.log(`Server is running on port${port}`)
})