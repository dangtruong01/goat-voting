# Election Voting System

## Description
 A solidity project using truffle suite to build a blockchain voting system. 
 
## Installation
1. Download Election into local directory. <br>
   `git clone https://github.com/dangtruong01/Election` <br><br>

2. Setting up development environment. <br>
Install Truffle:  `npm install -g truffle` <br>
Install Ganache at https://trufflesuite.com/ganache/ <br><br>
   
4. Go to the directory and intall the required dependencies. <br>
   `npm install` <br><br>

## Execute programme
1. Create a local blockchain network with Ganache. <br>
   
2. Deploy the smart contract: <br>
   `truffle migrate` <br><br>
   
3. Interact with the contract using Truffle console: <br>
   `truffle console` <br><br>
   
Eg: To initiailize the app object, run the code: <br>
   `Election.deployed().then(function(i) {app = i;})` <br><br>
   
Then we can call different functions of the smart contract. The app is initialized with three basketball legends to vote on who is the basketball GOAT. <br>
- Get candidates' names: <br>
   `app.getCandidatesNames()` <br><br>
   
- Get number of candidates: <br>
   `app.getCandidatesCount()` <br><br>
   
- Vote: <br>
   `app.vote(1)` <br><br>
   
- Get Winner: <br>
   `app.getWinner()` <br><br>

To quit Truffle console, press 'Ctrl' + 'D' <br><br>

4. To open the app in your local browser: <br>
   `npm run dev` <br><br>
5. To reset the smart contract: <br>
   `truffle migrate --reset`


