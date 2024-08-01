'use strict';

const { Image } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require("bcryptjs");

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
