import os
import sys
import json
import asyncio
import logging
from typing import List, Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# 로봇 제어 및 포트 스캔 모듈
from robot_control import RobotController
from port_scanner import PortScanner
from camera_manager import CameraManager

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("server.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("lerobot-server")

# FastAPI 앱 생성
app = FastAPI(title="LeRobot Control Server")

# CORS 설정 - 웹 앱에서 접근 가능하도록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시 특정 origin으로 제한하는 것이 좋습니다
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 클라이언트 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"클라이언트 연결됨. 현재 연결 수: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"클라이언트 연결 해제. 현재 연결 수: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_to(self, websocket: WebSocket, message: str):
        await websocket.send_text(message)

manager = ConnectionManager()

# 컨트롤러 인스턴스 생성
robot_controller = RobotController()
port_scanner = PortScanner()
camera_manager = CameraManager()

@app.get("/")
async def get_status():
    """서버 상태 확인 API"""
    return {"status": "running", "version": "1.0.0"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """웹소켓 연결 처리"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await process_message(websocket, message)
            except json.JSONDecodeError:
                await manager.send_to(websocket, json.dumps({
                    "type": "error",
                    "message": "잘못된 JSON 형식입니다."
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"웹소켓 처리 중 오류 발생: {str(e)}")
        manager.disconnect(websocket)

async def process_message(websocket: WebSocket, message: Dict[str, Any]):
    """클라이언트 요청 처리"""
    msg_type = message.get("type", "")
    
    try:
        # 포트 스캔 요청
        if msg_type == "scan_ports":
            ports = port_scanner.scan_ports()
            await manager.send_to(websocket, json.dumps({
                "type": "ports_list",
                "ports": ports
            }))
        
        # 포트 변화 감지 요청
        elif msg_type == "detect_port_change":
            port_change = await port_scanner.detect_port_change()
            await manager.send_to(websocket, json.dumps({
                "type": "port_change",
                "change_detected": port_change["detected"],
                "new_port": port_change.get("new_port", "")
            }))
        
        # 로봇 연결 테스트
        elif msg_type == "test_robot_connection":
            port = message.get("port", "")
            result = robot_controller.test_connection(port)
            await manager.send_to(websocket, json.dumps({
                "type": "robot_connection_result",
                "success": result["success"],
                "message": result["message"],
                "robot_info": result.get("robot_info", {})
            }))
        
        # 카메라 연결 테스트
        elif msg_type == "test_camera_connection":
            camera_index = message.get("index", 0)
            result = camera_manager.test_connection(camera_index)
            await manager.send_to(websocket, json.dumps({
                "type": "camera_connection_result",
                "success": result["success"],
                "message": result["message"],
                "camera_info": result.get("camera_info", {})
            }))
        
        # 로봇 설정 업데이트
        elif msg_type == "update_robot_config":
            config = message.get("config", {})
            result = robot_controller.update_config(config)
            await manager.send_to(websocket, json.dumps({
                "type": "config_update_result",
                "success": result["success"],
                "message": result["message"]
            }))
        
        # 학습 명령 실행
        elif msg_type == "start_training":
            training_config = message.get("training_config", {})
            task_id = robot_controller.start_training(training_config)
            await manager.send_to(websocket, json.dumps({
                "type": "training_started",
                "task_id": task_id,
                "message": "학습이 시작되었습니다."
            }))
            
            # 학습 상태 업데이트 전송 (비동기)
            asyncio.create_task(send_training_updates(websocket, task_id))
        
        # 학습 중지 명령
        elif msg_type == "stop_training":
            task_id = message.get("task_id", "")
            result = robot_controller.stop_training(task_id)
            await manager.send_to(websocket, json.dumps({
                "type": "training_stopped",
                "success": result["success"],
                "message": result["message"]
            }))
        
        # 알 수 없는 메시지 유형
        else:
            await manager.send_to(websocket, json.dumps({
                "type": "error",
                "message": f"알 수 없는 메시지 유형: {msg_type}"
            }))
    
    except Exception as e:
        logger.error(f"메시지 처리 중 오류 발생: {str(e)}")
        await manager.send_to(websocket, json.dumps({
            "type": "error",
            "message": f"요청 처리 중 오류 발생: {str(e)}"
        }))

async def send_training_updates(websocket: WebSocket, task_id: str):
    """학습 진행 상황 업데이트 전송"""
    try:
        while True:
            status = robot_controller.get_training_status(task_id)
            
            # 학습이 완료되거나 중지되면 업데이트 종료
            if status["status"] in ["completed", "stopped", "failed"]:
                await manager.send_to(websocket, json.dumps({
                    "type": "training_update",
                    "task_id": task_id,
                    "status": status["status"],
                    "progress": status["progress"],
                    "message": status["message"],
                    "is_final": True
                }))
                break
            
            # 진행 상황 업데이트 전송
            await manager.send_to(websocket, json.dumps({
                "type": "training_update",
                "task_id": task_id,
                "status": status["status"],
                "progress": status["progress"],
                "message": status["message"],
                "is_final": False
            }))
            
            await asyncio.sleep(1)  # 1초마다 업데이트
    except Exception as e:
        logger.error(f"학습 업데이트 전송 중 오류 발생: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 실행되는 이벤트 핸들러"""
    logger.info("LeRobot 제어 서버 시작")
    
    # 서버 시작 시 필요한 초기화 작업 수행
    robot_controller.initialize()
    camera_manager.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """서버 종료 시 실행되는 이벤트 핸들러"""
    logger.info("LeRobot 제어 서버 종료")
    
    # 서버 종료 시 필요한 정리 작업 수행
    robot_controller.cleanup()
    camera_manager.cleanup()

if __name__ == "__main__":
    # 서버 실행 포트 (기본값 8000, 환경 변수로 변경 가능)
    port = int(os.environ.get("PORT", 8000))
    
    # 서버 실행
    uvicorn.run(app, host="0.0.0.0", port=port) 