App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  // countdownDate: new Date(new Date().toJSON().slice(0,11) + "01:00:00").getTime(),
  countdownDate: new Date("2023-07-15T18:00:00").getTime(),
  timerElement: document.getElementById("timer"),
  intervalId: null,
  connected: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  connectWallet: async function() {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
        location.reload();
      } catch(err) {
        console.log(err.message);
      }
    } else {
      alert("Please install Metamask to proceed");
    }
  },

  getAccount: async function() {
    const accounts = await ethereum.enable();
    const account = accounts[0];
    location.reload();
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
      if (account !== null) {
        document.getElementsByClassName('popup')[0].style.display = 'none';
      }
    });

    //POP UP
    //Connect Wallet Event
    if (App.connected) {
      document.getElementsByClassName('popup')[0].style.display = 'none';
    }
    document.getElementById('connect-wallet').addEventListener("click", App.connectWallet);

    //View Votes without connect to wallet
    document.getElementById("close-popup").addEventListener("click",function() {
      document.getElementsByClassName('popup')[0].style.display = 'none';
      loader.hide();
      content.show();
      $("#accountAddress").html("Connect to Metamask to vote.");
    })

    //Account change
    ethereum.on('accountsChanged', function(accounts) {
      if (!accounts.length) {
        loader.show();
        content.hide();
        document.getElementsByClassName('popup')[0].style.display = 'flex';
      }
      App.getAccount();
    })

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 0; i < candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });

    this.timerElement = document.getElementById("timer");
    App.startTimer();
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      // winner = instance.getWinner();
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      location.reload();
    }).catch(function(err) {
      console.error(err);
    });
  },

  startTimer: function() {
    var self = this;

    function updateTimer() {
      var electionInstance;
      var now = new Date().getTime();
      var timeRemaining = self.countdownDate - now;
      
      var goat = '';

      //Calculate remaining hours, minutes, and seconds
      var hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
      var minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
      var seconds = Math.floor((timeRemaining / 1000) % 60);

      var formattedTime = self.padZero(hours) + ":" + self.padZero(minutes) + ":" + self.padZero(seconds);
      self.timerElement.innerHTML = formattedTime;

      if (timeRemaining <= 0) {
        $("#vote").hide();
        clearInterval(self.intervalId);
        self.timerElement.innerHTML = "Countdown Finished!";

        App.contracts.Election.deployed().then(function(instance) {
          electionInstance = instance;
          return electionInstance.getWinner();
        }).then(function(winner) {
          goat = winner;
          // var text = "The basketball GOAT is " + goat;
          $("#winner").html(goat);
        });
      } else {
        $("#winner").hide();
      }
    }

    this.intervalId = setInterval(updateTimer, 1000);
  },

  padZero: function(number) {
    return (number < 10) ? "0" + number : number;
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

document.getElementById('connect-wallet').addEventListener("click", App.connectWallet);