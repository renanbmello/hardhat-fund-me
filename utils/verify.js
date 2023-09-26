const { run } = require("hardhat")

async function verify(contracrAddress, args) {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contracrAddress,
            controctorArgumentes: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("alredy verified")) {
            console.log("Alredy verified")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
