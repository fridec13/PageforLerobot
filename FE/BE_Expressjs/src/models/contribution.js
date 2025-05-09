module.exports = (sequelize, DataTypes) => {
  const Contribution = sequelize.define('Contribution', {
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
    type: {
      type: DataTypes.ENUM('DOCUMENT', 'WIKI', 'FORUM'),
      allowNull: false,
    },
    contentId: {
      type: DataTypes.UUID, // 관련 콘텐츠의 ID
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 기여 포인트
    },
  }, {
    tableName: 'contributions',
    timestamps: true,
  });

  // 관계 정의
  Contribution.associate = function(models) {
    // 기여 내역은 한 사용자에 속한다
    Contribution.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Contribution;
}; 