'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 3,
        spotId: 1,
        review: 'The loft was amazing! It was clean, stylish, and located near great restaurants. Will definitely stay here again.',
        stars: 5
      },
      {
        userId: 1,
        spotId: 2,
        review: 'The apartment had incredible views of the Bay, and the host was very responsive. Highly recommend!',
        stars: 5
      },
      {
        userId: 2,
        spotId: 2,
        review: 'The location was great, but the apartment wasn’t as clean as expected. Could use some improvements.',
        stars: 3
      },
      {
        userId: 2,
        spotId: 3,
        review: 'Loved the cabin! It was so peaceful and perfect for a weekend escape. Highly recommend for nature lovers.',
        stars: 5
      },
      {
        userId: 3,
        spotId: 3,
        review: 'The location was beautiful, but the cabin had a strange odor and wasn’t well-maintained. Disappointed.',
        stars: 2
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
