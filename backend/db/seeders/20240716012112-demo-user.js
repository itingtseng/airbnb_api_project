'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: 'Marnie',
        lastName: 'Smith',
        email: 'marnie@aa.io',
        username: 'marnie',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Bobbie',
        lastName: 'Brown',
        email: 'bobbie@aa.ioo',
        username: 'bobbie',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@aa.io',
        username: 'alice',
        hashedPassword: bcrypt.hashSync('password')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['marnie', 'bobbie', 'alice'] }
    }, {});
  }
};
