'use strict';

const { Image } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Image.bulkCreate([
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '/images/1-1.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '/images/1-2.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '/images/1-3.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '/images/1-4.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '/images/1-5.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/2-1.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/2-2.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/2-3.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/2-4.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/2-5.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/3-1.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/3-2.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/3-3.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/3-4.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/3-5.jpg',
        preview: false
      },
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Images';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      imageableId: { [Op.in]: [1] }
    }, {});
  }
};
