pipeline {
  agent any

  environment {
    DEPLOY_HOST = 'k12c205.p.ssafy.io'
    DEPLOY_USER = 'ubuntu'
    APP_DIR     = '/home/ubuntu/app'
  }

  stages {
    // 1. 소스 체크아웃
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    // 2. BE 폴더로 이동해 Gradle Wrapper로 빌드 (테스트 제외)
    stage('Build & Package') {
      steps {
        script {
          // Docker 소켓 권한 설정이 되어 있어야 합니다.
          docker.image('gradle:8.5-jdk17').inside('-u root:root') {
            dir('BE') {
              sh './gradlew clean build -x test'
            }
          }
        }
      }
      post {
        success {
          archiveArtifacts artifacts: 'BE/build/libs/*.jar', fingerprint: true
        }
      }
    }

    // 3. EC2에 SSH로 JAR 배포
    stage('Deploy') {
      steps {
        sshagent(credentials: ['ec2-ssh']) {
          // 배포 디렉터리 생성
          sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${APP_DIR}'"
          // JAR 복사
          sh "scp -o StrictHostKeyChecking=no BE/build/libs/*.jar ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/app.jar"
          // 기존 프로세스 종료 후 백그라운드 실행
          sh """
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
              pkill -f app.jar || true
              nohup java -jar ${APP_DIR}/app.jar > ${APP_DIR}/app.log 2>&1 &
            '
          """
        }
      }
    }
  }
}
