const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))
//All your code goes here
let activeSessions={}
server.get("/newgame", (req,res)=>{
    let setWord = req.query.answer
    let generated="niger"
    let over=false
    if(setWord==generated){
        over=true
    }
    if(!setWord||setWord.length!=5){
        setWord=generated
    }
    let newID = uuid.v4()
    let newGame = {
        wordToGuess: setWord,
        guesses:[],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: over
    }
    activeSessions[newID] = newGame
    res.status(201)
    res.send({sessionID: newID})
})

server.get("/gamestate", (req,res)=>{
    let ID= req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "id is missing"})
    }else{
        if(activeSessions[ID]){
            res.status(200)
            res.send({gameState: activeSessions[ID]})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})
// server.post("/guess", (req,res)=>{
    
// })
// server.delete("/reset", (req,res)=>{
    
// })
// server.delete("/delete", (req,res)=>{
    
// })

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;