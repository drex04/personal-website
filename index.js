const express = require('express');
const app = express();
var port = process.env.PORT || 80

app.listen(port, () => console.log(`Server is listening on port ${port}...`));

app.use(express.static('public'));