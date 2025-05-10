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

    stage('Build & Test') {
      steps {
        script {
          // gradle:8.5-jdk17 이미지 안에서 빌드
          docker.image('gradle:8.5-jdk17').inside('-u root:root') {
            sh 'gradle clean build'
          }
        }
      }
      post {
        success {
          archiveArtifacts artifacts: 'build/libs/*.jar', fingerprint: true
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['ec2-ssh']) {
          sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${APP_DIR}'"
          sh "scp -o StrictHostKeyChecking=no build/libs/*.jar ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/app.jar"
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
