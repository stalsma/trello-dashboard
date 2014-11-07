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

			// Get boards for the selected organisation
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
