'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.hasMany(
        models.Image,
        {
          foreignKey: 'imageableId',
          as: 'ReviewImages',
          onDelete: 'CASCADE'
        },
      )
      Review.belongsTo(
        models.User,
        {
          foreignKey: 'userId',
          as: 'User'
        },
      )
      Review.belongsTo(
        models.Spot,
        {
          foreignKey: 'spotId',
          as: 'Spot'
        },
      )
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      }
    },
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};