
module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define("Pedido", {
    fecha: DataTypes.DATE,
    total: DataTypes.FLOAT
  });
  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Cliente, { foreignKey: "clienteId" });
  };
  return Pedido;
};