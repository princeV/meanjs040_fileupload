'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    mongoose = require('mongoose'),
    lwip = require('lwip'),
    Picture = mongoose.model('Picture'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));




function calculateMinImageSize(maxWidth, maxHeight, image) {
    var aspectRatio = maxHeight / maxWidth;
    var imgageAspectRatio = image.height() / image.width();
    var targetwidth = maxWidth;
    var targetheight = maxHeight;

    if (aspectRatio > imgageAspectRatio) {
        targetheight = targetwidth / image.width() * image.height();
    }
    else {
        targetwidth = targetheight / image.height() * image.width();
    }

    var imageSize = {
        width: targetwidth,
        height: targetheight
    };

    return imageSize;
}

function calculateMaxImageSize(maxWidth, maxHeight, image) {
    var aspectRatio = maxHeight / maxWidth;
    var imgageAspectRatio = image.height() / image.width();
    var targetwidth = maxWidth;
    var targetheight = maxHeight;

    if (aspectRatio < imgageAspectRatio) {
        targetheight = targetwidth / image.width() * image.height();
    }
    else {
        targetwidth = targetheight / image.height() * image.width();
    }

    var imageSize = {
        width: targetwidth,
        height: targetheight
    };

    return imageSize;
}


/**
 * Create a Picture
 */
exports.create = function (req, res) {
    var picture = new Picture(req.body);
    picture.user = req.user;
    picture.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(picture);
        }
    });
};

/**
 * Show the current Picture
 */
exports.read = function (req, res) {
    res.jsonp(req.picture);
};

/**
 * Update a Picture
 */
exports.update = function (req, res) {
    var picture = req.picture;

    picture = _.extend(picture, req.body);

    picture.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(picture);
        }
    });
};

/**
 * Delete an Picture
 */
exports.delete = function (req, res) {
    var picture = req.picture;
    var waterfallFunctions = [];


    //loop through the array of the picture sizes:
    var i;
    for (i = 0; i < picture.sizes.length; i++) {
        var unlinkPictureObject = {
            pictureSource: picture.sizes[i].source,
            /* jshint loopfunc:true */
            unlinkPicture: function (callback) {
                fs.unlink(this.pictureSource, function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null);
                    }
                });
            }
        };

        waterfallFunctions.push(unlinkPictureObject.unlinkPicture.bind(unlinkPictureObject));
    }
    waterfallFunctions.push(
        function (callback) {
            picture.remove(function (error) {
                if (error) {
                    callback(error);
                } else {
                    callback(null);
                }
            });
        }
    );

    async.waterfall(waterfallFunctions, function (error) {
        if (error) {
            console.log(error);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(error)
            });
        }
        else {
            res.jsonp(picture);
        }
    });
}
;

/**
 * List of Pictures
 */
exports.list = function (req, res) {
    Picture.find().sort('-created').populate('user', 'displayName').exec(function (err, pictures) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(pictures);
        }
    });
};

/**
 * Picture middleware
 */
exports.pictureByID = function (req, res, next, id) {
    Picture.findById(id).populate('user', 'displayName').exec(function (err, picture) {
        if (err) return next(err);
        if (!picture) return next(new Error('Failed to load Picture ' + id));
        req.picture = picture;
        next();
    });
};

/**
 * Update profile picture
 */
exports.uploadImage = function (req, res) {
    var message = null;
    var picture = new Picture(req.body);
    console.log(req.body);
    picture.user = req.user;
    picture.sizes = [];
    picture.fileName = req.files.file.originalname;

    var pictureNameFull = req.files.file.originalname;
    var pictureName = pictureNameFull.substr(0, pictureNameFull.lastIndexOf('.'));
    var pictureExtension = pictureNameFull.substr(pictureNameFull.lastIndexOf('.') + 1);
    var picturePath = 'modules/pictures/client/img/';
    var pictureSavePath = './modules/pictures/client/img/';
    var pictureBuffer = req.files.file.buffer;

    async.waterfall([
        function openLwip(openLwipCallback) {
            lwip.open(pictureBuffer, pictureExtension, function (error, image) {
                if (error) {
                    openLwipCallback(error);
                } else {
                    openLwipCallback(null, image);
                }
            });
        },
       /* function writeFile(image, callback) {
            var picturePathFull = pictureSavePath.concat(pictureName, '.', pictureExtension);
            image.writeFile(picturePathFull, function (error) {
                if (error) {
                    callback(error);
                } else {
                    picture.sizes.push(
                        {
                            label: 'original',
                            source: picturePathFull,
                            width: image.width(),
                            height: image.height()
                        }
                    );
                    callback(null, image);
                }
            });
        },*/
        function writePictureMedium(image, callback) {
            //change the picturepath:
            var picturePathFull = pictureSavePath.concat(pictureName, '_large.', pictureExtension);
            //calculate the image height:
            var imageSize = calculateMinImageSize(1024, 768, image);
            image.batch()
                .resize(imageSize.width, imageSize.height, 'lanczos')
                .writeFile(picturePathFull, function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        picture.sizes.push(
                            {
                                label: 'large',
                                source: picturePathFull,
                                width: image.width(),
                                height: image.height()
                            }
                        );
                        callback(null, image);
                    }
                });
        },
        function writePictureMedium(image, callback) {
            //change the picturepath:
            var picturePathFull = pictureSavePath.concat(pictureName, '_medium.', pictureExtension);
            //calculate the image height:
            var imageSize = calculateMinImageSize(640, 480, image);
            image.batch()
                .resize(imageSize.width, imageSize.height, 'lanczos')
                .writeFile(picturePathFull, function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        picture.sizes.push(
                            {
                                label: 'medium',
                                source: picturePathFull,
                                width: image.width(),
                                height: image.height()
                            }
                        );
                        callback(null, image);
                    }
                });
        },
        function writeSquareImage(image, callback) {
            //calculate the image height:
            var imageSquareSize = {width: 150, height: 150};
            var imageSize = calculateMaxImageSize(imageSquareSize.width, imageSquareSize.height, image);
            var picturePathFull = pictureSavePath.concat(pictureName, '_square.', pictureExtension);
            image.batch()
                .resize(imageSize.width, imageSize.height, 'lanczos')
                .crop(imageSquareSize.width, imageSquareSize.height)
                .writeFile(picturePathFull, function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        picture.sizes.push(
                            {
                                label: 'square',
                                source: picturePathFull,
                                width: imageSquareSize.width,
                                height: imageSquareSize.height
                            }
                        );
                        callback(null);
                    }
                });
        },
        function savePicture(callback) {
            picture.save(function (error) {
                if (error) {
                    callback(error);
                } else {
                    callback(null);
                }
            });
        }
    ], function (error) {
        if (error) {
            return res.status(400).send({
                message: error.toString()//'Error occurred while uploading the picture to the filesystem'
            });
        }
        else {
            res.jsonp(picture);
        }
    });
};
