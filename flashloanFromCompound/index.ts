import { constants, Contract, ethers } from "ethers";
import dotenv from "dotenv";
import Upkaran from "../build/contracts/Upkaran.json";
import ERC3156Lender from "./abis/IERC3156FlashLender.json";
import { legos } from "@studydefi/money-legos";
import addresses from "./addresses.json";

const tokenTransfers = require("truffle-token-test-utils");

dotenv.config();
declare var process: {
  env: {
    PRIV_KEY: string;
    PROVIDER_URL: string;
  };
};
const privKey: string = process.env["PRIV_KEY"];
const providerURL = process.env["PROVIDER_URL"];

// const provider = new ethers.providers.JsonRpcProvider(providerURL);

// If you don't specify a //url//, Ethers connects to the default
// (i.e. ``http:/\/localhost:8545``)
const provider = new ethers.providers.JsonRpcProvider();

const wallet = new ethers.Wallet(privKey, provider);

const erc20 = new ethers.Contract(legos.erc20.dai.address, legos.erc20.dai.abi, wallet);

const CALL_TYPE = [
  {
    components: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    internalType: "struct Upkaran_With_TransferFrom_Restriction.Call[]",
    name: "calls",
    type: "tuple[]",
  },
];

function formateCall(to: string, data: string, value: string = "0") {
  return [to, data, value];
}

const takeFlashLoanFromCompund = async function () {
  const weth = new ethers.Contract(legos.erc20.weth.address, legos.erc20.weth.abi, wallet);
  const dai = erc20.attach(legos.erc20.dai.address);
  const cDAI = new ethers.Contract(legos.compound.cDAI.address, legos.compound.cDAI.abi, wallet);
  const cETH = new ethers.Contract(legos.compound.cEther.address, legos.compound.cEther.abi, wallet);
  const comptroller = new ethers.Contract(legos.compound.comptroller.address, legos.compound.comptroller.abi, wallet);
  const erc3156Lender = new ethers.Contract(addresses.mainnet.erc3156.erc3156DydxWrapper, ERC3156Lender.abi, wallet);

  const upkaranLocal = new ethers.Contract(Upkaran.networks["1"].address, Upkaran.abi, wallet);
  // const upkaranLocal = upkaran.attach("0x702e5c714AeCf0C45A680BD2821c281891646D48");

  // const amount = ethers.utils.parseEther("1");
  const amount = await erc3156Lender.maxFlashLoan(weth.address);
  const flashFees = await erc3156Lender.flashFee(weth.address, amount);

  await weth.deposit({ value: flashFees });
  await weth.transfer(upkaranLocal.address, flashFees);

  let calls = [];
  const approveWETHToERC3156Lender = formateCall(
    weth.address,
    erc20.interface.encodeFunctionData("approve", [erc3156Lender.address, amount.add(flashFees)]),
  );
  calls.push(approveWETHToERC3156Lender);

  //Supply eth to compound

  //convert WETH to ETH
  const convertWethToETHCall = formateCall(weth.address, weth.interface.encodeFunctionData("withdraw", [amount]));
  calls.push(convertWethToETHCall);

  //mint cETH
  const mintCETHCall = formateCall(cETH.address, cETH.interface.encodeFunctionData("mint"), amount.toString());
  calls.push(mintCETHCall);

  //Enter markets
  const enterMarketsCall = formateCall(
    comptroller.address,
    comptroller.interface.encodeFunctionData("enterMarkets", [[cDAI.address, cETH.address]]),
  );
  calls.push(enterMarketsCall);

  const amountOfDaiToBorrow = ethers.utils.parseEther("1000000");
  //borrow dai
  const borrowDAICall = formateCall(cDAI.address, cDAI.interface.encodeFunctionData("borrow", [amountOfDaiToBorrow]));
  calls.push(borrowDAICall);

  //TODO: use your DAI any way you want

  //approve DAI to be able to repay
  const approveDAItocDAI = formateCall(
    dai.address,
    dai.interface.encodeFunctionData("approve", [cDAI.address, amountOfDaiToBorrow]),
  );
  calls.push(approveDAItocDAI);

  //repay DAI
  const repayDAICall = formateCall(
    cDAI.address,
    cDAI.interface.encodeFunctionData("repayBorrow", [amountOfDaiToBorrow]),
  );
  calls.push(repayDAICall);
  //burn cETH
  const burnCETHCall = formateCall(cETH.address, cETH.interface.encodeFunctionData("redeemUnderlying", [amount]));
  calls.push(burnCETHCall);

  //convert ETH to WETH
  const convertETHToWETHCall = formateCall(
    weth.address,
    weth.interface.encodeFunctionData("deposit"),
    amount.toString(),
  );
  calls.push(convertETHToWETHCall);

  //now

  // @ts-ignore
  let data = ethers.utils.defaultAbiCoder.encode(CALL_TYPE, [calls]);
  // console.log(data)

  let tx = await erc3156Lender.flashLoan(upkaranLocal.address, weth.address, amount, data, { gasLimit: 2500000 });

  // await tx.wait()
  console.log((await provider.waitForTransaction(tx.hash)).cumulativeGasUsed.toString());
  // console.log(wallet)

  tokenTransfers.setCurrentProviderURL("http://localhost:8545");

  tokenTransfers.print(tx.hash);
};
takeFlashLoanFromCompund();

// console.log(legos.erc20.weth.address)
