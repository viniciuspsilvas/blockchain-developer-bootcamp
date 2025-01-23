import { Exchange, Token } from "@/typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";

const tokens = (n: number) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
    let exchange: Exchange;
    let deployer: SignerWithAddress;
    let feeAccount: SignerWithAddress;
    let user1: SignerWithAddress;

    let token1: Token;

    const feePercent = 10

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory("Exchange");
        const Token = await ethers.getContractFactory("Token");

        token1 = await Token.deploy("Dapp University", "DAPP", 1000000);

        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];

        user1 = accounts[2]
        const transaction = await token1.connect(deployer).transfer(user1.address, tokens(100));
        await transaction.wait()

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

        beforeEach(async () => {
            // Approve token
            transaction = await token1.connect(user1).approve(exchange.address, amount);
            result = await transaction.wait()

            // Deposit token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount);
            result = await transaction.wait()
        });

        describe('Success', () => {
            it("Tracks the token deposit", async () => {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)

            })
        })

 
        describe('Failure', () => {

        })
    })

});
