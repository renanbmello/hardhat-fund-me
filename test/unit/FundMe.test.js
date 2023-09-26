const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // 1 ETH
    beforeEach(async function () {
        //deploy FundMe contract using hardhat deploy
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContractAt(fundMe.abi, fundMe.address)
        mockV3Aggregator = await ethers.getContractAt(
            mockV3Aggregator.abi,
            mockV3Aggregator.address,
        )
        // fundMe = await deployments.get("FundMe")
        // mockV3Aggregator = await deployments.get("MockV3Aggregator")
        // fundMe = await ethers.getContractAt(fundMe.abi, fundMe.address)
        // mockV3Aggregator = await ethers.getContractAt(
        //     mockV3Aggregator.abi,
        //     mockV3Aggregator.address,
        // )
    })
    describe("constructor", async function () {
        it("Sets the aggregator addresess correctly ", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })
    })

    describe("fund", async function () {
        it("Flais if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to send more ETH",
            )
        })
        it("update the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("add funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("witdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from single founder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            )
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer)
            // Act

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            )
            const endingidDeployerBalance =
                await fundMe.provider.getBalance(deployer)
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingidDeployerBalance.add(gasCost).toString(),
            )
        })
        it("allows to withdraw with mutiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMe.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address,
            )
            const startingDeployerBalance =
                await fundMe.provider.getBalance(deployer)
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            //Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingidDeployerBalance.add(gasCost).toString(),
            )

            //Make sure the funders are reset properly
            await expect(fundMe.funders(0)).to.be.reverted

            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })
        it("only allow the owner to withdraw", async function () {
            const accounts = ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectecContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectecContract.withdraw(),
            ).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})
