const express = require("express");
const uuid = require("uuid")
const server = express();
server.use(express.json())
server.use(express.static('public'))
//All your code goes here
let activeSessions={}
let wordList=[]
let wordGenereated
async function chooseWordAPI(){
    let response = await fetch("https://random-word-api.herokuapp.com/all")
    let data = await response.json()
    for (let i = 0; i < data.length; i++) {
        if(data[i].split("").length==5){
            wordList.push(data[i])
        }
    }
}
async function wordOfDay(){
    let response = await fetch("https://random-word-api.herokuapp.com/word?length=5")
    let data = await response.json()
    wordGenereated=data[0]
}
server.get("/newgame", (req,res)=>{
    chooseWordAPI()
    wordOfDay()
    let setWord = req.query.answer
    if(!setWord||setWord.length!=5){
        setWord=wordGenereated
    }
    let newID = uuid.v4()
    let newGame = {
        wordToGuess: setWord,
        guesses:[],
        wrongLetters: [],
        closeLetters: [],
        rightLetters: [],
        remainingGuesses: 6,
        gameOver: false,
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
                res.send({error: "guess is not 5 letters long"})
            }else if(!wordList.includes(guess)){
                res.status(400)
                res.send({error: "guess is not a real word"})
            }
            let word=game.wordToGuess.split("")
            let guessArr=[]
            game.remainingGuesses-=1
            for (let i = 0; i < guessCheck.length; i++) {
                let guessLetter=guessCheck[i].toLowerCase()
                if(guessLetter.toLowerCase() == guessLetter.toUpperCase()){
                    res.status(400)
                    res.send({error: "guess contains a number or a special character"})
                }else{
                    let included=false
                    let guessObj={
                        value:guessLetter
                    }
                    for (let j = 0; j < word.length; j++) {
                        if(word[j]==guessLetter){
                            if(j==i){
                                if(game.closeLetters.includes(guessLetter)){
                                    let index=game.closeLetters.indexOf(guessLetter)
                                    game.closeLetters.splice(index,1)
                                }
                                if(game.rightLetters.includes(guessLetter)){
                                    let index=game.rightLetters.indexOf(guessLetter)
                                    game.rightLetters.splice(index,1)
                                }
                                game.rightLetters.push(guessLetter)
                                guessObj.result="RIGHT"
                            }else{
                                if(!game.rightLetters.includes(guessLetter)){
                                    if(game.closeLetters.includes(guessLetter)){
                                        let index=game.closeLetters.indexOf(guessLetter)
                                        game.closeLetters.splice(index,1)
                                    }
                                    game.closeLetters.push(guessLetter)
                                    guessObj.result="CLOSE"
                                }
                            }
                            included=true
                        }
                    }
                    if(included==false){
                        game.wrongLetters.push(guessLetter)
                        guessObj.result="WRONG"
                    }
                    guessArr.push(guessObj)
                }
            }
            if(guess==game.wordToGuess){
                game.gameOver=true
                game.rightLetters=guessCheck
            }
            if(game.remainingGuesses==0){
                game.gameOver=true
            }
            game.guesses.push(guessArr)
            res.status(201)
            console.log(game)
            res.send({gameState: game})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})
server.delete("/reset", (req,res)=>{
    let ID= req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "id is missing"})
    }else{
        if(activeSessions[ID]){
            let newGame = {
                wordToGuess: undefined,
                guesses:[],
                wrongLetters: [],
                closeLetters: [],
                rightLetters: [],
                remainingGuesses: 6,
                gameOver: false,
            }
            activeSessions[ID] = newGame
            res.status(200)
            res.send({gameState: activeSessions[ID]})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})
server.delete("/delete", (req,res)=>{
    let ID= req.query.sessionID
    if(!ID){
        res.status(400)
        res.send({error: "id is missing"})
    }else{
        if(activeSessions[ID]){
            delete activeSessions[ID]
            res.status(204)
            res.send({gameState: activeSessions})
        }else{
            res.status(404)
            res.send({error: "game doesn't exist"})
        }
    }
})