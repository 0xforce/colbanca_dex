const config = require('../config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    const accounts = await ethers.getSigners()

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log('Chain ID:', chainId)

    const CBNK = await ethers.getContractAt('Token', config[chainId].CBNK.address)
    console.log(`CBNK Token fetched: ${CBNK.address}\n`)

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mETH Token fetched: ${mETH.address}\n`)

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI Token fetched: ${mDAI.address}\n`)

    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}\n`)

    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    let transaction, result

    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000)

    // user1 approves 10,000 CBANK...
    transaction = await CBNK.connect(user1).approve(exchange.address, amount);
    await transaction.wait()
    console.log(`${user1.address} approved the transfer of ${amount}`)

    //user1 deposits 10,000 CBNK...
    transaction = await exchange.connect(user1).depositToken(CBNK.address, amount);
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

    //user2 Approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address, amount);
    await transaction.wait();
    console.log(`Amount ${amount} tokens from ${user2.address}`);

    //user2 deposits to exchange
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user2.address}\n`)

    // Seed a canceled Order

    //user1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), CBNK.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //user 1 cancels order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    //wait 1 second
    await wait(1)

    //Seed filled Orders

    //user1 makes order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), CBNK.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //user 2 fill order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //user 1 makes another order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), CBNK.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //user 2 fill order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //user 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), CBNK.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    //user 2 fills final order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    ///////////////////////////////////////
    ///Seed Open Orders

    // User 1 makes 10 orders
    for(let i=1; i <= 10; i++) {
      transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), CBNK.address, tokens(10))
      result = await transaction.wait()

      console.log(`Made order from ${user1.address}`)
    }

    await wait(1)

    // User 2 makes 10 orders
    for(let i=1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(CBNK.address, tokens(10), mETH.address, tokens(10 * i))
        result = await transaction.wait()
  
        console.log(`Made order from ${user2.address}`)
    }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
