const express = require('express');
const app = express();
app.use(require('cors')());
app.use(express.json());
const auth = require('./routes/auth');
app.use('/api/auth', auth);
app.listen(5000, () => console.log('Listening 5000'));
