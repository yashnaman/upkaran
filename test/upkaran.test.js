
const TestERC721 = artifacts.require("TestERC721");
const TestERC777 = artifacts.require("TestERC777");
const TestERC1155 = artifacts.require("TestERC1155");
const Upkaran = artifacts.require("Upkaran");

const formateCall = function (to, data, value = 0) {
    return {
        to: to,
        data: data,
        value: value
    };
};
const CALL_TYPE = {
    "Call[]": {
        "to": "address",
        "data": "bytes",
        "value": "uint256"
    }
};
const convertCallsToBytes = function (calls) {
    return web3.eth.abi.encodeParameter(CALL_TYPE, calls);
};
contract("~upkaran works", function (accounts) {
    const [owner, mockforwarder] = accounts;
    const tokenId = 1;
    const amount = 1;
    const tokenIds = [1, 2];
    const amounts = [1, 2];
    const emptyData = "0x";
    beforeEach(async function () {
        this.nft = await TestERC721.new();
        this.erc777Token = await TestERC777.new();
        this.erc1155Token = await TestERC1155.new();
        this.upkaran = await Upkaran.new(mockforwarder);
    });
    describe("handles NFTs correctly", function () {
        it("when data is given (data = should transfer NFT back)", async function () {
            let calls = [];
            const transferNFTBackCall = formateCall(this.nft.address, this.nft.contract.methods.safeTransferFrom(this.upkaran.address, owner, tokenId).encodeABI());
            calls.push(transferNFTBackCall);
            const data = convertCallsToBytes(calls);
            await this.nft.safeTransferFrom(owner, this.upkaran.address, tokenId, data);
            expect(await this.nft.ownerOf(tokenId)).to.be.equal(owner);
        });
        it("when data is not given", async function () {
            await this.nft.safeTransferFrom(owner, this.upkaran.address, tokenId);
            expect(await this.nft.ownerOf(tokenId)).to.be.equal(this.upkaran.address);
        });
    });
    //TODO: we need to first add ERC1820;
    describe("handles ERC777 correctly", function () {
        it("when data is given (data = should transfer ERC777 back)", async function () {
            let calls = [];
            const transferERC777BackCall = formateCall(this.erc777Token.address, this.erc777Token.contract.methods.transfer(owner, amount).encodeABI());
            calls.push(transferERC777BackCall);
            const data = convertCallsToBytes(calls);
            await this.erc777Token.send(this.upkaran.address, amount, data);
            expect((await this.erc777Token.balanceOf(owner)).toString()).to.be.equal(amount.toString());
        });
        it("when data is not given", async function () {
            await this.erc777Token.transfer(this.upkaran.address, amount);
            expect((await this.erc777Token.balanceOf(this.upkaran.address)).toString()).to.be.equal(amount.toString());
        });
    });

    describe("handles ERC1155 correctly", function () {
        describe("single transfer", function () {
            it("when data is given (data = should transfer ERC1155 back)", async function () {
                let calls = [];
                const transferERC1155BackCall = formateCall(this.erc1155Token.address, this.erc1155Token.contract.methods.safeTransferFrom(this.upkaran.address, owner, tokenId, amount, emptyData).encodeABI());
                calls.push(transferERC1155BackCall);
                const data = convertCallsToBytes(calls);
                await this.erc1155Token.safeTransferFrom(owner, this.upkaran.address, tokenId, amount, data);
                expect((await this.erc1155Token.balanceOf(owner, tokenId)).toString()).to.be.equal(amount.toString());
            });
            it("when data is not given", async function () {
                await this.erc1155Token.safeTransferFrom(owner, this.upkaran.address, tokenId, amount, emptyData);
                expect((await this.erc1155Token.balanceOf(this.upkaran.address, tokenId)).toString()).to.be.equal(amount.toString());
            });
        });
        describe("batch transfer", function () {
            it("when data is given (data = should transfer ERC1155 back)", async function () {
                let calls = [];
                const transferERC1155BackCall = formateCall(this.erc1155Token.address, this.erc1155Token.contract.methods.safeBatchTransferFrom(this.upkaran.address, owner, tokenIds, amounts, emptyData).encodeABI());
                calls.push(transferERC1155BackCall);
                const data = convertCallsToBytes(calls);
                await this.erc1155Token.safeBatchTransferFrom(owner, this.upkaran.address, tokenIds, amounts, data);
                expect((await this.erc1155Token.balanceOfBatch([owner, owner], tokenIds)).toString()).to.be.equal(amounts.toString());
            });
            it("when data is not given", async function () {
                await this.erc1155Token.safeBatchTransferFrom(owner, this.upkaran.address, tokenIds, amounts, emptyData);
                expect((await this.erc1155Token.balanceOfBatch([this.upkaran.address, this.upkaran.address], tokenIds)).toString()).to.be.equal(amounts.toString());
            });
        });
    });
});