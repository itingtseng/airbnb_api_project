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
        url: '/images/dogs.jpg',
        preview: false
      },
      {
        imageableId: 2,
        imageableType: 'spot',
        url: '/images/cats.jpg',
        preview: false
      },
      {
        imageableId: 3,
        imageableType: 'spot',
        url: '/images/bulbasaur.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'spot',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      },
      {
        imageableId: 1,
        imageableType: 'review',
        url: '../../assets/images/dog.jpg',
        preview: false
      }
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
