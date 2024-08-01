'use strict';

const { Review } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: 'demo review',
        stars: 5
      },
      {
        userId: 1,
        spotId: 2,
        review: 'demo review',
        stars: 1
      },
      {
        userId: 1,
        spotId: 3,
        review: 'demo review',
        stars: 3
      },
      {
        userId: 2,
        spotId: 1,
        review: 'demo review',
        stars: 5
      },
      {
        userId: 2,
        spotId: 2,
        review: 'demo review',
        stars: 1
      },
      {
        userId: 2,
        spotId: 3,
        review: 'demo review',
        stars: 3
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5, 6] }
    }, {});
  }
};
