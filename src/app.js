const express = require('express')
const path = require('path')
const TransactionChecker = require('./utils.js')

const staticPath = path.join(__dirname,"../static")

// let turi = 'https://rinkeby.infura.io/v3/5913b17fab8d4a5e93a0c8af1b366ff6' // rinkeby

let turi = 'https://ropsten.infura.io/v3/5913b17fab8d4a5e93a0c8af1b366ff6' //ropsten

let checker = new TransactionChecker(turi)
checker.initiate()

setInterval(async () => {
    await checker.checkTransactions()
},1000)


///Express work starts here

const port = process.env.PORT || 3000
const app = express()

app.use(express.static(staticPath))

app.get('/', (req, res) => {
    console.log(req.query)
    if(req){
        console.log(req)
        return
    }
    res.send()
})

app.get('/address',(req, res) => {
    if(req.query && req.query.option){
        let address = req.query.address;
        let response = checker.showData(address)
        return res.send(response)
    }
    else if(req.query){
        let address = req.query.address;
        let response = checker.addUser(address);
        console.log(`address = ${address}, response = ${response.status}`)
        return res.send(response)
    }
})

app.get('*',(req, res) => {
    res.send("404! Not Found");
})

app.listen(port, () => {
    console.log(`server running in port ${port}`);
})

