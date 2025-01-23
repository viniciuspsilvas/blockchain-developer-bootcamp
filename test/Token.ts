import { Token } from "@/typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractReceipt, ContractTransaction, Event } from "ethers";
import { Result } from "ethers/lib/utils";
import { ethers } from "hardhat";

const tokens = (n: number) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
    let token: Token;
    let deployer: SignerWithAddress;
    let receiver: SignerWithAddress;
    let exchange: SignerWithAddress;
    const invalidAddress: string = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Dapp University", "DAPP", 1000000);

        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
        exchange = accounts[2];
    });

    describe("Deployment", () => {
        const name = "Dapp University";
        const symbol = "DAPP";
        const decimals = 18;
        const totalSupply = tokens(1000000);

        it("has correct name", async () => {
            expect(await token.name()).to.equal(name);
        });

        it("has correct symbol", async () => {
            expect(await token.symbol()).to.equal(symbol);
        });

        it("has correct decimals", async () => {
            expect(await token.decimals()).to.equal(decimals);
        });

        it("has correct total Supply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("assign total supply to deployer", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        });
    });

    describe("Sending tokens", () => {
        let amount: BigNumber;
        let transaction: ContractTransaction;
        let result: ContractReceipt | undefined;

        describe("Success", () => {
            beforeEach(async () => {
                amount = tokens(100);
                // Transfer tokens
                transaction = await token.connect(deployer).transfer(receiver.address, amount);
                result = await transaction.wait();
            });

            it("transfer token balances", async () => {
                // Ensure that tokens were transferred
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
            });

            it("emits a Transfer event", async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Transfer");

                expect(event?.event).to.equal("Transfer");

                const args: Result | undefined = event?.args;

                expect(args?.from).to.equal(deployer.address);
                expect(args?.to).to.equal(receiver.address);
                expect(args?.value).to.equal(amount);
            });
        })


        describe("Failure", () => {
            it("rejects insufficient balances", async () => {
                const invalidAmount = tokens(100000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.rejected
            })

            it("rejects invalid recipient", async () => {
                amount = tokens(100);
                await expect(token.connect(deployer).transfer(invalidAddress, amount)).to.be.rejected
            })
        })
    });

    describe('Approving Tokens', () => {
        let amount: BigNumber;
        let transaction;
        let result: ContractReceipt | undefined;

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            })

            it("emits a Approval event", async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Approval");

                expect(event?.event).to.equal("Approval");

                const args: Result | undefined = event?.args;

                expect(args?.owner).to.equal(deployer.address);
                expect(args?.spender).to.equal(exchange.address);
                expect(args?.value).to.equal(amount);
            });

        })

        describe('Failure', () => {
            it('rejects invalid spenders', async () => {
                await expect(token.connect(deployer).approve(invalidAddress, amount)).to.be.reverted
            })
        })

    })

    describe('Delegate Token Transfer', () => {
        let amount: BigNumber;
        let transaction;
        let result: ContractReceipt | undefined;

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            })

            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('999900', 'ether'))
                expect(await token.balanceOf(receiver.address)).to.be.equal(amount)
            })

            it('rests the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
            })

            it('emits a Transfer event', async () => {
                const event: Event | undefined = result?.events?.find((e) => e.event === "Transfer");

                expect(event?.event).to.equal("Transfer");

                const args: Result | undefined = event?.args;

                expect(args?.from).to.equal(deployer.address);
                expect(args?.to).to.equal(receiver.address);
                expect(args?.value).to.equal(amount);
            })

        })

        describe('Failure', async () => {
            // Attempt to transfer too many tokens
            const invalidAmount = tokens(100000000) // 100 Million, greater than total supply
            await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
        })

    })
});
