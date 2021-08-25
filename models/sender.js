module.exports = function (sequelize, DataTypes) {
  const Sender = sequelize.define('Sender', {
    sender_id: {
      type: DataTypes.INTEGER(11).ZEROFILL,
      primaryKey: true,
      autoIncrement: true
    },
    sender_number: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true
    },
    sender_session: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sender_state: {
      type: DataTypes.STRING(1),
      allowNull: true
    }
  }, {
    tableName: 'sender_master',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Sender
}
