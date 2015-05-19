'use strict';

// Pictures controller
angular.module('pictures').controller('PicturesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Pictures',
	function($scope, $stateParams, $location, Authentication, Pictures ) {
		$scope.authentication = Authentication;


		// Remove existing Picture
		$scope.remove = function( picture ) {
			if ( picture ) { picture.$remove();

				for (var i in $scope.pictures ) {
					if ($scope.pictures [i] === picture ) {
						$scope.pictures.splice(i, 1);
					}
				}
			} else {
				$scope.picture.$remove(function() {
					$location.path('pictures');
				}, function(errorResponse) {
					// Even if the picture could not be deleted from filesystem do a redirect
					$location.path('pictures');
				});
			}
		};

		// Update existing Picture
		$scope.update = function() {
			var picture = $scope.picture ;

			picture.$update(function() {
				$location.path('pictures/' + picture._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Pictures
		$scope.find = function() {
			$scope.pictures = Pictures.query();
		};

		// Find existing Picture
		$scope.findOne = function() {
			$scope.picture = Pictures.get({ 
				pictureId: $stateParams.pictureId
			});
		};
	}
]);
