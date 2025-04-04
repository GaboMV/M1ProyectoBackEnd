
module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define("Cliente", {
    nombre: DataTypes.STRING,
    correo: DataTypes.STRING
  });
  Cliente.associate = (models) => {
    Cliente.hasMany(models.Pedido, { foreignKey: "clienteId" });
  };
  return Cliente;
};
