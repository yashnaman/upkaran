const Web3 = require("web3");
// const provider = new Web3.providers.HttpProvider(
//   "https://mainnet.infura.io/v3/73008ceefbb546baad41c9c8ee72ad49"
// );
const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

const contracts = require("./configs/contracts.json");
const addresses = require("./configs/addresses.json");

const { constants, BN, time } = require("@openzeppelin/test-helpers");

// const ethers = require("ethers");
// const provider = new ethers.providers.JsonRpcProvider();

const uniswapRouter02 = new web3.eth.Contract(
  contracts.UniswapRouter01.abi,
  addresses.UniswapRouter01
);

const convert = async function () {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts[0]);
  // note that you may want/need to handle this async code differently,
  // for example if top-level await is not an option

  const amountIn = web3.utils.toWei("1"); // 1 Eth
  const path = [addresses.WETH, addresses.DAI];

  const to = "0x5FD7d6382De0D4c4A00B19Ed10c11dfD96C27340"; // should be a checksummed recipient address (your address)
  let now = await time.latest();
  const deadline = now.add(new BN(60 * 60));

  console.log(amountIn);
  console.log((await web3.eth.getBalance(accounts[0])).toString());

  // await uni.methods
  //   .approve(uniswapRouter02.options.address, amountIn.toString())
  //   .send({ from: to });
  console.log(
    uniswapRouter02.methods
      .swapExactETHForTokens(amountIn, path, accounts[0], deadline)
      .encodeABI()
  );
  // let amountsOut = await uniswapRouter02.methods
  //   .getAmountsOut(amountIn, path)
  //   .call();
  // console.log(amountsOut);
  // await uniswapRouter02.methods
  //   .swapExactETHForTokens(amountsOut[1], path, accounts[0], deadline)
  //   .send({ from: accounts[0], value: amountIn.toString() });
};
convert();
