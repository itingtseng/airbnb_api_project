'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 3,
        address: '123 Maple Street',
        city: 'Brooklyn',
        state: 'New York',
        country: 'United States',
        lat: 40.7128,
        lng: -73.9560,
        name: 'Cozy Brooklyn Loft',
        description: 'A stylish and cozy loft located in the heart of Brooklyn. Perfect for travelers who love city vibes.',
        price: 150
      },
      {
        ownerId: 2,
        address: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Modern Bay Area Apartment',
        description: 'A modern apartment with stunning views of the San Francisco Bay. Ideal for business trips or family getaways.',
        price: 200
      },
      {
        ownerId: 1,
        address: '789 Pine Lane',
        city: 'Denver',
        state: 'Colorado',
        country: 'United States',
        lat: 39.7392,
        lng: -104.9903,
        name: 'Mountain Retreat Cabin',
        description: 'A serene cabin near the Rockies. Great for nature lovers and those seeking peace and quiet.',
        price: 175
      }      
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Cozy Brooklyn Loft', 'Modern Bay Area Apartment', 'Mountain Retreat Cabin'] }
    }, {});
  }
};
