pipeline {
  agent any

  environment {
    // EC2 호스트와 사용자 정의
    DEPLOY_HOST = 'k12c205.p.ssafy.io'
    DEPLOY_USER = 'ubuntu'
    APP_DIR     = '/home/ubuntu/app'
  }

  stages {
    stage('Checkout') {
      steps {
        // GitLab에서 develop 브랜치 가져오기
        git url: 'https://lab.ssafy.com/s12-final/S12P31C205.git',
            credentialsId: 'lab-credentials',
            branch: 'develop'
      }
    }

    stage('Build & Test') {
      steps {
        // gradle
        sh './gradlew build'
      }
      post {
        success {
          // JAR 파일을 아티팩트로 보관
          archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        }
      }
    }

    stage('Deploy') {
      steps {
        // SSH 키를 사용해 EC2에 배포
        sshagent(credentials: ['ec2-ssh']) {
          // 배포 디렉터리 준비 (없으면 생성)
          sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${APP_DIR}'"
          // 빌드된 JAR 전송
          sh "scp -o StrictHostKeyChecking=no target/*.jar ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_DIR}/app.jar"
          // 기존 프로세스 종료 & 새로 기동
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
