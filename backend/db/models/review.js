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
        { foreignKey: 'imageableId', onDelete: 'CASCADE', hooks: true },
      )
      Review.belongsTo(
        models.User,
          { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true },
      )
      Review.belongsTo(
        models.Spot,
          { foreignKey: 'spotId', onDelete: 'CASCADE', hooks: true },
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
    reviewImages: {
      type: DataTypes.INTEGER,

    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};