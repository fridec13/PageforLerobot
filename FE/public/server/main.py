import os
import sys
import json
import asyncio
import logging
import time
from typing import List, Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import cv2
import base64

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
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 실행
    logger.info("LeRobot 제어 서버 시작")
    robot_controller.initialize()
    camera_manager.initialize()
    
    yield
    
    # 종료 시 실행
    logger.info("LeRobot 제어 서버 종료")
    robot_controller.cleanup()
    camera_manager.cleanup()

app = FastAPI(title="LeRobot Control Server", lifespan=lifespan)

# CORS 설정 - 웹 앱에서 접근 가능하도록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 시 특정 origin으로 제한하는 것이 좋습니다
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 설정
app.mount("/static", StaticFiles(directory="."), name="static")

# 클라이언트 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_info[websocket] = {
            "connected_at": time.time(),
            "last_activity": time.time()
        }
        logger.info(f"클라이언트 연결됨. 현재 연결 수: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_info:
            del self.connection_info[websocket]
        logger.info(f"클라이언트 연결 해제. 현재 연결 수: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"메시지 브로드캐스트 중 오류: {str(e)}")
                self.disconnect(connection)

    async def send_to(self, websocket: WebSocket, message: str):
        try:
            await websocket.send_text(message)
            self.connection_info[websocket]["last_activity"] = time.time()
        except Exception as e:
            logger.error(f"메시지 전송 중 오류: {str(e)}")
            self.disconnect(websocket)

manager = ConnectionManager()

# 컨트롤러 인스턴스 생성
robot_controller = RobotController()
port_scanner = PortScanner()
camera_manager = CameraManager()

@app.get("/")
async def read_root():
    return FileResponse("camera_test.html")

@app.get("/camera_test.html")
async def read_camera_test():
    return FileResponse("camera_test.html")

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
        
        # 카메라 스트림 시작
        elif msg_type == "start_camera_stream":
            camera_index = message.get("index", 0)
            result = camera_manager.start_camera_stream(camera_index)
            
            # 연결 결과 전송
            await manager.send_to(websocket, json.dumps({
                "type": "camera_connection_result",
                "success": result["success"],
                "message": result["message"],
                "camera_info": result.get("camera_info", {})
            }))
            
            # 스트림 데이터 전송 시작
            if result["success"]:
                camera_id = f"camera_{camera_index}"
                consecutive_errors = 0
                last_frame_time = time.time()
                
                while camera_id in camera_manager.streaming_threads and camera_manager.streaming_threads[camera_id].is_alive():
                    try:
                        # 프레임 레이트 제한 (30fps)
                        current_time = time.time()
                        if current_time - last_frame_time < 0.033:  # 약 30fps
                            await asyncio.sleep(0.001)  # 짧은 대기
                            continue
                        
                        frame_data = camera_manager.get_last_frame(camera_index)
                        if frame_data:
                            # Base64로 인코딩
                            image_base64 = base64.b64encode(frame_data).decode('utf-8')
                            # 클라이언트에 전송
                            await manager.send_to(websocket, json.dumps({
                                "type": "camera_stream",
                                "image": image_base64
                            }))
                            last_frame_time = current_time
                            consecutive_errors = 0  # 성공 시 에러 카운트 리셋
                        else:
                            consecutive_errors += 1
                            if consecutive_errors > 10:  # 연속 10번 실패 시
                                logger.error(f"카메라 {camera_index} 스트림 전송 실패")
                                break
                            await asyncio.sleep(0.1)
                    except Exception as e:
                        logger.error(f"프레임 전송 중 오류: {str(e)}")
                        consecutive_errors += 1
                        if consecutive_errors > 10:
                            break
                        await asyncio.sleep(0.1)
        
        # 카메라 스트림 중지
        elif msg_type == "stop_camera_stream":
            camera_index = message.get("index", 0)
            result = camera_manager.stop_camera_stream(camera_index)
            await manager.send_to(websocket, json.dumps({
                "type": "camera_connection_result",
                "success": result["success"],
                "message": result["message"]
            }))
        
        # 포트 변화 감지 요청
        elif msg_type == "detect_port_change":
            port_change = None
            async for change in port_scanner.detect_port_change():
                if change.get("type") == "waiting":
                    # 대기 상태 알림을 클라이언트에 전송
                    await manager.send_to(websocket, json.dumps({
                        "type": "port_detection_waiting",
                        "seconds_left": change.get("seconds_left", 0)
                    }))
                else:
                    # 최종 결과 저장
                    port_change = change
            
            # 최종 결과 전송 (port_change가 None이 아닌 경우에만)
            if port_change is not None:
                await manager.send_to(websocket, json.dumps({
                    "type": "port_change",
                    "change_detected": port_change["detected"],
                    "new_port": port_change.get("new_port", "")
                }))
            else:
                await manager.send_to(websocket, json.dumps({
                    "type": "port_change",
                    "change_detected": False,
                    "new_port": "",
                    "error": "포트 변화 감지 중 오류가 발생했습니다."
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

if __name__ == "__main__":
    # 서버 실행 포트 (기본값 8000, 환경 변수로 변경 가능)
    # 포트 충돌 방지를 위해 기본 포트 변경 (8000 -> 8080)
    port = int(os.environ.get("PORT", 8000))
    
    # 서버 실행
    uvicorn.run(app, host="0.0.0.0", port=port) 