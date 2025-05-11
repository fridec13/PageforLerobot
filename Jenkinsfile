pipeline {
  agent any
  environment {
    EC2_HOST     = 'ec2-xx-xx-xx-xx.compute-1.amazonaws.com'
    SSH_CREDENTIALS = 'ec2-ssh'
    DB_HOST      = 'localhost'      // 또는 RDS endpoint
    DB_USER      = 'appuser'
    DB_PASS      = '비밀번호'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh 'mvn clean package -DskipTests'
      }
    }
    stage('Deploy to EC2') {
      steps {
        sshagent (credentials: [SSH_CREDENTIALS]) {
          // 1) EC2로 JAR 파일 복사
          sh """
            scp target/*.jar ${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/app.jar
          """
          // 2) EC2에서 실행 (이전 프로세스 종료 후 재실행)
          sh """
            ssh ${EC2_USER}@${EC2_HOST} << 'EOF'
              pkill -f app.jar || true
              nohup java -jar /home/${EC2_USER}/app.jar \
                --spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/portfolio?serverTimezone=Asia/Seoul \
                --spring.datasource.username=${DB_USER} \
                --spring.datasource.password=${DB_PASS} \
                > /home/${EC2_USER}/app.log 2>&1 &
            EOF
          """
        }
      }
    }
  }
  post {
    success { echo '✅ 배포 성공!' }
    failure { echo '❌ 배포 실패, 로그 확인해주세요.' }
  }
}
