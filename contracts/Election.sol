// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    //Address
    address contractOwner;
    //Winner
    // Candidate winner;
    //Voters
    mapping(address => bool) public voters;
    //Store candidates
    Candidate[] public candidates;
    //Total number of candidates
    uint public candidatesCount;
    //Candidates Names
    string[] public candidatesNames;

    event votedEvent (
        uint indexed _candidateId
    );

    modifier onlyOwner {
        require(msg.sender == contractOwner);
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        addCandidate("Michael Jordan");
        addCandidate("Kobe Bryant");
        addCandidate("Lebron James");
    }

    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "removeCandidate Error: Please enter a name");
        candidatesCount++;
        candidates.push(Candidate(candidatesCount, _name, 0));
        candidatesNames.push(_name);
    }

    function removeCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "removeCandidate Error: Please enter a name");
        bool foundCandidate;
        uint256 index;
        bytes32 encodePacked = keccak256(abi.encodePacked(_name));

        for (uint256 i = 0; i < candidatesCount; i++) {
            if (keccak256(abi.encodePacked(candidates[i].name)) == encodePacked) {
                index = i;
                foundCandidate = true;
                break;
            }
        }

        require(foundCandidate, "removeCandidate Error: Candidate not found");
        candidatesCount--;

        for (uint256 i = index; i < candidatesCount; i++) {
            candidates[i] = candidates[i + 1];
            candidates[i].id = candidates[i].id - 1;
        }

        candidates.pop();
        updateNames();
    }

    function getCandidatesCount() public view returns(uint) {
        return candidatesCount;
    }

    function getCandidatesNames() public view returns(string[] memory _candidateList) {
        return candidatesNames;
    }

    function getWinner() public view returns(string memory) {
        Candidate memory winner = candidates[0];
        bool tie = false;

        for (uint256 i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > winner.voteCount) {
                winner = candidates[i];
                tie = false;
            } else if (candidates[i].voteCount == winner.voteCount) {
                tie = true;
            }
        }
        
        if (tie) {
            return "Undecided";
        }

        return winner.name;
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        voters[msg.sender] = true;
        candidates[_candidateId - 1].voteCount++;
        emit votedEvent(_candidateId);
    }

    // Reset the President Vote Counts - onlyOwner
    function resetVoteCount() public onlyOwner {
        for (uint256 i = 0; i < candidates.length; i++) {
            candidates[i].voteCount = 0;
        }
    }

    function updateNames() private onlyOwner {
        for (uint256 i = 0; i < candidates.length; i++) {
            candidatesNames[i] = candidates[i].name;
        } 
        candidatesNames.pop();
    }

}

