const express = require('express');
const { Op } = require('sequelize');
const { Spot, User, Image, Review, Booking } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth.js');
const router = express.Router();
const moment = require('moment');


const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .withMessage('Latitude is required')
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage('Longitude is required')
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude must be within -180 and 180'),
    check('name')
        .exists({ checkFalsy: true })
        .withMessage('name is required')
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .withMessage('price is required')
        .isFloat({ gt: 0 })
        .withMessage('Price per day must be a positive number'),
    handleValidationErrors
];
  
const validateBookingDates = [
    check('startDate')
        .exists({ checkFalsy: true })
        .withMessage('startDate must be a valid date')
        .custom(value => {
            const startDate = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (startDate < today) {
                throw new Error('startDate cannot be in the past')
            }
            return true
        }),
    check('endDate')
        .exists({ checkFalsy: true })
        .withMessage('endDate must be a valid date')
        .custom((value, { req }) => {
            const endDate = new Date(value)
            const startDate = new Date(req.body.startDate)
            if (endDate <= startDate) {
                throw new Error('endDate cannot be on or before startDate')
            }
            return true
        })
];

async function checkBookingConflict(startDate, endDate, spotId) {
    const utcStartDate = moment(startDate).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const utcEndDate = moment(endDate).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const conflictingBookings = await Booking.findAll({
        where: {
            spotId: spotId,
            [Op.or]: [
                {
                    startDate: {
                        [Op.lte]: utcEndDate
                    },
                    endDate: {
                        [Op.gte]: utcStartDate
                    }
                }
            ]
        }
    })
    return conflictingBookings.length > 0
};

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .withMessage('Stars is required')
        .isInt({min: 1, max: 5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

// Get all Spots
router.get('/', async (req, res) => {

    let page = 1
    let size = 20
    let limit
    let offset
    
    const errors = {}

    if (req.query.page) {
        page = parseInt(req.query.page);
        if (isNaN(page) || page < 1) {
            errors.page = "Page must be greater than or equal to 1"
        }
    }
    if (req.query.size) {
        size = parseInt(req.query.size);
        if (isNaN(size) || size < 1 || size > 20) {
            errors.size = "Size must be between 1 and 20"
        }
    }

    limit = size
    offset = size * (page - 1)

    const where = {};

    if (req.query.maxLat) {
        const maxLat = parseFloat(req.query.maxLat)
        if (maxLat <= 90) {
            where.lat = { ...where.lat, [Op.lte]: maxLat }
        } else {
            errors.maxLat = "Maximum latitude is invalid"
        }
    }

    if (req.query.minLat) {
        const minLat = parseFloat(req.query.minLat)
        if (minLat >= -90) {
            where.lat = { ...where.lat, [Op.gte]: minLat }
        } else {
            errors.minLat = "Minimum latitude is invalid"
        }
    }

    if (req.query.maxLng) {
        const maxLng = parseFloat(req.query.maxLng)
        if (maxLng <= 180) {
            where.lng = { ...where.lng, [Op.lte]: maxLng }
        } else {
            errors.maxLng = "Maximum longitude is invalid"
        }
    }

    if (req.query.minLng) {
        const minLng = parseFloat(req.query.minLng)
        if (minLng >= -180) {
            where.lng = { ...where.lng, [Op.gte]: minLng }
        } else {
            errors.minLng = "Minimum longitude is invalid"
        }
    }

    if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice)
        if (maxPrice >= 0) {
            where.price = { ...where.price, [Op.lte]: maxPrice }
        } else {
            errors.maxPrice = "Maximum price must be greater than or equal to 0"
        }
    }

    if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice)
        if (minPrice >= 0) {
            where.price = { ...where.price, [Op.gte]: minPrice }
        } else {
            errors.minPrice = "Minimum price must be greater than or equal to 0"
        }
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: "Validation error", errors });
    }

    const spots = await Spot.findAll({
        where,
        attributes: [
            'id',
            'ownerId',
            'address',
            'city',
            'state',
            'country',
            'lat',
            'lng',
            'name',
            'description',
            'price',
            'createdAt',
            'updatedAt',
        ],
        limit,
        offset
    });

    await Promise.all(spots.map(async spot => {
        const reviews = await Review.findAll({
            where: {
                spotId: spot.id
            }
        });
    
        const sumStars = reviews.reduce((sum, review) => (
            sum + review.stars
        ), 0);

        const avgStarRating = sumStars / reviews.length;

        const previewImage = await Image.findAll({
            where: {
                imageableId: spot.id,
                imageableType: 'spot'
            },
            attributes:
                [
                    'url'
                ]
        })

        spot.dataValues.avgRating = avgStarRating
        spot.dataValues.previewImage = previewImage.length > 0 ? previewImage[0].url : null;
    }))

    // console.log(spots)
    res.status(200).json(spots);
});

// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
        
    // console.log(user)
    if (user) {

        const spots = await Spot.findAll({
            where: {
                ownerId: user.id,
            },
            include: [{
                model: Image,
                as: 'SpotImages',
                attributes: ['id', 'url', 'preview']
            }]
        });

        await Promise.all(spots.map(async spot => {
            const reviews = await Review.findAll({
                where: {
                    spotId: spot.id
                }
            });
        
            const sumStars = reviews.reduce((sum, review) => (
                sum + review.stars
            ), 0);
    
            const avgStarRating = sumStars / reviews.length;
    
            const previewImage = await Image.findAll({
                where: {
                    imageableId: spot.id,
                    imageableType: 'spot'
                },
                attributes:
                    [
                        'url'
                    ]
            })
    
            spot.dataValues.avgRating = avgStarRating
            spot.dataValues.previewImage = previewImage.length > 0 ? previewImage[0].url : null;
        }))

        return res.status(200).json({
            spots
        });
    } else {
        return res.status(401).json({
            user
        });
    }
});

// Get details of a Spot from an id
router.get('/:id', async (req, res) => {
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let numReviews = await Review.count({
        where: {
            spotId: spotId
        }
    })
    const reviews = await Review.findAll({
        where: {
            spotId: spotId
        }
    });

    const sumStars = reviews.reduce((sum, review) => (
        sum + review.stars
    ), 0);

    const avgStarRating = sumStars / reviews.length;
    
    let spot = await Spot.findByPk(spotId, {
        attributes: [
            'id',
            'ownerId',
            'address',
            'city',
            'state',
            'country',
            'lat',
            'lng',
            'name',
            'description',
            'price',
            'createdAt',
            'updatedAt'
        ],
        include: [
            {
                model: User,
                as: 'Owner',
                attributes: ['id', 'firstName', 'lastName']
            }, {
                model: Image,
                as: 'SpotImages',
                attributes: ['id', 'url', 'preview']
            }]
    });
    // console.log(spot)
    if (spot) {
        spot.dataValues.numReviews = numReviews
        spot.dataValues.avgStarRating = avgStarRating
    }
    if (!spot) {
        res.status(404);
        res.send({ message: "Spot couldn't be found" });
    }

    res.status(200).json(spot);
});
  
// Create a Spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
    const { user } = req
    const { address, city, state, country, lat, lng, name, description, price } = req.body
    const newSpot = Spot.build({
        ownerId: user.id,
        address, city, state, country, lat, lng, name, description, price
    })
    await newSpot.save()
    res.status(201).json({
        status: "success",
        message: "Successfully created new spot",
        data: newSpot
    })
});

// Add an Image to a Spot based on the Spot's id
router.post('/:id/images', requireAuth, async (req, res) => {
    const { user } = req
    const { url, preview } = req.body
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId);
    if (spot) {
        if (user.id === spot.ownerId) {
            const newImage = Image.build({
                imageableId: spotId,
                imageableType: "spot",
                url: url,
                preview
            })
            await newImage.save()
            res.status(201).json({
                status: "success",
                message: "Successfully added new image",
                data: newImage
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        })
    };
});

// Edit a Spot
router.put('/:id', requireAuth, validateSpot, async (req, res) => {
    const { user } = req
    const { address, city, state, country, lat, lng, name, description, price } = req.body
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId);
    if (spot) {
        if (user.id === spot.ownerId) {
            spot.set({
                address: address,
                city: city,
                state: state,
                country: country,
                lat: lat,
                lng: lng,
                name: name,
                description: description,
                price: price
            })
            await spot.save()
            return res.status(200).json({
                status: "success",
                message: 'Successfully updated spot',
                data: spot
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        };
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        })
    };
});

