module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('AdvanceInvoice', {
        AdvanceInvoice_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      Advance_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'AdvanceInvoice', // Explicitly set the table name
      timestamps: false, // Disable createdAt and updatedAt
    });
  
    Invoice.associate = (models) => {
      Invoice.belongsTo(models.Job, { foreignKey: 'job_id', onDelete: 'RESTRICT' });
        Invoice.belongsTo(models.Customer, { foreignKey: 'customer_id', onDelete: 'RESTRICT' });
        Invoice.belongsTo(models.Employee, { foreignKey: 'employee_id', onDelete: 'RESTRICT' });
    };
  
    return Invoice;
  };