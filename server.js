const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())


//All your code goes here
let activeSessions={}
server.use(express.static('public'))
server.get("/newgame", (req,res)=>{
    
})
server.get("/gamestate", (req,res)=>{
    
})
server.post("/guess", (req,res)=>{
    
})
server.delete("/reset", (req,res)=>{
    
})
server.delete("/delete", (req,res)=>{
    
})

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;