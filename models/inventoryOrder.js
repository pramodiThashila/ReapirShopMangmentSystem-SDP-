const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryOrder = sequelize.define('InventoryOrder', {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inventoryItem_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
    },
    needBeforeDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'rejected','received'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'inventory_order',
    timestamps: false, // Disable createdAt and updatedAt
  });

  
  InventoryOrder.associate = (models) => {
    // Define associations with other models
    InventoryOrder.belongsTo(models.Inventory, {
      foreignKey: 'inventoryItem_id'
    });
    
    InventoryOrder.belongsTo(models.Supplier, {
      foreignKey: 'supplier_id'
    });
    
    InventoryOrder.belongsTo(models.SupplierQuotation, {
      foreignKey: 'quotation_id'
    });
  };

  return InventoryOrder;
};