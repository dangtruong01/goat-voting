var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
  var electionInstance;

  it("initializes with three candidates", function() {
    return Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 3);
    });
  });

  it("it initializes the candidates with the correct values", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidates(0);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Michael Jordan", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return electionInstance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Kobe Bryant", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return electionInstance.candidates(2);
    }).then(function(candidate) {
        assert.equal(candidate[0], 3, "contains the correct id");
        assert.equal(candidate[1], "Lebron James", "contains the correct name");
        assert.equal(candidate[2], 0, "contains the correct votes count");
    });
  });

  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return electionInstance.candidates(candidateId - 1);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })
  });

  it("throws an exception for invalid candiates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(0);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "Michael Jordan did not receive any votes");
      return electionInstance.candidates(1);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "Kobe Bryant did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate3) {
        var voteCount = candidate3[2];
        assert.equal(voteCount, 0, "Lebron James did not receive any votes");
      });
  });

  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(function(receipt) {
        return electionInstance.candidates(candidateId - 1);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      console.log(candidate[1]);
      console.log(voteCount);
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(2, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(0);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "Michael Jordan did not receive any votes");
      return electionInstance.candidates(1);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "Kobe Bryant did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate3) {
        var voteCount = candidate3[2];
        assert.equal(voteCount, 0, "Lebron James did not receive any votes");
      });
  });

  it("announces a tie for multiple winners", function() {
    return Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.getWinner();
    }).then(function(winner) {
        assert(winner, "undecided", "multiple winners should lead to an undecided GOAT");
    })
  })
});
