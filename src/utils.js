const Web3 = require('web3') //web 3 

const rp = require('request-promise'); // to send request to coin market cap api


const uri = 'https://rinkeby.infura.io/v3/5913b17fab8d4a5e93a0c8af1b366ff6' // uri for the ethereum network



//////// Function that gets the current ehtereum Price///////////

async function getPrice(){
    var ethPrice;

    //request object for the coin market api
    const requestOptions = {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
        qs: {
            'id' : '1027', // ethereum id in coin market cap
            'convert': 'USD' // convert the eth to usd
        },
        headers: {
          'X-CMC_PRO_API_KEY': '89cdad88-eddc-4e6a-82bd-7ec47ac287aa' // api header
        },
        json: true,
        gzip: true
    };

    let response = await rp(requestOptions);  // get the json response from the cmc api
    ethPrice = parseFloat(response.data['1027'].quote.USD.price);  // get eth price from the response object
    return ethPrice;
}

////////////////////////////////////////////////////////////////////



///////////////// User Object ///////////////////////////////////
function userObject(address, time){
    this.address = address;
    this.sent = 0;
    this.received = 0;
    this.time = time;
}

//////////////////////////////////////////////////////////////////



///////////////Transaction Checker Class /////////////////////////
class TransactionChecker{
    web3; // web3 object
    user; // user object dictionary
    prevBlock; // last block number
    currBlock; // current block number
    ethPrice; // current ethereum price

    constructor(uri){
        this.web3 = new Web3(uri); // initiliaze the web3 object
        this.user = {}; // user dict
    }

    //Function to add a new address to monitor ------ Create a condition if user is already added 
    addUser(address){
        address = address.toLowerCase();
        if(this.user[address]){
            return {
                status : false,
                reason : 'User already added!'
            }
        }
        else{
            let user = new userObject(address,this.getDateTime());
            this.user[address] = user;
            return {
                status : true,
                reason : 'User successfully added!'
            }
        }
        
    }

    //Function to get the current date time
    getDateTime(){
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        return dateTime;
    }

    //Function to show data of the user
    showData(address){
        address = address.toLowerCase()
        if(this.user[address]){
            return {
                'status' : true,
                'data' : {
                    'sent' : this.web3.utils.fromWei(this.user[address].sent.toString()),
                    'received' : this.web3.utils.fromWei(this.user[address].received.toString()),
                    'time' : this.user[address].time,
                },
                'USD' : this.ethPrice,
            }
        }
        else{
            return {
                'status' : false,
                'data' : {}
            }
        }
    }

    //Function to display the output in console
    display(user){
        console.log(`${user.address} sent: ${user.sent} wei and received: ${user.received} wei since: ${user.time}`);
        let sentUSD = this.ethPrice * parseFloat(this.web3.utils.fromWei(user.sent.toString()));
        let recvUSD = this.ethPrice * parseFloat(this.web3.utils.fromWei(user.received.toString()));
        console.log(`USD sent = ${sentUSD}, USD received = ${recvUSD}, total = ${sentUSD+recvUSD}`);
    }

    //Function that fetches current block number from the ethereum blockchain
    async fetchBlockNumber(){
        let blockNumber = await this.web3.eth.getBlockNumber();
        return blockNumber;
    }

    //Function that fetches the number of transactions in blocknumber of ethereum blockchain
    async fetchNumberOfTransactions(blockNumber){
        let txno = await this.web3.eth.getBlockTransactionCount(blockNumber);
        return txno;
    }


    //Function that fetches the transaction using the transaction hash from the ethereum blockchain
    async fetchTransaction(txhash){
        let transaction = await this.web3.eth.getTransaction(txhash);
        return transaction;
    }

    //Function that fetches the whole block from the ethereum blockchain using the block number provided
    async fetchBlock(blocknumber){
        let block = await this.web3.eth.getBlock(blocknumber);
        return block;
    }

    //Function to initiate after constructor
    async initiate(){
        this.prevBlock = await this.fetchBlockNumber();
        this.ethPrice = await getPrice();
        console.log(`eth price = ${this.ethPrice}`);
    }

    //Whole operation performed in this function 
    async checkTransactions(){
        this.currBlock = await this.fetchBlockNumber(); // get current block number
        
        if(this.currBlock > this.prevBlock){ // check if the block has increased in the blockchain
            while(this.prevBlock < this.currBlock){ // loop from last checked block to current block
                this.prevBlock++;

                //fetch block one by one
                var block = await this.fetchBlock(this.prevBlock);

                //check if block is not null and block contains transactions
                if(block != null && block.transactions != null){

                    //get each transaction hash from the block
                    for(let txhash of block.transactions){
                        //get the transaction from the transaction hash
                        let transaction = await this.fetchTransaction(txhash);

                        //check if any address being monitored is a receiver on the current transaction
                        if(transaction.to != null && this.user[transaction.to.toLowerCase()]){
                            let address = transaction.to.toLowerCase();

                            //record the received amount
                            this.user[address].received += parseInt(transaction.value);
                            
                            console.log(`received : ${transaction.value}`);
                            this.display(this.user[address]);
                        }

                        //check if any address being monitored is a sender on the current transaction
                        if(transaction.from != null && this.user[transaction.from.toLowerCase()]){
                            console.log(transaction.from);
                            let address = transaction.from.toLowerCase();

                            // record the sent amount 
                            this.user[address].sent += parseInt(transaction.value);

                            console.log(`sent : ${transaction.value}`);
                            this.display(this.user[address]);
                        }
                    }
                }
            }
        }
    }
}


module.exports = TransactionChecker;

// let checker = new TransactionChecker(uri);
// checker.addUser('0xb819fb05716CE2DEd3001039Ea0BFD1b76752D5A');

// checker.initiate();

// setInterval(async()=>{
//     await checker.checkTransactions()
// },1000);