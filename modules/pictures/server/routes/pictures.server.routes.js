'use strict';

module.exports = function(app) {
	var pictures = require('../controllers/pictures.server.controller');
	var picturesPolicy = require('../policies/pictures.server.policy');

	// Pictures Routes
	app.route('/api/pictures').all()
		.get(pictures.list).all(picturesPolicy.isAllowed)
		.post(pictures.uploadImage);

    app.route('/api/savepicture').all(picturesPolicy.isAllowed)
		.post(pictures.uploadImage);

	app.route('/api/pictures/:pictureId').all(picturesPolicy.isAllowed)
		.get(pictures.read)
		.put(pictures.update)
		.delete(pictures.delete);

	// Finish by binding the Picture middleware
	app.param('pictureId', pictures.pictureByID);


};
