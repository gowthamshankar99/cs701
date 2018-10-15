const express = require('express');

const app = express();

app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/angular_Scripts"));


app.listen(8005,function() {
    console.log("Listening on port 8005");
}) 