const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))
//All your code goes here
let activeSessions={}
server.get("/newgame", (req,res)=>{
    let setWord = req.query.answer
    let generated="apple"
    let over=false
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
        gameOver: over,
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
server.post("/guess", (req,res)=>{
    let ID=req.body.sessionID
    let guess=req.body.guess
    if(!ID){
        res.status(400)
        res.send({error: "id is missing"})
    }else{
        if(activeSessions[ID]){
            let game=activeSessions[ID]
            let guessCheck=guess.split("")
            if(guessCheck.length!=5){
                res.status(400)
                res.send({error:"guess is not 5 letters long"})
            }
            let word=game.wordToGuess.split("")
            let guessArr=[]
            game.remainingGuesses-=1
            if(guess==game.wordToGuess){
                game.gameOver=true
                game.rightLetters=guessCheck
            }else{
                for (let i = 0; i < guessCheck.length; i++) {
                    let included=false
                    let guessObj={
                        value:guessCheck[i]
                    }
                    for (let j = 0; j < word.length; j++) {
                        if(word[j]==guessCheck[i]){
                            if(j==i){
                                game.rightLetters.push(guessCheck[i])
                                guessObj.result="RIGHT"
                            }else{
                                game.closeLetters.push(guessCheck[i])
                                guessObj.result="CLOSE"
                            }
                            included=true
                        }
                    }
                    if(included==false){
                        game.wrongLetters.push(guessCheck[i])
                        guessObj.result="WRONG"
                    }
                    guessArr.push(guessObj)
                }
            }
            if(game.remainingGuesses==0){
                game.gameOver=true
            }
            game.guesses.push(guessArr)
            res.status(201)
            res.send({gameState: game})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})
// server.delete("/reset", (req,res)=>{
    
// })
// server.delete("/delete", (req,res)=>{
    
// })

//Do not remove this line. This allows the test suite to start
//multiple instances of your server on different ports
module.exports = server;