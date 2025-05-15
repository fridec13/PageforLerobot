import os
import sys
import json
import time
import uuid
import logging
import subprocess
import threading
import tempfile
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable, Tuple

import serial

logger = logging.getLogger("lerobot-server.robot_control")

class RobotController:
    """로봇 연결 및 제어, 학습 관리 클래스"""
    
    def __init__(self):
        self.connected_robots = {}  # 로봇 ID -> 시리얼 연결 매핑
        self.robot_info = {}  # 로봇 ID -> 정보 매핑
        self.running_tasks = {}  # task_id -> 작업 정보 매핑
        self.stop_events = {}  # task_id -> 중지 이벤트 매핑
        self.config_path = None  # 설정 파일 경로
    
    def initialize(self):
        """로봇 컨트롤러 초기화"""
        logger.info("로봇 컨트롤러를 초기화합니다.")
        
        # 운영체제 확인 및 환경 설정
        self.config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config")
        os.makedirs(self.config_path, exist_ok=True)
        
        # 기본 설정 파일 생성 (없는 경우)
        default_config_path = os.path.join(self.config_path, "default_robot_config.json")
        if not os.path.exists(default_config_path):
            self._create_default_config(default_config_path)
    
    def _create_default_config(self, config_path: str):
        """기본 설정 파일 생성"""
        default_config = {
            "so100": {
                "type": "so100",
                "calibration_dir": ".cache/calibration/so100",
                "max_relative_target": 5,
                "leader_arms": {
                    "main": {
                        "port": "/dev/ttyACM0",
                        "motors": {
                            "shoulder_pan": {"id": 1, "model": "sts3215"},
                            "shoulder_lift": {"id": 2, "model": "sts3215"},
                            "elbow_flex": {"id": 3, "model": "sts3215"},
                            "wrist_flex": {"id": 4, "model": "sts3215"},
                            "wrist_roll": {"id": 5, "model": "sts3215"},
                            "gripper": {"id": 6, "model": "sts3215"}
                        }
                    }
                },
                "cameras": {
                    "overviewCamera": {
                        "camera_index": 0,
                        "fps": 30,
                        "width": 640,
                        "height": 480
                    },
                    "leftCamera": {
                        "camera_index": 2,
                        "fps": 30,
                        "width": 640,
                        "height": 480
                    },
                    "rightCamera": {
                        "camera_index": 4,
                        "fps": 30,
                        "width": 640,
                        "height": 480
                    }
                },
                "mock": True
            }
        }
        
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        logger.info(f"기본 설정 파일을 생성했습니다: {config_path}")
    
    def test_connection(self, port: str) -> Dict[str, Any]:
        """로봇 연결 테스트"""
        try:
            # 포트 존재 여부 확인
            if not os.path.exists(port) and not port.startswith("COM"):
                return {
                    "success": False,
                    "message": f"포트 {port}가 존재하지 않습니다"
                }
            
            # 시리얼 연결 시도
            ser = serial.Serial(port, 1000000, timeout=1)  # FEETECH STS3215 기본 통신 속도
            
            # 연결 확인을 위한 간단한 명령 전송 (ping 또는 ID 요청)
            # 여기서는 실제 명령 없이 시뮬레이션만 수행
            time.sleep(0.5)
            ser.close()
            
            # 로봇 정보 생성 (실제로는 로봇 응답에서 가져와야 함)
            robot_id = f"robot_{port.split('/')[-1]}"
            robot_info = {
                "id": robot_id,
                "type": "so100",
                "port": port,
                "firmware_version": "1.0.0",
                "motors": [
                    {"id": 1, "name": "shoulder_pan", "model": "sts3215", "temperature": 25, "position": 0},
                    {"id": 2, "name": "shoulder_lift", "model": "sts3215", "temperature": 26, "position": 0},
                    {"id": 3, "name": "elbow_flex", "model": "sts3215", "temperature": 25, "position": 0},
                    {"id": 4, "name": "wrist_flex", "model": "sts3215", "temperature": 24, "position": 0},
                    {"id": 5, "name": "wrist_roll", "model": "sts3215", "temperature": 25, "position": 0},
                    {"id": 6, "name": "gripper", "model": "sts3215", "temperature": 26, "position": 0}
                ],
                "last_seen": time.time()
            }
            
            # 로봇 정보 캐싱
            self.robot_info[robot_id] = robot_info
            
            logger.info(f"로봇 {robot_id} 연결 테스트 성공")
            
            return {
                "success": True,
                "message": f"포트 {port}에서 로봇 연결 성공",
                "robot_info": robot_info
            }
            
        except serial.SerialException as e:
            logger.error(f"시리얼 포트 {port} 연결 오류: {str(e)}")
            return {
                "success": False,
                "message": f"시리얼 포트 오류: {str(e)}"
            }
        except Exception as e:
            logger.error(f"로봇 연결 테스트 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"로봇 연결 테스트 중 오류: {str(e)}"
            }
    
    def update_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """로봇 설정 업데이트 및 저장"""
        try:
            robot_type = config.get("type", "so100")
            config_file = os.path.join(self.config_path, f"{robot_type}_config.json")
            
            # 설정 저장
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info(f"로봇 {robot_type} 설정 업데이트 완료")
            
            return {
                "success": True,
                "message": f"로봇 {robot_type} 설정이 업데이트되었습니다",
                "config_path": config_file
            }
            
        except Exception as e:
            logger.error(f"설정 업데이트 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"설정 업데이트 중 오류: {str(e)}"
            }
    
    def start_training(self, config: Dict[str, Any]) -> str:
        """학습 작업 시작"""
        # 고유한 작업 ID 생성
        task_id = str(uuid.uuid4())
        
        # 학습 설정 준비
        robot_type = config.get("robotType", "so100")
        model_repo = config.get("modelRepo", "huggingface/so100-control")
        episodes = config.get("episodes", 10)
        duration = config.get("duration", 300)
        record_data = config.get("recordData", True)
        use_camera = config.get("useCamera", True)
        custom_commands = config.get("customCommands", "")
        
        # 중지 이벤트 생성
        stop_event = threading.Event()
        self.stop_events[task_id] = stop_event
        
        # 학습 명령어 구성 (실제로는 Python API를 직접 호출할 수 있음)
        command = [
            sys.executable, "-m", "lerobot.train",
            f"--robot-type={robot_type}",
            f"--model-repo={model_repo}",
            f"--episodes={episodes}",
            f"--duration={duration}",
            f"--record-data={'True' if record_data else 'False'}",
            f"--use-camera={'True' if use_camera else 'False'}"
        ]
        
        if custom_commands:
            command.extend(custom_commands.split())
        
        # 작업 정보 저장
        self.running_tasks[task_id] = {
            "command": command,
            "start_time": time.time(),
            "progress": 0,
            "status": "preparing",
            "message": "학습 준비 중...",
            "config": config,
            "log_file": os.path.join(self.config_path, f"training_{task_id}.log")
        }
        
        # 학습 프로세스 시작 (별도 스레드)
        threading.Thread(
            target=self._run_training_process,
            args=(task_id, command, stop_event),
            daemon=True
        ).start()
        
        logger.info(f"학습 작업 시작됨: {task_id}")
        return task_id
    
    def _run_training_process(self, task_id: str, command: List[str], stop_event: threading.Event):
        """학습 프로세스 실행 (별도 스레드에서 실행)"""
        log_file = self.running_tasks[task_id]["log_file"]
        
        try:
            # 로그 파일 열기
            with open(log_file, 'w') as f_log:
                self.running_tasks[task_id]["status"] = "running"
                self.running_tasks[task_id]["message"] = "학습이 실행 중입니다..."
                
                # 실제 학습 실행을 시뮬레이션
                episode_count = self.running_tasks[task_id]["config"].get("episodes", 10)
                
                for i in range(episode_count):
                    if stop_event.is_set():
                        self.running_tasks[task_id]["status"] = "stopped"
                        self.running_tasks[task_id]["message"] = "학습이 중단되었습니다"
                        f_log.write(f"학습이 중단되었습니다\n")
                        f_log.flush()
                        break
                    
                    # 진행 상황 업데이트
                    progress = int(((i + 1) / episode_count) * 100)
                    self.running_tasks[task_id]["progress"] = progress
                    self.running_tasks[task_id]["message"] = f"에피소드 {i + 1}/{episode_count} 실행 중... ({progress}%)"
                    
                    # 로그 기록
                    log_message = f"Episode {i + 1}/{episode_count} - Reward: {50 + i * 5} - Time: {time.time()}\n"
                    f_log.write(log_message)
                    f_log.flush()
                    
                    # 에피소드 실행 시뮬레이션
                    time.sleep(self.running_tasks[task_id]["config"].get("duration", 300) / episode_count)
                
                # 학습 완료
                if self.running_tasks[task_id]["status"] != "stopped":
                    self.running_tasks[task_id]["status"] = "completed"
                    self.running_tasks[task_id]["message"] = "학습이 완료되었습니다"
                    self.running_tasks[task_id]["progress"] = 100
                    f_log.write("학습이 완료되었습니다\n")
        
        except Exception as e:
            logger.error(f"학습 실행 중 오류: {str(e)}")
            self.running_tasks[task_id]["status"] = "failed"
            self.running_tasks[task_id]["message"] = f"학습 중 오류 발생: {str(e)}"
            
            # 로그 기록
            try:
                with open(log_file, 'a') as f_log:
                    f_log.write(f"오류 발생: {str(e)}\n")
            except:
                pass
                
    def stop_training(self, task_id: str) -> Dict[str, Any]:
        """학습 작업 중지"""
        try:
            if task_id not in self.running_tasks:
                return {
                    "success": False,
                    "message": f"작업 ID {task_id}를 찾을 수 없습니다"
                }
            
            # 중지 신호 전송
            if task_id in self.stop_events:
                self.stop_events[task_id].set()
            
            # 작업 상태 업데이트
            self.running_tasks[task_id]["status"] = "stopping"
            self.running_tasks[task_id]["message"] = "학습 중지 중..."
            
            # 실제로는 여기서 프로세스 강제 종료 등의 추가 작업이 필요할 수 있음
            
            logger.info(f"학습 작업 중지 요청됨: {task_id}")
            
            return {
                "success": True,
                "message": f"학습 중지 요청이 전송되었습니다"
            }
            
        except Exception as e:
            logger.error(f"학습 중지 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"학습 중지 중 오류: {str(e)}"
            }
    
    def get_training_status(self, task_id: str) -> Dict[str, Any]:
        """학습 작업 상태 조회"""
        if task_id not in self.running_tasks:
            return {
                "status": "unknown",
                "progress": 0,
                "message": f"작업 ID {task_id}를 찾을 수 없습니다"
            }
        
        task_info = self.running_tasks[task_id]
        
        return {
            "status": task_info["status"],
            "progress": task_info["progress"],
            "message": task_info["message"],
            "start_time": task_info.get("start_time", 0),
            "elapsed_time": time.time() - task_info.get("start_time", time.time())
        }
    
    def get_training_logs(self, task_id: str, last_n_lines: int = 100) -> Dict[str, Any]:
        """학습 로그 조회"""
        if task_id not in self.running_tasks:
            return {
                "success": False,
                "message": f"작업 ID {task_id}를 찾을 수 없습니다",
                "logs": []
            }
        
        log_file = self.running_tasks[task_id]["log_file"]
        
        try:
            if not os.path.exists(log_file):
                return {
                    "success": True,
                    "message": "로그 파일이 아직 생성되지 않았습니다",
                    "logs": []
                }
            
            # 마지막 N 라인 읽기
            with open(log_file, 'r') as f:
                lines = f.readlines()
                logs = lines[-last_n_lines:] if last_n_lines > 0 else lines
            
            return {
                "success": True,
                "message": "로그를 성공적으로 가져왔습니다",
                "logs": logs
            }
            
        except Exception as e:
            logger.error(f"로그 조회 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"로그 조회 중 오류: {str(e)}",
                "logs": []
            }
    
    def cleanup(self):
        """모든 로봇 및 작업 자원 정리"""
        logger.info("모든 로봇 연결 및 작업 정리 중...")
        
        # 실행 중인 모든 작업 중지
        for task_id in list(self.stop_events.keys()):
            try:
                self.stop_events[task_id].set()
            except Exception as e:
                logger.error(f"작업 {task_id} 중지 중 오류: {str(e)}")
        
        # 모든 로봇 연결 닫기
        for robot_id, connection in list(self.connected_robots.items()):
            try:
                connection.close()
            except Exception as e:
                logger.error(f"로봇 {robot_id} 연결 닫기 오류: {str(e)}")
        
        logger.info("로봇 및 작업 정리 완료") 