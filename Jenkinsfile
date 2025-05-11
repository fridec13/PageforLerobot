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
              // 테스트 제외하고 빌드
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
        withCredentials([sshUserPrivateKey(
          credentialsId: 'ec2-ssh',
          keyFileVariable: 'SSH_KEY',
          usernameVariable: 'SSH_USER'
        )]) {
          // 1) 원격 디렉터리 생성 (이제 APP_DIR이 Groovy에서 확장됩니다)
          sh """
            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${DEPLOY_HOST} 'mkdir -p ${env.APP_DIR}'
          """

          // 2) JAR 복사
          sh """
            scp -i ${SSH_KEY} -o StrictHostKeyChecking=no BE/build/libs/*.jar ${SSH_USER}@${DEPLOY_HOST}:${env.APP_DIR}/app.jar
          """

          // 3) 기존 프로세스 종료 & 새로 기동
          sh """
            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${DEPLOY_HOST} '
              pkill -f app.jar || true
              nohup java -jar ${env.APP_DIR}/app.jar > ${env.APP_DIR}/app.log 2>&1 &
            '
          """
        }
      }
    }
  }
}
