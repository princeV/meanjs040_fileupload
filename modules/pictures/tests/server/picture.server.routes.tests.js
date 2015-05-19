'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Picture = mongoose.model('Picture'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, picture;

/**
 * Picture routes tests
 */
describe('Picture CRUD tests', function() {
	before(function(done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app);

		done();
	});

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Picture
		user.save(function() {
			picture = {
				name: 'Picture Name'
			};

			done();
		});
	});

	it('should be able to save Picture instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/api/pictures')
					.send(picture)
					.expect(200)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Get a list of Pictures
						agent.get('/api/pictures')
							.end(function(picturesGetErr, picturesGetRes) {
								// Handle Picture save error
								if (picturesGetErr) done(picturesGetErr);

								// Get Pictures list
								var pictures = picturesGetRes.body;

								// Set assertions
								(pictures[0].user._id).should.equal(userId);
								(pictures[0].name).should.match('Picture Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Picture instance if not logged in', function(done) {
		agent.post('/api/pictures')
			.send(picture)
			.expect(403)
			.end(function(pictureSaveErr, pictureSaveRes) {
				// Call the assertion callback
				done(pictureSaveErr);
			});
	});

	it('should not be able to save Picture instance if no name is provided', function(done) {
		// Invalidate name field
		picture.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/api/pictures')
					.send(picture)
					.expect(400)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Set message assertion
						(pictureSaveRes.body.message).should.match('Please fill Picture name');
						
						// Handle Picture save error
						done(pictureSaveErr);
					});
			});
	});

	it('should be able to update Picture instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/api/pictures')
					.send(picture)
					.expect(200)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Update Picture name
						picture.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Picture
						agent.put('/api/pictures/' + pictureSaveRes.body._id)
							.send(picture)
							.expect(200)
							.end(function(pictureUpdateErr, pictureUpdateRes) {
								// Handle Picture update error
								if (pictureUpdateErr) done(pictureUpdateErr);

								// Set assertions
								(pictureUpdateRes.body._id).should.equal(pictureSaveRes.body._id);
								(pictureUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Pictures if not signed in', function(done) {
		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			// Request Pictures
			request(app).get('/api/pictures')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Picture if not signed in', function(done) {
		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			request(app).get('/api/pictures/' + pictureObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', picture.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Picture instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Picture
				agent.post('/api/pictures')
					.send(picture)
					.expect(200)
					.end(function(pictureSaveErr, pictureSaveRes) {
						// Handle Picture save error
						if (pictureSaveErr) done(pictureSaveErr);

						// Delete existing Picture
						agent.delete('/api/pictures/' + pictureSaveRes.body._id)
							.send(picture)
							.expect(200)
							.end(function(pictureDeleteErr, pictureDeleteRes) {
								// Handle Picture error error
								if (pictureDeleteErr) done(pictureDeleteErr);

								// Set assertions
								(pictureDeleteRes.body._id).should.equal(pictureSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Picture instance if not signed in', function(done) {
		// Set Picture user 
		picture.user = user;

		// Create new Picture model instance
		var pictureObj = new Picture(picture);

		// Save the Picture
		pictureObj.save(function() {
			// Try deleting Picture
			request(app).delete('/api/pictures/' + pictureObj._id)
			.expect(403)
			.end(function(pictureDeleteErr, pictureDeleteRes) {
				// Set message assertion
				(pictureDeleteRes.body.message).should.match('User is not authorized');

				// Handle Picture error error
				done(pictureDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Picture.remove().exec(function(){
				done();
			});
		});
	});
});
