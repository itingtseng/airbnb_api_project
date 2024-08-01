const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Spot, User, Image, Review, Booking } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


// Get all of the Current User's Bookings
router.get('/current', async (req, res) => {
    const { user } = req;
    // console.log(user)
    if (user) {
        const booking = await Booking.findAll({
            where: {
                userId: user.id,
            },
            attributes: [
                'id',
                'userId',
                'spotId',
                'startDate',
                'endDate',
                'createdAt',
                'updatedAt',
            ],
            include: [
                {
                    model: Spot,
                    as: 'Spot',
                    attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
                }]
        });
        return res.status(200).json({
            booking
        });
    } else {
        return res.status(401).json({
            message: "Authentication required"
        })
    }
});


// Edit a Booking
router.put(
    '/:id',
    async (req, res) => {
        const { user } = req;
        if (user) {
            let savebooking = await Booking.findByPk(req.params.id);
            if (savebooking) {
                if (user.id === savebooking.userId) {
                    const { startDate, endDate } = req.body
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const end = new Date(endDate)
                    if (end < today) {
                        res.status(403).json({
                            message: "Past bookings can't be modified"
                        })
                    }
                    savebooking.set({
                        startDate: startDate,
                        endDate: endDate
                    })
                    await savebooking.save()
                    return res.status(200).json({
                        status: "success",
                        message: 'Successfully updated booking',
                        data: savebooking
                    });
                } else {
                    return res.status(401).json({
                        message: "Authentication required"
                    })
                }
            } else {
                return res.status(404).json({
                    message: "Booking couldn't be found"
                });
            }
        } else {
            return res.status(401).json({
                message: "Authentication required"
            })
        }
    }
);


// Delete a Booking
router.delete(
    '/:id',
    async (req, res) => {
        const { user } = req;
        if (user) {
            let booking = await Booking.findOne({ where: { id: req.params.id } })
            if (booking) {
                if (user.id === booking.userId) {
                    const startDate = booking.startDate
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const start = new Date(startDate)
                    if (start < today) {
                        res.status(403).json({
                            message: "Bookings that have been started can't be deleted"
                        })
                    }
                    await booking.destroy()
                    res.json({
                        status: "success",
                        message: `Successfully deleted`,
                    });
                } else {
                    return res.status(401).json({
                        message: "Authentication required"
                    })
                }                
            } else {
                return res.status(404).json({
                    message: "Booking couldn't be found"
                });
            }
        } else {
            return res.status(401).json({
                message: "Authentication required"
            })
        }
    }
);

module.exports = router;