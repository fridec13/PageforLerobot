module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    criteria: {
      type: DataTypes.JSON, // 획득 조건 (예: { contribution: 50 })
    },
  }, {
    tableName: 'badges',
    timestamps: true,
  });

  // 관계 정의
  Badge.associate = function(models) {
    // 뱃지는 여러 사용자에게 부여될 수 있다
    Badge.hasMany(models.UserBadge, {
      foreignKey: 'badgeId',
      as: 'userBadges',
    });
  };

  return Badge;
}; 