const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define la relación con User
      Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Task.init(
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('pendiente', 'en progreso', 'completada'),
          defaultValue: 'pendiente',
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,  // El campo userId no puede ser nulo, ya que es obligatorio
        },
      },
      {
        sequelize,
        modelName: 'Task',
        tableName: 'tasks',
      }
  );

  return Task;
};