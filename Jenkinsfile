pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build') {
      steps {
        // Linux/macOS 에이전트
        sh './gradlew clean build -x test'
        // Windows 에이전트일 경우:
        // bat 'gradlew.bat clean build -x test'
      }
    }
    stage('Deploy to EC2') {
      steps {
        sshagent (credentials: [SSH_CREDENTIALS]) {
          sh """
            scp build/libs/*.jar ${EC2_USER}@${EC2_HOST}:/home/${EC2_USER}/app.jar
            ssh ${EC2_USER}@${EC2_HOST} << 'EOF'
              pkill -f app.jar || true
              nohup java -jar /home/${EC2_USER}/app.jar \
                --spring.datasource.url=jdbc://${DB_HOST}:3306/portfolio?serverTimezone=Asia/Seoul \
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
    failure { echo '❌ 배포 실패 — 로그 확인하세요.' }
  }
}
