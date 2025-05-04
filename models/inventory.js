module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    inventoryItem_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    item_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    outOfStockLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    specification: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'Inventory', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  Inventory.associate = (models) => {
    Inventory.hasMany(models.InventoryBatch, { foreignKey: 'inventoryItem_id' });
    
    Inventory.hasMany(models.InventoryPurchase, { foreignKey: 'inventoryItem_id' });
  };

  return Inventory;
};