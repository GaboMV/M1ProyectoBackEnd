const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
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
          allowNull: false,
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