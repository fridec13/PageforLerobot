// Prisma 클라이언트 초기화
const { PrismaClient } = require('@prisma/client');

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

module.exports = prisma; 