'use strict';

//Setting up route
angular.module('pictures').config(['$stateProvider',
	function($stateProvider) {
		// Pictures state routing
		$stateProvider.
		state('pictures', {
			abstract: true,
			url: '/pictures',
			template: '<ui-view/>'
		}).
		state('pictures.list', {
			url: '',
			templateUrl: 'modules/pictures/views/list-pictures.client.view.html'
		}).
		state('pictures.create', {
			url: '/create',
			templateUrl: 'modules/pictures/views/create-picture.client.view.html'
		}).
		state('pictures.view', {
			url: '/:pictureId',
			templateUrl: 'modules/pictures/views/view-picture.client.view.html'
		}).
		state('pictures.edit', {
			url: '/:pictureId/edit',
			templateUrl: 'modules/pictures/views/edit-picture.client.view.html'
		});
	}
]);
