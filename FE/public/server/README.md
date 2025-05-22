# LeRobot 로컬 제어 서버

이 로컬 서버는 브라우저와 로봇 하드웨어 간의 통신을 위해 설계된 웹소켓 기반 서버입니다. 우분투 22.04 환경에서 LeRobot을 제어하기 위한 인터페이스를 제공합니다.

## 기능

- 시리얼 포트 스캔 및 변경 감지
- 로봇 연결 테스트 및 제어
- 카메라 연결 감지 및 스트리밍
- 로봇 설정 관리
- 학습 실행 및 모니터링

## 요구사항

- Python 3.8 이상
- Ubuntu 22.04 권장 (다른 Linux 배포판, Windows, macOS에서도 작동 가능)
- 시리얼 포트 액세스 권한 (대부분의 경우 `dialout` 그룹 멤버십 필요)
- 웹캠 액세스 권한

## 설치 방법

### 1. Miniconda 설치

```bash
# 필요한 패키지 설치
sudo apt update
sudo apt install -y wget

# Miniconda 다운로드
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh

# 설치 스크립트 실행
bash ~/miniconda.sh -b -p $HOME/miniconda

# 환경 변수 설정
echo 'export PATH="$HOME/miniconda/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Conda 초기화
conda init bash
```

### 2. LeRobot 환경 설정

```bash
# 가상 환경 생성
conda create -n lerobot python=3.8 -y
conda activate lerobot

# 필요한 패키지 설치
cd server
pip install -r requirements.txt
```

### 3. 시리얼 포트 권한 설정

```bash
# 현재 사용자를 dialout 그룹에 추가 (시리얼 포트 액세스 권한)
sudo usermod -a -G dialout $USER

# 권한 즉시 적용
newgrp dialout
```

## 서버 실행 방법

1. 가상 환경 활성화
```bash
conda activate lerobot
```

2. 서버 디렉토리로 이동
```bash
cd server
```

3. 서버 실행
```bash
python main.py
```

기본적으로 서버는 `http://localhost:8000`에서 실행됩니다.

## 웹소켓 통신 방법

웹소켓 엔드포인트는 `ws://localhost:8000/ws`로 접근할 수 있습니다. 브라우저에서 다음과 같이 연결할 수 있습니다:

```javascript
const socket = new WebSocket('ws://localhost:8000/ws');

socket.onopen = () => {
  console.log('웹소켓 연결됨');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('서버에서 메시지 수신:', data);
};

// 서버로 메시지 전송
function sendMessage(type, data) {
  socket.send(JSON.stringify({
    type: type,
    ...data
  }));
}

// 예시: 포트 스캔 요청
sendMessage('scan_ports', {});

// 예시: 로봇 연결 테스트
sendMessage('test_robot_connection', { port: '/dev/ttyACM0' });

// 예시: 카메라 연결 테스트
sendMessage('test_camera_connection', { index: 0 });
```

## API 참조

### 1. 포트 스캔
```json
// 요청
{ "type": "scan_ports" }

// 응답
{
  "type": "ports_list",
  "ports": [
    {
      "port": "/dev/ttyACM0",
      "description": "Arduino Uno",
      "hardware_id": "USB VID:PID=2341:0043 SER=95124",
      "manufacturer": "Arduino"
    },
    ...
  ]
}
```

### 2. 로봇 연결 테스트
```json
// 요청
{
  "type": "test_robot_connection",
  "port": "/dev/ttyACM0"
}

// 응답
{
  "type": "robot_connection_result",
  "success": true,
  "message": "포트 /dev/ttyACM0에서 로봇 연결 성공",
  "robot_info": {
    "id": "robot_ttyACM0",
    "type": "so100",
    "port": "/dev/ttyACM0",
    "firmware_version": "1.0.0",
    "motors": [
      {"id": 1, "name": "shoulder_pan", "model": "sts3215", "temperature": 25, "position": 0},
      ...
    ]
  }
}
```

### 3. 카메라 테스트
```json
// 요청
{
  "type": "test_camera_connection",
  "index": 0
}

// 응답
{
  "type": "camera_connection_result",
  "success": true,
  "message": "카메라 0 연결 성공",
  "camera_info": {
    "index": 0,
    "port": "/dev/video0",
    "resolution": "640x480",
    "fps": 30
  }
}
```

### 4. 학습 시작
```json
// 요청
{
  "type": "start_training",
  "training_config": {
    "robotType": "so100",
    "modelRepo": "huggingface/so100-control",
    "episodes": 10,
    "duration": 300,
    "recordData": true,
    "useCamera": true
  }
}

// 응답
{
  "type": "training_started",
  "task_id": "d8f2e3f1-5a7b-4e3c-9d2f-6b8a7c9e5d4f",
  "message": "학습이 시작되었습니다."
}

// 학습 진행 상황 업데이트 (서버에서 자동 전송)
{
  "type": "training_update",
  "task_id": "d8f2e3f1-5a7b-4e3c-9d2f-6b8a7c9e5d4f",
  "status": "running",
  "progress": 50,
  "message": "에피소드 5/10 실행 중... (50%)",
  "is_final": false
}
```

## 문제 해결

### 시리얼 포트 액세스 문제

포트에 액세스할 수 없는 경우:

```bash
# 포트 확인
ls -l /dev/tty*

# 권한 추가
sudo usermod -a -G dialout $USER
sudo chmod 666 /dev/ttyACM0  # 임시 해결책
```

### 카메라 액세스 문제

카메라에 액세스할 수 없는 경우:

```bash
# 카메라 장치 확인
ls -l /dev/video*

# 권한 설정
sudo usermod -a -G video $USER
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 제공됩니다. 