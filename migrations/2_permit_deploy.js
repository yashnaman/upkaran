const Upkaran = artifacts.require("Upkaran");
var TestERC20 = artifacts.require("TestERC20");

const trustredForwarder = {
  kovan: "0x0842Ad6B8cb64364761C7c170D0002CC56b1c498",
  mainnet: "0xa530F85085C6FE2f866E7FdB716849714a89f4CD",
};
module.exports = async function (deployer, networks, accounts) {
  await deployer.deploy(Upkaran, trustredForwarder.mainnet);
  await deployer.deploy(TestERC20);


  let upkaran = await Upkaran.deployed();
  console.log("upkaran", upkaran.address);

  // let testERC20 = await TestERC20.deployed();

  // let call = {
  //   to: testERC20.address,
  //   value: '0',
  //   data: testERC20.contract.methods.transferFrom(accounts[0], accounts[0], "0").encodeABI(),
  // };
  // console.log(call);
  // await upkaran.batch([call], { from: accounts[0] });

  // console.log(await upkaran.contract.getPastEvents("SomeData"));

};
