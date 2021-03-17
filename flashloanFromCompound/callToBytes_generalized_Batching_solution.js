"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var dotenv_1 = __importDefault(require("dotenv"));
var Upkaran_With_TransferFrom_Restriction_json_1 = __importDefault(require("../build/contracts/Upkaran_With_TransferFrom_Restriction.json"));
var IERC3156FlashLender_json_1 = __importDefault(require("./abis/IERC3156FlashLender.json"));
var money_legos_1 = require("@studydefi/money-legos");
var addresses_json_1 = __importDefault(require("./addresses.json"));
var tokenTransfers = require("truffle-token-test-utils");
dotenv_1.default.config();
var privKey = process.env["PRIV_KEY"];
var providerURL = process.env["PROVIDER_URL"];
// const provider = new ethers.providers.JsonRpcProvider(providerURL);
// If you don't specify a //url//, Ethers connects to the default 
// (i.e. ``http:/\/localhost:8545``)
var provider = new ethers_1.ethers.providers.JsonRpcProvider();
var wallet = new ethers_1.ethers.Wallet(privKey, provider);
var erc20 = new ethers_1.ethers.Contract(money_legos_1.legos.erc20.dai.address, money_legos_1.legos.erc20.dai.abi, wallet);
var CALL_TYPE = [
    {
        "components": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "internalType": "struct Upkaran_With_TransferFrom_Restriction.Call[]",
        "name": "calls",
        "type": "tuple[]"
    }
];
function formateCall(to, data, value) {
    if (value === void 0) { value = "0"; }
    return [to, data, value];
}
var takeFlashLoanFromCompund = function () {
    return __awaiter(this, void 0, void 0, function () {
        var weth, dai, cDAI, cETH, comptroller, erc3156Lender, upkaranLocal, amount, flashFees, _a, _b, calls, approveWETHToERC3156Lender, convertWethToETHCall, mintCETHCall, enterMarketsCall, amountOfDaiToBorrow, borrowDAICall, approveDAItocDAI, repayDAICall, burnCETHCall, convertETHToWETHCall, data, tx, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    weth = new ethers_1.ethers.Contract(money_legos_1.legos.erc20.weth.address, money_legos_1.legos.erc20.weth.abi, wallet);
                    dai = erc20.attach(money_legos_1.legos.erc20.dai.address);
                    cDAI = new ethers_1.ethers.Contract(money_legos_1.legos.compound.cDAI.address, money_legos_1.legos.compound.cDAI.abi, wallet);
                    cETH = new ethers_1.ethers.Contract(money_legos_1.legos.compound.cEther.address, money_legos_1.legos.compound.cEther.abi, wallet);
                    comptroller = new ethers_1.ethers.Contract(money_legos_1.legos.compound.comptroller.address, money_legos_1.legos.compound.comptroller.abi, wallet);
                    erc3156Lender = new ethers_1.ethers.Contract(addresses_json_1.default.mainnet.erc3156.erc3156DydxWrapper, IERC3156FlashLender_json_1.default.abi, wallet);
                    upkaranLocal = new ethers_1.ethers.Contract(Upkaran_With_TransferFrom_Restriction_json_1.default.networks["1"].address, Upkaran_With_TransferFrom_Restriction_json_1.default.abi, wallet);
                    return [4 /*yield*/, erc3156Lender.maxFlashLoan(weth.address)];
                case 1:
                    amount = _e.sent();
                    return [4 /*yield*/, erc3156Lender.flashFee(weth.address, amount)];
                case 2:
                    flashFees = _e.sent();
                    return [4 /*yield*/, weth.deposit({ value: flashFees })];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, weth.transfer(upkaranLocal.address, flashFees)];
                case 4:
                    _e.sent();
                    _b = (_a = console).log;
                    return [4 /*yield*/, weth.balanceOf(upkaranLocal.address)];
                case 5:
                    _b.apply(_a, [(_e.sent()).toString()]);
                    console.log((amount.add(flashFees)).toString());
                    calls = [];
                    approveWETHToERC3156Lender = formateCall(weth.address, erc20.interface.encodeFunctionData("approve", [erc3156Lender.address, amount.add(flashFees)]));
                    calls.push(approveWETHToERC3156Lender);
                    convertWethToETHCall = formateCall(weth.address, weth.interface.encodeFunctionData("withdraw", [amount]));
                    calls.push(convertWethToETHCall);
                    mintCETHCall = formateCall(cETH.address, cETH.interface.encodeFunctionData("mint"), amount.toString());
                    calls.push(mintCETHCall);
                    enterMarketsCall = formateCall(comptroller.address, comptroller.interface.encodeFunctionData("enterMarkets", [[cDAI.address, cETH.address]]));
                    calls.push(enterMarketsCall);
                    amountOfDaiToBorrow = ethers_1.ethers.utils.parseEther("1000000");
                    borrowDAICall = formateCall(cDAI.address, cDAI.interface.encodeFunctionData("borrow", [amountOfDaiToBorrow]));
                    calls.push(borrowDAICall);
                    approveDAItocDAI = formateCall(dai.address, dai.interface.encodeFunctionData("approve", [cDAI.address, amountOfDaiToBorrow]));
                    calls.push(approveDAItocDAI);
                    repayDAICall = formateCall(cDAI.address, cDAI.interface.encodeFunctionData("repayBorrow", [amountOfDaiToBorrow]));
                    calls.push(repayDAICall);
                    burnCETHCall = formateCall(cETH.address, cETH.interface.encodeFunctionData("redeemUnderlying", [amount]));
                    calls.push(burnCETHCall);
                    convertETHToWETHCall = formateCall(weth.address, weth.interface.encodeFunctionData("deposit"), amount.toString());
                    calls.push(convertETHToWETHCall);
                    data = ethers_1.ethers.utils.defaultAbiCoder.encode(CALL_TYPE, [calls]);
                    return [4 /*yield*/, erc3156Lender.flashLoan(upkaranLocal.address, weth.address, amount, data, { gasLimit: 2500000 })];
                case 6:
                    tx = _e.sent();
                    // await tx.wait()
                    _d = (_c = console).log;
                    return [4 /*yield*/, provider.waitForTransaction(tx.hash)];
                case 7:
                    // await tx.wait()
                    _d.apply(_c, [(_e.sent()).cumulativeGasUsed.toString()]);
                    // console.log(wallet)
                    tokenTransfers.setCurrentProviderURL("http://localhost:8545");
                    tokenTransfers.print(tx.hash);
                    return [2 /*return*/];
            }
        });
    });
};
takeFlashLoanFromCompund();
// console.log(legos.erc20.weth.address)
