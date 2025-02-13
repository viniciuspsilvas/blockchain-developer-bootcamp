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

const tokens = (n: number) => ethers.utils.parseUnits(n.toString(), "ether");

const wait = (seconds: number) =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000));

async function main() {
  // Fetch accounts from Hardhat
  const accounts = await ethers.getSigners();
  console.log(`Accounts fetched: \n Maker :${accounts[0].address}\n Taker: ${accounts[1].address}\n FeeAccount: ${accounts[2].address}`)

  // Fetch network details
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`\n🚀 Using Chain ID: ${chainId}\n`);

  // Fetch contract instances
  const DApp = await ethers.getContractAt("Token", config[chainId].DApp.address);
  const mETH = await ethers.getContractAt("Token", config[chainId].mETH.address);
  const mDAI = await ethers.getContractAt("Token", config[chainId].mDAI.address);
  const exchange = await ethers.getContractAt("Exchange", config[chainId].exchange.address);


  console.log(`📜 Contracts Loaded:\n   🪙 DApp:  ${DApp.address}\n   🪙 mETH:  ${mETH.address}\n   🪙 mDAI:  ${mDAI.address}\n   🔄 Exchange: ${exchange.address}\n`);

  // Define users (traders)
  const user1 = accounts[0]; // First user (maker)
  const user2 = accounts[1]; // Second user (taker)
  const amount = tokens(10000);

  console.log(`👤 User1=[${user1.address}]\n👤 User2=[${user2.address}]\n`);

  // Transfer mETH tokens from User1 to User2 to simulate trading activity
  let transaction: ContractTransaction = await mETH.connect(user1).transfer(user2.address, amount);
  console.log(`✅ Transfer: User1=[${user1.address}] sent ${ethers.utils.formatEther(amount)} mETH ➡️ User2=[${user2.address}]`);
  await transaction.wait();

  // Approve and deposit tokens into the exchange
  transaction = await DApp.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`✅ Approval: User1=[${user1.address}] approved ${ethers.utils.formatEther(amount)} DApp for Exchange`);

  transaction = await exchange.connect(user1).depositToken(DApp.address, amount);
  await transaction.wait();
  console.log(`✅ Deposit: User1=[${user1.address}] deposited ${ethers.utils.formatEther(amount)} DApp into Exchange\n`);

  transaction = await mETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`✅ Approval: User2=[${user2.address}] approved ${ethers.utils.formatEther(amount)} mETH for Exchange`);

  transaction = await exchange.connect(user2).depositToken(mETH.address, amount);
  await transaction.wait();
  console.log(`✅ Deposit: User2=[${user2.address}] deposited ${ethers.utils.formatEther(amount)} mETH into Exchange\n`);

  // #########################
  //  Seed a Cancelled Order
  // #########################  

  // User1 makes an order to trade mETH for DApp
  let orderId;
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5));
  let result: ContractReceipt = await transaction.wait();
  console.log(`✅ Order Created: User1=[${user1.address}] wants 100 mETH for 5 DApp`);

  // Extract order ID from event logs
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("❌ Order event not found.");
  }

  // User1 cancels the order
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  await transaction.wait();
  console.log(`✅ Order Cancelled: User1=[${user1.address}] cancelled Order ID ${orderId}\n`);

  // Wait before next transaction
  await wait(1);

  // #########################
  //  Fill orders
  // #########################  

  // User1 makes an order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10));
  result = await transaction.wait();
  console.log(`✅ Order Created: User1=[${user1.address}] wants 100 mETH for 10 DApp`);

  // Extract order ID
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("❌ Order event not found.");
  }

  // User2 fills User1's order
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`✅ Order Filled: User2=[${user2.address}] filled Order ID ${orderId}\n`);

  // Wait before next transaction
  await wait(1);

  // User1 places another order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15));
  result = await transaction.wait();
  console.log(`✅ Order Created: User1=[${user1.address}] wants 50 mETH for 15 DApp`);

  // User 2 fills order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("❌ Order event not found.");
  }

  // User2 fills this order
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait()
  console.log(`✅ Filled order from User1=[${user1.address}]\n`)

  // Wait 1 second
  await wait(1)

  // User 1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20));
  result = await transaction.wait()
  console.log(`✅ Made order from ${user1.address}\n`)
  console.log(`✅ Order Created: User1=[${user1.address}] wants 200 DApp for 20 DApp`);

  // User 2 fills final order
  // Ensure result.events exists and contains at least one event
  if (result.events && result.events.length > 0 && result.events[0].args) {
    orderId = result.events[0].args.id;
  } else {
    throw new Error("Order event not found or malformed.");
  }
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`✅ Order Filled: User2=[${user2.address}] filled Order ID ${orderId}\n`);

  // Wait before next transaction
  await wait(1);

  // #########################
  //  Seed Open Orders
  // #########################  

  // User 1 makes 10 orders
  console.log(`📢 Seeding 10 open orders for User1=[${user1.address}]...`);
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10));
    await transaction.wait();
    console.log(`✅ Order Created: User1=[${user1.address}] Order ${i}/10`);
    await wait(1);
  }

  console.log(`\n📢 Seeding 10 open orders for User2=[${user2.address}]...`);

  // User 2 makes 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i));
    await transaction.wait();
    console.log(`✅ Order Created: User2=[${user2.address}] Order ${i}/10`);
    await wait(1);
  }

  console.log("\n✅ Seeding complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
