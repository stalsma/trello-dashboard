	// Dashboard
	var app = angular.module('dashboardApp', ['nvd3ChartDirectives', 'ngRoute', 'trelloLibrary']);

	app.config(
		function ($routeProvider){
			$routeProvider
				.when(
					"/:organisationId/:filter",
					{
						action: ""
					}
				)
		}
	);

	app.controller('DashboardController', ['$scope', '$http', '$q', '$route', '$routeParams', '$location', 'trelloService', function($scope, $http, $q, $route, $routeParams, $location, trelloService) {
		$scope.authorised = false;

		$scope.user = null;
		$scope.organisations = [];
		$scope.boards = [];

		$scope.selectedOrganisation = null;
		$scope.filter = 'open';

		$scope.search = null;

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
			trelloService.authorise();
			$scope.authorised = Trello.authorized();
			$scope.loadOrganisations();
			$scope.user = trelloService.getUser();
		};

		$scope.login = function() {
			trelloService.login();
		};

		$scope.logout = function() {
			trelloService.logout();

			$scope.authorised = false;
			$scope.organisations = [];
			$scope.boards = [];
			$scope.selectedOrganisation = null;
		}

		$scope.loadOrganisations = function() {
			$scope.organisations = trelloService.getOrganisations();
		}

		$scope.loadBoards = function() {
			$scope.boards = trelloService.getBoards($scope.selectedOrganisation.id);
		};

		$scope.updatePath = function() {
			$location.path("/" + $scope.selectedOrganisation.id + "/" + $scope.filter);
		};

		$scope.$on(
			"$routeChangeSuccess",
			function($currentRoute, $previousRoute) {
				$scope.selectedOrganisation = $.grep($scope.organisations, function(o){return o.id == $routeParams.organisationId})[0];
				$scope.filter = $routeParams.filter;
				$scope.loadBoards();
			}
		);

		$scope.init();
	}]);
