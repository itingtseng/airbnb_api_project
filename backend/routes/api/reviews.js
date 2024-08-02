const express = require('express');
const { Spot, User, Image, Review } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth.js');
const router = express.Router();


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
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    // console.log(user)
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
})
  

// Add an Image to a Review based on the Review's id
router.post('/:id/images', requireAuth, async (req, res) => {
    const { user } = req
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
            return res.status(403).json({
                message: "Forbidden"
            })
        } 
    } else
        return res.status(404).json({
        message: "Review couldn't be found"
    });
});


// Edit a Review
router.put('/:id', requireAuth, validateReview, async (req, res) => {
    const { user } = req
    const { review, stars } = req.body
    let savereview = await Review.findByPk(req.params.id);
    if (savereview) {
        if (user.id === savereview.userId) {
            savereview.set({
                review: review,
                stars: stars
            })
            await savereview.save()
            return res.status(200).json({
                status: "success",
                message: 'Successfully updated review',
                data: savereview
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        }                 
    } else {
        return res.status(404).json({
            message: "Review couldn't be found"
        })
    };
});


// Delete a Review
router.delete('/:id', requireAuth, async (req, res) => {
    const { user } = req
    let review = await Review.findByPk(req.params.id)
    console.log('this is user.id:' + user.id)
    console.log('this is review:' + review)
    if (review) {
        if (user.id === review.userId) {
            await review.destroy()
            res.status(201).json({
                status: "success",
                message: `Successfully deleted`,
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
    } else return res.status(404).json({
        message: "Review couldn't be found"
    });         
});

module.exports = router;