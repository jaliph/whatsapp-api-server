module.exports = function (sequelize, DataTypes) {
  const Message = sequelize.define('Message', {
    message_id: {
      type: DataTypes.INTEGER(11).ZEROFILL,
      primaryKey: true,
      autoIncrement: true
    },
    message_sender: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    message_from: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    message_to: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    message_body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'message_master',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Message
}
