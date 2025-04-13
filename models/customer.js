const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    customer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
      // unique: true,
    },
    type: {
      type: DataTypes.ENUM('Regular', 'Normal'),
      allowNull: true,
    },
 },
  {
    tableName: 'customers', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  }
);

  return Customer;
};