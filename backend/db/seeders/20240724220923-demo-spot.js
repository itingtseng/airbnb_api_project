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
        ownerId: 1,
        address: 'addressone',
        city: 'cityone',
        state: 'stateone',
        country: 'countryone',
        lat: -73.94697,
        lng: 40.74588,
        name: 'nameone',
        description: 'descriptionone',
        price: 100
      },
      {
        ownerId: 2,
        address: 'addresstwo',
        city: 'citytwo',
        state: 'statetwo',
        country: 'countrytwo',
        lat: -74.94697,
        lng: 39.74588,
        name: 'nametwo',
        description: 'descriptiontwo',
        price: 100
      },
      {
        ownerId: 3,
        address: 'addressthree',
        city: 'citythree',
        state: 'statethree',
        country: 'countrythree',
        lat: -75.94697,
        lng: 38.74588,
        name: 'namethree',
        description: 'descriptionthree',
        price: 100
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['nameone', 'nametwo', 'namethree'] }
    }, {});
  }
};
