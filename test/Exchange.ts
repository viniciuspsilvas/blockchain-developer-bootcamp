import { Exchange, Token } from "@/typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractReceipt, ContractTransaction, Event } from "ethers";
import { Result } from "ethers/lib/utils";
import { ethers } from "hardhat";

const tokens = (n: number) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
    let exchange: Exchange;
    let feeAccount: SignerWithAddress;

    let deployer: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

    let token1: Token;
    let token2: Token;

    const feePercent = 10

    beforeEach(async () => {
        // Get the contract factories for Exchange and Token contracts.
        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");

        // Deploy the Token contract
        token1 = await Token.deploy("Dapp University", "DAPP", 1000000);
        token2 = await Token.deploy("Mock Dai", "mDAI", 1000000);

        // Retrieve a list of test accounts provided by Hardhat.
        const accounts = await ethers.getSigners();
        deployer = accounts[0]; // The account deploying the contracts (msg.sender for deploys).
        feeAccount = accounts[1]; // Account designated to collect fees on the Exchange.
        user1 = accounts[2]; // A user account interacting with the system.
        user2 = accounts[3]; 

        // Transfer 100 DAPP tokens from deployer to user1.
        // - Connect as the deployer (msg.sender = deployer).
        // - Use the transfer function of the Token contract.
        const transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
        await transaction.wait(); // Wait for the transaction to be mined.

        // Deploy the Exchange contract with:
        // - feeAccount as the address to collect trading fees.
        // - feePercent as the fee percentage (e.g., 10%).
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
    });


    describe("Deployment", () => {
        it("tracks the fee account", async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });

        it("tracks the fee percent", async () => {
            expect(await exchange.feePercent()).to.equal(10);
        });
    });

    describe("Depositing Tokens", () => {
        const amount: BigNumber = tokens(10);
        let transaction: ContractTransaction;
        let result: ContractReceipt | undefined;

        describe('Success', () => {
            beforeEach(async () => {
                // Approve token
                // Grants the Exchange contract permission to spend up to amount tokens owned by user1
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait()

                // Deposit token
                //move tokens from user1's wallet to the Exchange contract's address.
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait()
            });

            it("Tracks the token deposit", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
            })

            it('emits a Deposit event', async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Deposit");
                expect(event?.event).to.equal("Deposit");

                const args: Result | undefined = event?.args;
                expect(args?.token).to.equal(token1.address);
                expect(args?.user).to.equal(user1.address);
                expect(args?.amount).to.equal(amount);
                expect(args?.balance).to.equal(amount);
            })
        })


        describe('Failure', () => {
            it("fails when no tokens are approved", async () => {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })
        })
    })

    describe("Withdrawing Tokens", () => {
        const amount: BigNumber = tokens(10);
        let transaction: ContractTransaction;
        let result: ContractReceipt | undefined;

        describe('Success', () => {
            beforeEach(async () => {
                // Deposit tokens before withdrawing
                // Approve token
                // Grants the Exchange contract permission to spend up to amount tokens owned by user1
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait()

                // Deposit token
                //move tokens from user1's wallet to the Exchange contract's address.
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait()

                // Now withdraw Tokens
                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);
                result = await transaction.wait()
            });

            it("withdraws token funds", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
            })

            it('emits a Withdraw event', async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Withdraw");
                expect(event?.event).to.equal("Withdraw");

                const args: Result | undefined = event?.args;
                expect(args?.token).to.equal(token1.address);
                expect(args?.user).to.equal(user1.address);
                expect(args?.amount).to.equal(amount);
                expect(args?.balance).to.equal(0);
            })
        })


        describe('Failure', () => {
            it("fails for insufficient balances", async () => {
                // Attempt to withdraw tokens without depositing
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })
        })
    })

    describe("Checking Balances", () => {
        const amount: BigNumber = tokens(1);
        let transaction: ContractTransaction;

        beforeEach(async () => {
            // Approve token
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            await transaction.wait()

            // Deposit token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            await transaction.wait()
        });

        it("returns user balances", async () => {
            expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        })
    })

    describe("Making orders", () => {
        let transaction: ContractTransaction;
        let result: ContractReceipt | undefined;
        const amount: BigNumber = tokens(1);

        describe('Success', () => {
            beforeEach(async () => {

                // Deposit tokens before making order

                // Approve token
                // Grants the Exchange contract permission to spend up to amount tokens owned by user1
                transaction = await token1.connect(user1).approve(exchange.address, amount);
                result = await transaction.wait()

                // Deposit token
                //move tokens from user1's wallet to the Exchange contract's address.
                transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                result = await transaction.wait()

                // Make order
                transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                result = await transaction.wait()
            });

            it("tracks the newly created order", async () => {
                expect(await exchange.orderCount()).to.equal(1)
            })

            it('emits an Order event', async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Order");
                expect(event?.event).to.equal("Order");

                const args: Result | undefined = event?.args;
                expect(args?.id).to.equal(1);
                expect(args?.user).to.equal(user1.address);
                expect(args?.tokenGet).to.equal(token2.address);
                expect(args?.amountGet).to.equal(amount);
                expect(args?.tokenGive).to.equal(token1.address);
                expect(args?.amountGive).to.equal(amount);
                expect(args?.timestamp).to.at.least(1)
            })
        })

        describe('Failure', () => {
            it("rejects with no balance", async () => {
                await expect(exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)).to.be.reverted;
            })
        })
    })

    describe("Orders actions", () => {
        let transaction: ContractTransaction;
        let result: ContractReceipt | undefined;
        const amount: BigNumber = tokens(1);

        beforeEach(async () => {
            // user1 deposits tokens
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait()

            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait()

            // Make order
            transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
            result = await transaction.wait()
        });


        describe("Cancelling actions", async () => {
            describe("Success", async () => {
                beforeEach(async () => {
                    // user1 deposits tokens
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait()

                });

                describe("updates canceled orders", async () => {
                    expect(await exchange.ordersCancelled(1)).to.equal(true)
                })

                it('emits an Cancel event', async () => {
                    const event: Event | undefined = result?.events?.find((e) => e.event === "Cancel");
                    expect(event?.event).to.equal("Cancel");

                    const args: Result | undefined = event?.args;
                    expect(args?.id).to.equal(1);
                    expect(args?.user).to.equal(user1.address);
                    expect(args?.tokenGet).to.equal(token2.address);
                    expect(args?.amountGet).to.equal(amount);
                    expect(args?.tokenGive).to.equal(token1.address);
                    expect(args?.amountGive).to.equal(amount);
                    expect(args?.timestamp).to.at.least(1)
                })
            })

            describe("Failure", () => {
                beforeEach(async () => {
                    // user1 deposits tokens
                    transaction = await token1.connect(user1).approve(exchange.address, amount);
                    result = await transaction.wait()

                    transaction = await exchange.connect(user1).depositToken(token1.address, amount);
                    result = await transaction.wait()

                    // Make order
                    transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount);
                    result = await transaction.wait()
                });

                it("rejects invalid orders id", async () => {
                    const invalidOrderId = 999999
                    await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted;
                })

                it("rejects unauthorized cancelations", async () => {
                    await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
                })
            })
        })
    })
});
