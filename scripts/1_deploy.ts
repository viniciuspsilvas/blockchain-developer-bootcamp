import { ethers } from "hardhat";

async function main() {

  console.log("Preparing deployment")

  // Fetch contract to deploy
  const Token = await ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange");

  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched: \n Maker :${accounts[0].address}\n Taker: ${accounts[1].address}\n FeeAccount: ${accounts[2].address}`)

  // Deploy contract
  const dapp = await Token.deploy("Dapp University", "DAPP", 1000000)
  await dapp.deployed()
  console.log(`DAPP deployed to: ${dapp.address}`)

  const mETH = await Token.deploy("mETH", "mETH", 1000000)
  await mETH.deployed()
  console.log(`mETH deployed to: ${mETH.address}`, 1000000)

  const mDAI = await Token.deploy("mDAI", "mDAI", 1000000)
  await mDAI.deployed()
  console.log(`mDAI deployed to: ${mDAI.address}`)
  
  // Fee Account accounts[2]
  const exchange = await Exchange.deploy(accounts[2].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
