async function main() {
  console.log(`Preparing deployment... \n`)
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  const accounts = await ethers.getSigners()

  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)
  
  // Deploy contract
  const colbanca = await Token.deploy('ColBanca', 'CBNK', '1000000')
  await colbanca.deployed()
  console.log(`Colbanca Deployed to: ${colbanca.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', '1000000')
  await mETH.deployed()
  console.log(`mETH Deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
  await mDAI.deployed()
  console.log(`mDAI Deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 1)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// run this in the terminal after 'npx hardhat node' --> npx hardhat run --network localhost scripts/1_deploy.js , the network should be the same as in your hardhat config