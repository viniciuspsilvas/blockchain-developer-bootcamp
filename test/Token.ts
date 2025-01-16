import { Token } from "@/typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";


const tokens = (n: string) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", () => {

    let token: Token;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Dapp University", "DAPP", tokens("1000000"))

        const accounts = await ethers.getSigners()
        deployer = accounts[0]
    })

    describe("Deployment", () => {

        const name = "Dapp University"
        const symbol = "DAPP"
        const decimals = 18
        const totalSupply = tokens("1000000")

        it("has correct name", async () => {
            expect(await token.name()).to.equal(name)
        })

        it("has correct symbol", async () => {
            expect(await token.symbol()).to.equal(symbol)
        })

        it("has correct decimals", async () => {
            expect(await token.decimals()).to.equal(decimals)
        })

        it("has correct total Supply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it("assign total supply to deployer", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })

    describe("Spending", () => {

    })

    describe("Approving", () => {

    })


})