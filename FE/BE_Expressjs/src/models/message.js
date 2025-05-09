module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    receiverId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'messages',
    timestamps: true,
  });

  // 관계 정의
  Message.associate = function(models) {
    // 메시지에는 발신자가 있다
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
    });
    
    // 메시지에는 수신자가 있다
    Message.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
    });
  };

  return Message;
}; 