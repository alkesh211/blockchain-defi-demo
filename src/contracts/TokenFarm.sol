pragma solidity ^0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {
	// All code comes here
	string public name = "Dapp TokenFarm";
	address public owner;
	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;


	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender; // person who deploy the contract
	}

	// 1. Stakes Tokens (Deposite)
	// Investor will deposite the dai in the smart contract
	// Investor will put the money in the app
	// Transfer Dai tokens from the investor wallet to this smart contract
	// Investor takes Dai token and they send them to Token Farm and Token Farm (Digital bank) can earn Dapp tokens
	function stakeTokens(uint _amount) public {

		// Require amount > 0
		require(_amount > 0, 'amount can not be 0');
		//require(true, 'amount can not be 0'), then function will run next otherwise not

		// Transfer Mock Dai  tokens to this contract for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);
		// DaiToken has transferFrom function, allows someone else move tokens for you, it allows the contract move the funds on the behalf of the investor
		// Investor must approve the tokens before they can stake them
		// msg.sender is special vairable inside solidity, msg is global variable, sender is the person who initiates the person calling the function
		// address is of this TokenFarm smart contract
		// transferFrom, first argument who is coming from the investor, the person is calling the function, second argument who is going to address of this smart contract and 3rd how many amount will going to pass
		// Transfer from investor to token farm

		// Update staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		// Add user to stakers array *only* if they haven't staked already
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// Update staking status
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

	// 2. Issuing Tokens (Earning Interest)
	// Ideally, investor are going to deposite dai token into token farm and stake them and they are going to earn dapp token for doing that
    // Token farm now have dapp tokens and we create funciton to issue those to the investor

    // To ristrict this function so the only owner can call this function
    function issueTokens() public {
    	require(msg.sender == owner, "caller must be the owner");

    	// Loop through all the people who have staked inside the stakers array, we are gone a issue them
    	// Issue tokens to all stakers
    	for (uint i=0; i<stakers.length; i++) {
    		// Find how many tokens they stake and issue them to same amount of token
    		// MEans if they deposite 1 dai then they take 1 dapp token, deposite 100 dai and they get 100 dapp token
    		address recipient = stakers[i];
    		uint balance = stakingBalance[recipient];
    		if(balance > 0) {    			
    			dappToken.transfer(recipient, balance);
    		}
    		// Every person who stake inside the app fetch theri balance and send them the exact the same amount of the dai token / dapp token i should say

    	}
    }

	// 3. Unstaking Tokens (Withdraw)
	// Investor withdraw money
	// 
	function unstakeTokens() public {
		// Fetch staking balance
		uint balance = stakingBalance[msg.sender];

		// Require amount > 0
		require(balance > 0, "staking balance can not be zero");

		// Transfer tokens inside of from the user to the app we transfer from the app back to the user
		// Transfer Mock Dai tokens to this contract for staking
		daiToken.transfer(msg.sender, balance);

		// Reset the staking balance
		stakingBalance[msg.sender] = 0;

		// Update staking status
		isStaking[msg.sender] = false;
	}
}