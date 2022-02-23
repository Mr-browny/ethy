// const hre = require("hardhat");

const main = async () => {
  // The line below is like a function factory or a class that'll generate an instance 
  // Of that transaction for us.
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  // The line below, means we trying to get one specific instance...
  const transactions = await Transactions.deploy();
  console.log('George this is the deployed transactions: ', transactions)
  
  await transactions.deployed();

  console.log("Transactions deployed to:", transactions.address);
}

const runMain = async () => {
  try {
    await main();
    // The process.exit with a value of 0 means the process should stop and 
    // uses zero to denote everything went well, else it'll take 1
    process.exit(0);
  } catch (error) {
    console.error('George This is the error: ', error);
    process.exit(1);
  }
}

runMain();