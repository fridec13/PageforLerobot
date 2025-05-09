const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'moderator', 'user'),
      defaultValue: 'user',
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: '새싹',
    },
    image: {
      type: DataTypes.STRING,
    },
    contribution: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    // hooks를 사용해 비밀번호 해싱
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  // 인스턴스 메소드 - 비밀번호 검증
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // 관계 정의
  User.associate = function(models) {
    // 사용자는 여러 기여 내역을 가질 수 있다
    User.hasMany(models.Contribution, {
      foreignKey: 'userId',
      as: 'contributions',
    });
    
    // 사용자는 여러 뱃지를 가질 수 있다
    User.hasMany(models.UserBadge, {
      foreignKey: 'userId',
      as: 'badges',
    });
    
    // 사용자는 여러 메시지를 받을 수 있다
    User.hasMany(models.Message, {
      foreignKey: 'receiverId',
      as: 'receivedMessages',
    });
    
    // 사용자는 여러 메시지를 보낼 수 있다
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages',
    });
  };

  return User;
}; 