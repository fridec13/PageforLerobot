const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 데이터베이스 초기 데이터 시딩
 */
async function main() {
  console.log('데이터베이스 시딩을 시작합니다...');
  
  // 기본 레벨 데이터 시딩
  await seedLevels();
  
  console.log('데이터베이스 시딩이 완료되었습니다.');
}

/**
 * 레벨 데이터 시딩
 */
async function seedLevels() {
  // 기존 레벨이 있는지 확인
  const existingLevels = await prisma.level.findMany();
  
  if (existingLevels.length > 0) {
    console.log(`이미 ${existingLevels.length}개의 레벨이 존재합니다. 레벨 시딩을 건너뜁니다.`);
    return;
  }
  
  // 기본 레벨 데이터
  const defaultLevels = [
    {
      name: 'Regular',
      description: '활동을 시작한 회원',
      minPoints: 0,
      maxPoints: 29,
      color: '#808080', // 회색
      imageUrl: '/images/levels/regular.png'
    },
    {
      name: 'Advanced',
      description: '꾸준히 활동하는 회원',
      minPoints: 30,
      maxPoints: 59,
      color: '#3CB371', // 중간 해초색
      imageUrl: '/images/levels/advanced.png'
    },
    {
      name: 'Master',
      description: '지식을 나누는 능력자',
      minPoints: 60,
      maxPoints: 99,
      color: '#1E90FF', // 밝은 파란색
      imageUrl: '/images/levels/master.png'
    },
    {
      name: 'Expert',
      description: '탁월한 기여를 하는 전문가',
      minPoints: 100,
      maxPoints: 149,
      color: '#9370DB', // 중간 보라색
      imageUrl: '/images/levels/expert.png'
    },
    {
      name: 'Researcher',
      description: '새로운 지식을 창출하는 연구자',
      minPoints: 150,
      maxPoints: 199,
      color: '#FFD700', // 금색
      imageUrl: '/images/levels/researcher.png'
    },
    {
      name: 'Sapiens',
      description: '지혜를 나누는 최고 등급',
      minPoints: 200,
      color: '#FF4500', // 붉은 주황색
      imageUrl: '/images/levels/sapiens.png'
    }
  ];
  
  // 레벨 생성
  for (const level of defaultLevels) {
    await prisma.level.create({ data: level });
    console.log(`${level.name} 레벨이 생성되었습니다.`);
  }
  
  console.log('레벨 시딩이 완료되었습니다.');
}

// 시딩 실행
main()
  .catch((e) => {
    console.error('시딩 중 오류가 발생했습니다:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 