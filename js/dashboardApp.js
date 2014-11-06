(function(){
	var app = angular.module('dashboardApp', []);
	
	app.controller('DashboardController', ['$scope', '$http', '$q', function($scope, $http, $q) {
		$scope.organisations = [];
		$scope.boards = [];

		$scope.selectedOrganisation = null;
		$scope.filter = 'open';

		$scope.init = function() {
			console.log('Starting init()..');
			$scope.authorise();
			$scope.loadOrganisations();
			console.log('Closing init()..');
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
			console.log('Starting getOrganisations()..');
			var deferred = $q.defer();
			Trello.get("members/me/organizations", {fields: "name,displayName,url,closed"}, function(organisations) {
				deferred.resolve(organisations);
			});
			deferred.promise.then(function(value) { 
				console.log(value);
				$.each(value, function(i, organisation) {
					$scope.organisations.push(organisation);
				});
			});
			console.log('Closing getOrganisations()..');
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
					console.log(board);
					$scope.boards.push(board);
				});
			});
	
		};

		$scope.changeOrganisation = function() {
			$scope.loadBoards();
		};

		$scope.init();
	}]);
})();
