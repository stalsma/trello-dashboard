(function(){
	var app = angular.module('dashboardApp', ['nvd3ChartDirectives']);
	
	app.controller('DashboardController', ['$scope', '$http', '$q', function($scope, $http, $q) {
		$scope.authorised = false;

		$scope.organisations = [];
		$scope.boards = [];

		$scope.selectedOrganisation = null;
		$scope.filter = 'open';

		$scope.xFunction = function(){
                	return function(d) {
                    		return d.key;
                	};
            	}
            	$scope.yFunction = function(){
                	return function(d) {
                    		return d.y;
                	};
            	}

		$scope.init = function() {
			$scope.authorise();
				$scope.authorised = Trello.authorized();
				$scope.loadOrganisations();
		};

		$scope.authorise = function() {
			var deferred = $q.defer();
			Trello.authorize({
				interactive: false,
				success: deferred.resolve() 
			});
			return deferred.promise;
		};

		$scope.loadOrganisations = function() {
			var deferred = $q.defer();
		
			// Add a 'dummy' organisation for "My Boards"	
			$scope.organisations.push({id:"my",name:"My Boards",displayName:"My Boards",url:"",closed:false});
			$scope.selectedOrganisation = $scope.organisations[0];
			$scope.loadBoards();

			// Add a 'dummy' organisation for "Starred" boards
			$scope.organisations.push({id:"starred",name:"Starred Boards",displayName:"Starred Boards",url:"",closed:false});

			// Get a list of my organisations
			Trello.get("members/me/organizations", {fields: "name,displayName,url,closed"}, function(organisations) {
				deferred.resolve(organisations);
			});
			deferred.promise.then(function(value) { 
				$.each(value, function(i, organisation) {
					$scope.organisations.push(organisation);
				});
			});
		}

		$scope.loadBoards = function() {
			$scope.boards = [];
			var deferred = $q.defer();

			var selected = $scope.selectedOrganisation.id;

			// Get boards for the selected organisation
			if(selected == "my") {
				Trello.get("members/me/boards", {lists:"all"}, function(boards) {
					deferred.resolve(boards);
				});
				deferred.promise.then(function(boards) {
					angular.forEach(boards,function(board,i) {
						if(board.idOrganization == null) {
							$scope.boards.push(board);
						}
					});
					$scope.loadLists();
				});
			} else if (selected == "starred") {
				Trello.get("members/me/boards", {filter:"starred",lists:"all"}, function(boards) {
                                        deferred.resolve(boards);
                                });
                                deferred.promise.then(function(boards) {
                                        angular.forEach(boards,function(board,i) {
                                        	$scope.boards.push(board);
                                        });
                                        $scope.loadLists();
                                });

			} else {
				Trello.get("organizations/"+$scope.selectedOrganisation.id+"/boards", {lists:"all"}, function(boards) {
					deferred.resolve(boards);
				});
				deferred.promise.then(function(boards) {
					$.each(boards, function(i, board) {
						$scope.boards.push(board);
					});
					$scope.loadLists();
				});
			};
		};

		$scope.loadLists = function() {
			$.each($scope.boards, function(i, board) {
				board.chart = [];
				$.each(board.lists, function(j, list) {
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
			});
		};

		$scope.changeOrganisation = function() {
			$scope.loadBoards();
		};

		$scope.login = function() {
			Trello.authorize({
				type: "redirect"
			});
		};

		$scope.logout = function() {
			Trello.deauthorize();
			$scope.authorised = false;
			$scope.organisations = [];
			$scope.boards = [];
			$scope.selectedOrganisation = null;
		}

		$scope.init();
	}]);
})();
