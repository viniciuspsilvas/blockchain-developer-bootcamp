import { ContractTransaction, ContractReceipt } from "ethers";
import { ethers } from "hardhat";
type ConfigType = {
  [key: string]: {
    DApp: { address: string };
    mETH: { address: string };
    mDAI: { address: string };
    exchange: { address: string };
  };
};

import configData from "../src/config.json";
const config: ConfigType = configData;


const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds: number) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

  // Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners()

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId:", chainId)

  // console.log("Seeding exchange")

  const Dapp = await ethers.getContractAt("Token", config[chainId].DApp.address)
  console.log(`Dapp Token fetched ${Dapp.address}\n`)

  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address)
  console.log(`mETH Token fetched ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address)
  console.log(`mDAI Token fetched ${mDAI.address}\n`)

  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address)
  console.log(`Exchange Token fetched ${exchange.address}\n`)

  // Give tokens to account[1]
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)

  // user1 transfer 10,000 mETH
  let transaction: ContractTransaction;
  let result: ContractReceipt;

  transaction = await mETH.connect(sender).transfer(receiver.address, amount);
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

  // Set up users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  // user1 approves 10,000 Dapp
  transaction = await Dapp.connect(user1).approve(exchange.address, amount);
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  // user1 deposits 10,000 Dapp
  transaction = await exchange.connect(user1).depositToken(Dapp.address, amount);
  result = await transaction.wait()
  console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

  // user2 Approves mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  result = await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}\n`)

  // user2 Deposits mETH
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
  result = await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`)


  // #########################
  //  Seed a Cancelled Order
  // #########################  

  // User 1 makes order to get tokens
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(5));
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // User 1 cancels order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("Order event not found or malformed.");
  }
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // #########################
  //  Fill orders
  // #########################  

  // User 1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), Dapp.address, tokens(10));
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // User 2 fills order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("Order event not found or malformed.");
  }
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), Dapp.address, tokens(15));
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // User 2 fills order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("Order event not found or malformed.");
  }
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), Dapp.address, tokens(20));
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  // User 2 fills final order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("Order event not found or malformed.");
  }
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second
  await wait(1)

  // #########################
  //  Seed opened orders
  // #########################  

  // User 1 makes 10 orders
  for (let i = 0; i < 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), Dapp.address, tokens(10));
    result = await transaction.wait()
    console.log(`Made order from User 1 = ${user1.address}`)

    // Wait 1 second
    await wait(1)
  }

  console.log(`\n`)

  // User 2 makes 10 orders
  for (let i = 0; i < 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(Dapp.address, tokens(10), mETH.address, tokens(10 * i));
    result = await transaction.wait()
    console.log(`Made order from User 2 = ${user2.address}`)

    // Wait 1 second
    await wait(1)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
