module.exports = (sequelize, DataTypes) => {
  const UserBadge = sequelize.define('UserBadge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    badgeId: {
      type: DataTypes.UUID,
      references: {
        model: 'badges',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    awardedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'user_badges',
    timestamps: true,
  });

  // 관계 정의
  UserBadge.associate = function(models) {
    // 사용자 뱃지는 한 사용자에 속한다
    UserBadge.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    // 사용자 뱃지는 한 뱃지에 속한다
    UserBadge.belongsTo(models.Badge, {
      foreignKey: 'badgeId',
      as: 'badge',
    });
  };

  return UserBadge;
}; 