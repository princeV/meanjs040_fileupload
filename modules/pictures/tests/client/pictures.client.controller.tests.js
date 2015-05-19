'use strict';

(function() {
	// Pictures Controller Spec
	describe('Pictures Controller Tests', function() {
		// Initialize global variables
		var PicturesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Pictures controller.
			PicturesController = $controller('PicturesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Picture object fetched from XHR', inject(function(Pictures) {
			// Create sample Picture using the Pictures service
			var samplePicture = new Pictures({
				name: 'New Picture'
			});

			// Create a sample Pictures array that includes the new Picture
			var samplePictures = [samplePicture];

			// Set GET response
			$httpBackend.expectGET('api/pictures').respond(samplePictures);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.pictures).toEqualData(samplePictures);
		}));

		it('$scope.findOne() should create an array with one Picture object fetched from XHR using a pictureId URL parameter', inject(function(Pictures) {
			// Define a sample Picture object
			var samplePicture = new Pictures({
				name: 'New Picture'
			});

			// Set the URL parameter
			$stateParams.pictureId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/pictures\/([0-9a-fA-F]{24})$/).respond(samplePicture);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.picture).toEqualData(samplePicture);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Pictures) {
			// Create a sample Picture object
			var samplePicturePostData = new Pictures({
				name: 'New Picture'
			});

			// Create a sample Picture response
			var samplePictureResponse = new Pictures({
				_id: '525cf20451979dea2c000001',
				name: 'New Picture'
			});

			// Fixture mock form input values
			scope.name = 'New Picture';

			// Set POST response
			$httpBackend.expectPOST('api/pictures', samplePicturePostData).respond(samplePictureResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Picture was created
			expect($location.path()).toBe('/pictures/' + samplePictureResponse._id);
		}));

		it('$scope.update() should update a valid Picture', inject(function(Pictures) {
			// Define a sample Picture put data
			var samplePicturePutData = new Pictures({
				_id: '525cf20451979dea2c000001',
				name: 'New Picture'
			});

			// Mock Picture in scope
			scope.picture = samplePicturePutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/pictures\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/pictures/' + samplePicturePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid pictureId and remove the Picture from the scope', inject(function(Pictures) {
			// Create new Picture object
			var samplePicture = new Pictures({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Pictures array and include the Picture
			scope.pictures = [samplePicture];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/pictures\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePicture);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.pictures.length).toBe(0);
		}));
	});
}());