// Delete a Spot
router.delete('/:id', requireAuth, async (req, res) => {
    const { user } = req
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId)
    if (spot) {
        if (user.id === spot.ownerId) {
            await spot.destroy()
            res.status(200).json({     
                status: "success",
                message: `Successfully deleted`,
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        }                                
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        })
    }
});

// Get all Reviews by a Spot's id
router.get('/:id/reviews', async (req, res) => {
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId);
    if (spot) { 
        let review = await Review.findAll({
            where: {
                spotId: spotId
            },
            attributes: [
                'id',
                'userId',
                'spotId',
                'review',
                'stars',
                'createdAt',
                'updatedAt',
            ],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes:['id', 'firstName', 'lastName']
                }, {
                    model: Image,
                    as: 'ReviewImages',
                    attributes: ['id','url']
                }]
        });
        res.status(200).json(review);
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        });
    }
});


// Create a Review for a Spot based on the Spot's id
router.post('/:id/reviews', requireAuth, validateReview, async (req, res) => {
    const { user } = req
    const { review, stars } = req.body
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId);
    if (spot) {
        const newReview = Review.build({
            userId: user.id,
            spotId: spotId,
            review: review,
            stars: stars
        })
        const existingReview = await Review.findOne({
            where: {
                spotId: spotId,
                userId: user.id
            }
        })
        if (existingReview) {
            return res.status(500).json({
                messaege: "User already has a review for this spot"
            })
        }
        await newReview.save()
        const reviews = await Review.findAll({
            where: {
                spotId: spotId
            }
        });
    
        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
        const avgStarRating = totalStars / reviews.length;
        const numReviews = reviews.length;
    
        // Update spot with the new average rating and number of reviews
        spot.avgStarRating = avgStarRating;
        spot.numReviews = numReviews;
        await spot.save();
        
        res.status(201).json({
            status: "success",
            message: "Successfully added new review",
            data: newReview
        });
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        });
    }
});


// Get all Bookings for a Spot based on the Spot's id
router.get('/:id/bookings', requireAuth, async (req, res) => {
    const { user } = req
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId)
    if (spot) {
        if ( spot.ownerId === user.id) {
            let myspotBooking = await Booking.findAll({
                where: {
                    spotId: spotId,
                    userId: user.id
                },
                attributes: [
                    'id',
                    'spotId',
                    'userId',
                    'startDate',
                    'endDate',
                    'createdAt',
                    'updatedAt'
                ],
                include: [
                    {
                        model: Spot,
                        as: 'Spot',
                        attributes: ['id','ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
                    }]
            });
            return res.status(200).json(myspotBooking);
        } else {
            let booking = await Booking.findAll({
                where: {
                    spotId: spotId,
                },
                attributes: [
                    'spotId',
                    'startDate',
                    'endDate'
                ]
            });
            return res.status(200).json(booking);
        }
    } else {
        res.status(404);
        res.send({ message: "Spot couldn't be found" });
    };
});


// Create a Booking from a Spot based on the Spot's id
router.post('/:id/bookings', requireAuth, validateBookingDates, async (req, res) => {
    const { user } = req
    const spotId = parseInt(req.params.id, 10); // Ensure spotId is an integer

    if (isNaN(spotId)) {
        return res.status(400).json({
            message: "Invalid spot ID"
        });
    }
    let spot = await Spot.findByPk(spotId)
    if (spot) {
        if (spot.ownerId != user.id) {
            const { startDate, endDate } = req.body
            const utcStartDate = moment(startDate).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const utcEndDate = moment(endDate).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Bad Request",
                    errors: errors.mapped()
                })
            }
            const conflict = await checkBookingConflict(utcStartDate, utcEndDate, spot.id);
            if (conflict) {
                return res.status(403).json({
                    message: "Sorry, this spot is already booked for the specified dates",
                    errors: {
                        startDate: "Start date conflicts with an existing booking",
                        endDate: "End date conflicts with an existing booking"
                    }
                })
            }
            const newBooking = Booking.build({
                userId: user.id,
                spotId: spotId,
                startDate: utcStartDate,
                endDate: utcEndDate
            })
            
            await newBooking.save()
            res.status(201).json({
                status: "success",
                message: "Successfully added new booking",
                data: newBooking
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        } 
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        })
    };
});

module.exports = router;