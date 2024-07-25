const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


// Get all Spots
router.get('/', async (req, res, next) => {

    const where = {};

    const spots = await Spot.findAll({
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
        ]
    });

    res.json(spots);
});

// Get all Spots owned by the Current User
router.get('/current', async (req, res) => {
        const { user } = req;
        console.log(user)
      if (user) {
        const spot = await Spot.findAll({
            where: {
                ownerId: user.id,
            }
        });
        return res.json({
          spot
        });
      } else return res.json({ spot: null });
    }
);

// Get details of a Spot from an id
router.get('/:id', async (req, res, next) => {
    let spot = await Spot.findByPk(req.params.id, {
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
            'updatedAt'],

    });

    if (!spot) {
        res.status(404);
        res.send({ message: 'Spot Not Found' });
    }

    res.json(spot);
});
  


module.exports = router;