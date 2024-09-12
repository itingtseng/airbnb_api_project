'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(models.Spot, {
        foreignKey: 'imageableId',
        as: 'SpotImages',
        constraints: false
      });
      Image.belongsTo(models.Review, {
        foreignKey: 'imageableId',
        as: 'ReviewImages',
        constraints: false
      });
    }
  }
  Image.init({
    imageableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageableType: {
      type: DataTypes.ENUM('spot', 'review'),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preview: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};