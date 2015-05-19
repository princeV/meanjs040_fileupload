'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Pictures Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['admin'],
		allows: [{
			resources: '/api/pictures',
			permissions: '*'
		}, {
			resources: '/api/pictures/:pictureId',
			permissions: '*'
		}, {
			resources: '/api/savepicture',
			permissions: '*'
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/pictures',
			permissions: ['get', 'post']
		}, {
			resources: '/api/pictures/:pictureId',
			permissions: ['get']
		}, {
			resources: '/api/savepicture',
			permissions: ['get', 'post']
		}]
	},{
		roles: ['guest'],
		allows: [{
			resources: '/api/pictures',
			permissions: ['get']
		}, {
			resources: '/api/pictures/:pictureId',
			permissions: ['get']
		}, {
			resources: '/api/savepicture',
			permissions: ['get', 'post']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// If an picture is being processed and the current user created it then allow any manipulation
	if (req.picture && req.user && req.picture.user.id === req.user.id) {
		return next();
	}

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else {
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};
