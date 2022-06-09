const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require("TokenFarm")

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n) {
	return web3.utils.toWei(n, 'ether')
}

// o - who deployed dapp token to network
// i - who uses bank, deposite dai to bank
contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async () => {
		// Load Contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

		// Transfer all Dapp tokens to farm (1 million)
		// await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')
		// await dappToken.transfer(tokenFarm.address, web3.utils.toWei('1000000', 'Ether'))
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send tokens to investor
		//await daiToken.transfer(investor, tokens('100'), { from: owner })
		//await daiToken.transfer(accounts[1], tokens('100'), { from: accounts[0] })
		await daiToken.transfer(investor, tokens('100'), { from: owner })
	})

	describe('Mock DAI deployment', async () => {
		it('has a name', async () => {		
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token deployment', async () => {
		it('has a name', async () => {		
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {		
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp TokenFarm')
		})

		it('contract has tokens', async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming tokens', async () => {
		it('rewards investors for staking mDai tokens', async () => {
			let result
			// Check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

			// Stake Mock DAI Tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			// Error comes because not aproved, so we have to appove by writing above line
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })


			//Check staking result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

			// Issue tokens
			await tokenFarm.issueTokens({ from: owner })

			// Check balance after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Dapp token wallet balance correct after issuance')

			// Ensure that only owner can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

			// Unstake the tokens
			await tokenFarm.unstakeTokens({ from: investor})

			// Check result after unstaking
			assert.equal(result.toString(), tokens('100'), 'investor Mock dai wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'Token farm Mock dai balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance after correct staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status after correct staking')

		})
	})
})