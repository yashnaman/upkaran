The idea was to make a contract that supports "PemitAndCall" pattern. And I was going to make different recipies using it
FOr example:

1. Claim and convert your uni to eth/DAI/USDC in one transaction

I made the contract as you can see in the ./contracts/Upkaran.sol but this pattern can be abused if used in the dark forest that is ethereum.

Some one could that these signature when user's transaction is still in the mempool and drain user's funds

I thought of ideas to prevent this but there is none.

This is was supposed to be solution to batching transaction by an EOA and not a contract wallet.

Let me know if you have any way to make this pattern work.

What now?<br>
Now I am going to make a specialized contract for every pattern that I want to implement using same pattern that [uniswapRouter02](https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/UniswapV2Router01.sol#L137) uses
