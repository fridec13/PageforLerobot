pipeline {
  agent any

  environment {
    DEPLOY_HOST = 'k12c205.p.ssafy.io'
    DEPLOY_USER = 'ubuntu'
    APP_DIR     = '/home/ubuntu/app'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Package') {
      steps {
        script {
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

    stage('Deploy') {
      steps {
        // credentialsId 에는 Jenkins에 등록된 'SSH Username with private key' 자격증명 ID를 넣으세요.
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ec2-ssh',      // 본인의 자격증명 ID
          keyFileVariable: 'SSH_KEY',    // 내부에서 참조할 환경변수 이름
          usernameVariable: 'SSH_USER'   // 내부에서 참조할 사용자 이름 변수
        )]) {
          // 1) 원격 디렉토리 생성
          sh """
            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@\$DEPLOY_HOST 'mkdir -p \$APP_DIR'
          """
          // 2) 빌드한 JAR 복사
          sh """
            scp -i \$SSH_KEY -o StrictHostKeyChecking=no BE/build/libs/*.jar \$SSH_USER@\$DEPLOY_HOST:\$APP_DIR/app.jar
          """
          // 3) 기존 프로세스 종료 후 신규 JAR 실행
          sh """
            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@\$DEPLOY_HOST '
              pkill -f app.jar || true
              nohup java -jar \$APP_DIR/app.jar > \$APP_DIR/app.log 2>&1 &
            '
          """
        }
      }
    }
  }
}
