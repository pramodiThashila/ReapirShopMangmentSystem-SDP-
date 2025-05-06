module.exports = (sequelize, DataTypes) => {
  const SupplierQuotation = sequelize.define('SupplierQuotation', {
    quotation_id: {
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
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quatationR_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    qutation_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'supplier_quotation', // Explicitly set the table name
    timestamps: false, // Disable createdAt and updatedAt
  });

  SupplierQuotation.associate = (models) => {
    SupplierQuotation.belongsTo(models.Inventory, { foreignKey: 'inventoryItem_id' });
    SupplierQuotation.belongsTo(models.Supplier, { foreignKey: 'supplier_id' });
  };

  return SupplierQuotation;
};

