import { Token } from "@/typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractReceipt, Event } from "ethers";
import { Result } from "ethers/lib/utils";
import { ethers } from "hardhat";

const tokens = (n: number) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
    let token: Token;
    let deployer: SignerWithAddress;
    let receiver: SignerWithAddress;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Dapp University", "DAPP", tokens(1000000));

        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver = accounts[1];
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
        let transaction;
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
                await expect(token.connect(deployer).transfer("0x00000", amount)).to.be.rejected
            })
        })
    });

    describe("Approving", () => {
        // Add tests for approving if needed
    });
});
