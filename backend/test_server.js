const express = require('express');
const app = express();
require('./db.js'); // check if db.js kills it
app.listen(5002, () => console.log('Listening with db.js'));
