	// Dashboard
	var app = angular.module('dashboardApp', ['nvd3ChartDirectives', 'ngRoute', 'trelloLibrary', 'ngMaterial'])
	.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryColor('blue-grey')
		.accentColor('blue-grey')
		.warnColor('red');
	});

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

	app.controller('DashboardController', ['$scope', '$http', '$q', '$route', '$routeParams', '$location', 'trelloService', '$mdSidenav', function($scope, $http, $q, $route, $routeParams, $location, trelloService, $mdSidenav) {
		$scope.authorised = false;

		$scope.user = null;
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
				console.log($scope.selectedOrganisation.id + ' ' + $scope.filter);
				$scope.loadBoards();
			}
		);

		$scope.toggleSidenav = function(menuId) {
			$mdSidenav(menuId).toggle();
		};

		$scope.init();
	}]);
