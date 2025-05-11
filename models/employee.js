module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define(
      'Employee',
      {
        employee_id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(50),
          // unique: true,
          allowNull: false,
        },
        nic: {
          type: DataTypes.STRING(12),
          // unique: true,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('owner', 'employee'),
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(50),
          // unique: true,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        dob: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 1, // Default value is 1 (true)
        }
      },
      {
        tableName :"employees",
        timestamps: false, // Disable createdAt and updatedAt
      }
    );
  
    Employee.associate = (models) => {
      Employee.hasMany(models.EmployeePhone, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
      Employee.hasMany(models.Job, { foreignKey: 'employee_id', onDelete: 'RESTRICT' });
    };
  
    return Employee;
  };