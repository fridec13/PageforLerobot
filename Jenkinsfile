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
          // gradle Docker 이미지를 이용해서 BE 폴더로 들어가 wrapper 실행
          docker.image('gradle:8.5-jdk17').inside('-u root:root') {
            dir('BE') {
              // wrapper 스크립트가 BE/gradlew 에 있으므로
              sh './gradlew clean build'
            }
          }
        }
      }
      post {
        success {
          // 빌드 결과물을 BE/build/libs 에서 보관
          archiveArtifacts artifacts: 'BE/build/libs/*.jar', fingerprint: true
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['ec2-ssh']) {
          sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${APP_DIR}'"
          sh "scp -o StrictHostKeyChecking=no BE/build/libs/*.jar ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/app.jar"
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
