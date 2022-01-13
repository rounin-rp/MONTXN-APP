console.log('client side javascript')

const addForm = document.querySelector('#add')
const address = document.querySelector('#address')
const message = document.querySelector('#msg1')


addForm.addEventListener('submit',(e) => {
    e.preventDefault();
    console.log("submit",address.value)
    if(address.value){
        let uri = "http://localhost:3000/address?address="+address.value;
        fetch(uri).then((response)=>{
            response.json().then((data) => {
                console.log(data)
                message.textContent = data.reason;
            })
        })
    }
    else{
        message.textContent = "Please provide address!"
    }
})

const seeForm = document.querySelector('#show')
const address2 = document.querySelector('#address2')
const usermessage = document.querySelector("#msg2")
const usermessage2 = document.querySelector("#msg3")

seeForm.addEventListener('submit',(e) => {
    e.preventDefault();
    if(address2.value){
        let uri = "http://localhost:3000/address?address="+address2.value+"&option=1";
        fetch(uri).then((response) => {
            response.json().then((data) => {
                let msg; 
                let msg2;
                if(data.data != {}){
                    let ethsent = data.data.sent;
                    let ethrecv = data.data.received;
                    let ethPrice = data.USD;
                    let time = data.data.time;
                    let usdsent = parseFloat(ethsent) * parseFloat(ethPrice);
                    let usdreceived = parseFloat(ethrecv) * parseFloat(ethPrice);
                    let totalusd = usdreceived + usdsent;

                    msg = `ETH sent = ${ethsent}, ETH received = ${ethrecv} since ${time}`;
                    msg2 = `USD sent = ${usdsent}, USD received = ${usdreceived}, total usd = ${totalusd}`;
                }
                usermessage.textContent = msg;
                usermessage2.textContent = msg2;
            })
        })
    }
    else{
        usermessage.textContent = "Please provide address"
    }
})
