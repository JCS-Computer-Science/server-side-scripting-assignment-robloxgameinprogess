async function chooseWordAPI(){
    let response = await fetch("https://random-word-api.herokuapp.com/word?number=10000&length=5")
    let data = await response.json()
    console.log(data)
    return data
}
let wordList=[]
wordList=chooseWordAPI()
console.log(wordList)