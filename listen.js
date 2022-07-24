const app = require('./app.js');
const { PORT = 9090 } = process.env;

app.listen(PORT, (err)=>{
    if(err) console.log(err);
    else console.log(`Express server now listening on ${PORT}`);
});