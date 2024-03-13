import http from "http";
import {app} from "./app";
import { conn } from "./dbconnect";



const port = process.env.port || 3000;
const server = http.createServer(app);


conn.connect((err)=>{
    if(err){
        console.log("Connect database fail" , err)
        return;
    }
    console.log("Success connect")

})


server.listen(port, ()=>{
    console.log("Server is started now!");
})