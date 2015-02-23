  // Trello Factory (experimental)
  var trelloLibrary = angular.module('trelloLibrary', []);

  trelloLibrary.service("trelloService", function($http, $q, $rootScope){
    var functions = {
      //
      login: function() {
        Trello.authorize({
          type: "redirect"
        });
      },

      //
      logout: function() {
        Trello.deauthorize();
      },

      //
      authorise: function() {
        var deferred = $q.defer();
        Trello.authorize({
          interactive: false,
          success: deferred.resolve()
        });
        return deferred.promise;
      },

      getUser: function() {
        var deferred = $q.defer();
        var user     = [];

        Trello.get("members/me", {fields: "username,fullName,avatarHash,url"}, function(me){
          deferred.resolve(me);
        });
        deferred.promise.then(function(me){
          user.push(me);
        });
        return user;
      },

      // Get a list of this user's organisations from Trello
      getOrganisations: function() {
        var deferred = $q.defer();
        var organisations = [];

        // Add a 'dummy' organisation for "My Boards"
        organisations.push({id:"my",name:"My Boards",displayName:"My Boards",url:"",closed:false});

        // Add a 'dummy' organisation for "Starred" boards
        organisations.push({id:"starred",name:"Starred Boards",displayName:"Starred Boards",url:"",closed:false});

        // Get a list of my organisations
        Trello.get("members/me/organizations", {fields: "name,displayName,url,closed"}, function(organisations) {
          deferred.resolve(organisations);
        });
        deferred.promise.then(function(value) {
          $.each(value, function(i, organisation) {
            organisations.push(organisation);
          });
        });
        return organisations;
      },

      //
      getBoards: function(organisationId) {
        var organisationBoards   = [];
        var deferred = $q.defer();

        // Get boards for the selected organisation
        if(organisationId == "my") {
          Trello.get("members/me/boards", {lists:"open"}, function(boards) {
            deferred.resolve(boards);
          });
          deferred.promise.then(function(boards) {
            angular.forEach(boards,function(board,i) {
              if(board.idOrganization == null) {
                organisationBoards.push(functions.getListCards(board));
              }
            });
          });
        } else if (organisationId == "starred") {
          Trello.get("members/me/boards", {filter:"starred",lists:"open"}, function(boards) {
            deferred.resolve(boards);
          });
          deferred.promise.then(function(boards) {
            angular.forEach(boards,function(board,i) {
              organisationBoards.push(functions.getListCards(board));
            });
          });
        } else {
          Trello.get("organizations/"+organisationId+"/boards", {lists:"open"}, function(boards) {
            deferred.resolve(boards);
          });
          deferred.promise.then(function(boards) {
            $.each(boards, function(i, board) {
              organisationBoards.push(functions.getListCards(board));
            });
          });
        };
        return organisationBoards;
      },

      //
      getListCards: function(board) {
        board.chart = [];
        angular.forEach(board.lists, function(list, j) {
          list.cards = [];
          var deferred = $q.defer();
          Trello.get("lists/" + list.id + "/cards", {}, function(cards) {
            deferred.resolve(cards);
          });
          deferred.promise.then(function(cards) {
            board.chart.push({key:list.name, y:cards.length});
            list.cards = cards;
          });
        });
        return board;
      },
    }
    return functions;
  });
