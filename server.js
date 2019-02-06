const express = require('express');

const app = express();

console.log(__dirname)
app.use(express.static("/usr/dir/angular_scripts/"));
app.use(express.static("/usr/dir/views"));


app.listen(8005,function() {
    console.log("Listening on port 8005");
}) 

// 6d58c64d97mshc432e7d010d76b4p1c1e3djsnad9212352000