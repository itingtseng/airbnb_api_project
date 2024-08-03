const express = require('express');
const { Op } = require("sequelize");
const { Spot, Booking } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth.js');
const router = express.Router();
const moment = require('moment');

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

async function checkBookingConflict(startDate, endDate, bookingId) {
    const utcStartDate = moment(startDate).utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const utcEndDate = moment(endDate).utc().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    
    console.log('Checking conflict for booking ID:', bookingId);
    console.log('UTC Start Date:', utcStartDate);
    console.log('UTC End Date:', utcEndDate);
    
    const conflictingBookings = await Booking.findAll({
        where: {
            id: {
                [Op.ne]: bookingId
            },
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
    });

    conflictingBookings.forEach(booking => {
        console.log(`Conflicting Booking ID: ${booking.id}`);
        console.log(`Conflicting Booking Start Date: ${moment(booking.startDate).format('dddd MMMM D YYYY HH:mm:ss')}`);
        console.log(`Conflicting Booking End Date: ${moment(booking.endDate).format('dddd MMMM D YYYY HH:mm:ss')}`);
    });

    return conflictingBookings.length > 0;
}


// Get all of the Current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    // console.log(user)
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
});


// Edit a Booking
router.put('/:id', requireAuth, validateBookingDates, async (req, res) => {
    const { user } = req
    const bookingId = parseInt(req.params.id, 10); // Ensure imageId is an integer

    if (isNaN(bookingId)) {
        return res.status(400).json({
            message: "Invalid booking ID"
        });
    }
    let savebooking = await Booking.findByPk(bookingId)
    if (savebooking) {
        if (user.id === savebooking.userId) {
            const { startDate, endDate } = req.body
            const utcStartDate = moment(startDate).utc().format('YYYY-MM-DD');
            const utcEndDate = moment(endDate).utc().format('YYYY-MM-DD');
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Bad Request",
                    errors: errors.mapped()
                })
            }
            const conflict = await checkBookingConflict(utcStartDate, utcEndDate, bookingId);
            // console.log('this is booking id:' + bookingId)
            if (conflict) {
                return res.status(403).json({
                    message: "Sorry, this spot is already booked for the specified dates",
                    errors: {
                        startDate: "Start date conflicts with an existing booking",
                        endDate: "End date conflicts with an existing booking"
                    }
                })
            }
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const end = new Date(endDate)
            if (end < today) {
                res.status(403).json({
                    message: "Past bookings can't be modified"
                })
            }
            savebooking.set({
                startDate: utcStartDate,
                endDate: utcEndDate
            })
            await savebooking.save()
            return res.status(200).json({
                status: "success",
                message: 'Successfully updated booking',
                data: savebooking
            });
        } else {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
    } else {
        return res.status(404).json({
            message: "Booking couldn't be found"
        })
    } 
});


// Delete a Booking
router.delete('/:id',requireAuth, async (req, res) => {
    const { user } = req;
    const bookingId = parseInt(req.params.id, 10); // Ensure imageId is an integer

    if (isNaN(bookingId)) {
        return res.status(400).json({
            message: "Invalid booking ID"
        });
    }
    let booking = await Booking.findOne({ where: { id: bookingId } })
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
            return res.status(403).json({
                message: "Forbidden"
            })
        }                
    } else {
        return res.status(404).json({
            message: "Booking couldn't be found"
        });
    }
});

module.exports = router;