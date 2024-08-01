const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Spot, User, Image, Review } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const requireAuth = (req, res, next) => {
    if (req.user) {
        return next();
    } else {
        return res.status(401).json({ message: "Authentication required" });
    }
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


// Get all Reviews owned by the Current User
router.get('/current', async (req, res) => {
        const { user } = req;
        console.log(user)
    if (user) {
        const review = await Review.findAll({
            where: {
                userId: user.id,
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
                    model: Spot,
                    as: 'Spot',
                    attributes: ['id','ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
                },
                {
                    model: Image,
                    as: 'ReviewImages',
                    attributes: ['id', 'url']
                }]
        });
        return res.status(200).json({
            review
        });
      } else {
        return res.status(401).json({
            message: "Authentication required"
        });
    }
    }
);
  

// Add an Image to a Review based on the Review's id
router.post(
    '/:id/images',
    async (req, res) => {
        const { user } = req;
        if (user) {
            const { url } = req.body
            let review = await Review.findByPk(req.params.id, {
                include: [{
                    model: Image,
                    as: 'ReviewImages'
                }]
            });
            if (review) {
                if (user.id === review.userId) {
                    if (review.ReviewImages.length >= 10) {
                        res.status(403).json({
                            message: "Maximum number of images for this resource was reached"
                        })
                    }
                    const newImage = Image.build({
                        imageableId: req.params.id,
                        imageableType: "review",
                        url: url
                    })
                    await newImage.save()
                    res.status(201).json({
                        status: "success",
                        message: "Successfully added new image",
                        data: newImage
                    });
                } else {
                    return res.status(401).json({
                        message: "Authentication required"
                    })
                } 
            } else
                return res.status(404).json({
                message: "Review couldn't be found"
            });
        } else {
            return res.status(401).json({
                message: "Authentication required"
            })
        } 
    }
);


// Edit a Review
router.put(
    '/:id',
    requireAuth,
    validateReview,
    async (req, res) => {
        const { user } = req;
        if (user) {
            const { review, stars } = req.body
            let savereview = await Review.findByPk(req.params.id);
            if (savereview) {
                if (user.id === savereview.userId) {
                    savereview.set({
                        review: review,
                        stars: stars
                    })
                    validateReview,
                    await savereview.save()
                    return res.status(200).json({
                        status: "success",
                        message: 'Successfully updated review',
                        data: savereview
                    });
                } else {
                    return res.status(401).json({
                        message: "Authentication required"
                    })
                }                 
            } else {
                return res.status(404).json({
                    message: "Review couldn't be found"
                })
            };
        } else {
            return res.status(401).json({
                message: "Authentication required"
            })
        } 
    }
);


// Delete a Review
router.delete(
    '/:id',
    async (req, res) => {
        const { user } = req;
        if (user) {
            let review = await Review.findOne({ where: { id: req.params.id } })
            if (review) {
                if (user.id === review.userId) {
                    await review.destroy()
                    res.status(201).json({     
                        status: "success",
                        message: `Successfully deleted`,
                });
                } else {
                    return res.status(401).json({
                        message: "Authentication required"
                    })
                }                 
            } else return res.status(404).json({
                message: "Review couldn't be found"
        });
        } else {
            return res.status(401).json({
                message: "Authentication required"
            })
        }         
    }
);

module.exports = router;