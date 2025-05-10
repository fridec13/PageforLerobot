pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        git url: 'https://lab.ssafy.com/s12-final/S12P31C205.git',
            credentialsId: 'lab-credentials',
            branch: 'develop'
      }
    }
    stage('Build') {
      steps {
        sh 'echo Building…'
      }
    }
  }
}
