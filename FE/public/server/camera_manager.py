import os
import sys
import time
import logging
import threading
from typing import Dict, List, Any, Optional

import cv2
import numpy as np

logger = logging.getLogger("lerobot-server.camera_manager")

class CameraManager:
    """카메라 연결 및 제어 관리 클래스"""
    
    def __init__(self):
        self.connected_cameras = {}  # 카메라 ID -> 카메라 객체 매핑
        self.camera_info = {}  # 카메라 ID -> 정보 매핑
        self.streaming_threads = {}  # 카메라 ID -> 스트리밍 쓰레드 매핑
        self.stop_events = {}  # 카메라 ID -> 스트리밍 중지 이벤트 매핑
    
    def initialize(self):
        """카메라 관리자 초기화"""
        logger.info("카메라 관리자를 초기화합니다.")
        # 운영체제 확인 및 환경 설정
        if sys.platform.startswith('linux'):
            logger.info("Linux 환경이 감지되었습니다.")
            # 리눅스에서는 v4l2 장치 목록을 확인할 수 있음
            if os.path.exists("/dev/video0"):
                logger.info("기본 카메라 장치가 감지되었습니다.")
    
    def scan_cameras(self) -> List[Dict[str, Any]]:
        """사용 가능한 모든 카메라 스캔"""
        cameras = []
        
        # 처음 10개의 인덱스를 확인 (일반적으로 충분함)
        for i in range(10):
            try:
                cap = cv2.VideoCapture(i)
                if cap.isOpened():
                    # 카메라가 열리면 정보 수집
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    
                    # 일부 카메라는 정보를 제대로 반환하지 않을 수 있음
                    if width == 0 or height == 0:
                        width, height = 640, 480  # 기본값
                    
                    if fps <= 0:
                        fps = 30.0  # 기본값
                    
                    camera_info = {
                        "index": i,
                        "port": f"/dev/video{i}" if sys.platform.startswith('linux') else f"camera:{i}",
                        "resolution": f"{width}x{height}",
                        "fps": round(fps),
                        "name": f"Camera {i}"
                    }
                    
                    cameras.append(camera_info)
                    logger.info(f"카메라 발견: {camera_info['port']} ({camera_info['resolution']})")
                    
                    # 리소스 해제
                    cap.release()
            except Exception as e:
                logger.error(f"카메라 {i} 스캔 중 오류: {str(e)}")
        
        return cameras
    
    def test_connection(self, camera_index: int) -> Dict[str, Any]:
        """카메라 연결 테스트"""
        try:
            # 정수로 변환 (문자열로 들어올 수 있음)
            camera_index = int(camera_index)
            
            # 카메라 열기 시도
            cap = cv2.VideoCapture(camera_index)
            if not cap.isOpened():
                return {
                    "success": False,
                    "message": f"카메라 {camera_index}를 열 수 없습니다"
                }
            
            # 프레임 읽기 시도
            ret, frame = cap.read()
            if not ret or frame is None:
                cap.release()
                return {
                    "success": False,
                    "message": f"카메라 {camera_index}에서 프레임을 읽을 수 없습니다"
                }
            
            # 카메라 정보 수집
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            # 일부 카메라는 정보를 제대로 반환하지 않을 수 있음
            if width == 0 or height == 0:
                width, height = 640, 480  # 기본값
            
            if fps <= 0:
                fps = 30.0  # 기본값
            
            camera_info = {
                "index": camera_index,
                "port": f"/dev/video{camera_index}" if sys.platform.startswith('linux') else f"camera:{camera_index}",
                "resolution": f"{width}x{height}",
                "fps": round(fps),
                "frame_shape": frame.shape
            }
            
            # 리소스 해제
            cap.release()
            
            logger.info(f"카메라 {camera_index} 연결 테스트 성공")
            
            # 카메라 정보 캐싱
            camera_id = f"camera_{camera_index}"
            self.camera_info[camera_id] = camera_info
            
            return {
                "success": True,
                "message": f"카메라 {camera_index} 연결 성공",
                "camera_info": camera_info
            }
            
        except Exception as e:
            logger.error(f"카메라 {camera_index} 연결 테스트 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"카메라 연결 테스트 중 오류: {str(e)}"
            }
    
    def start_camera_stream(self, camera_index: int, resolution: Optional[str] = None, fps: Optional[int] = None) -> Dict[str, Any]:
        """카메라 스트리밍 시작"""
        camera_id = f"camera_{camera_index}"
        
        # 이미 스트리밍 중이면 중지
        if camera_id in self.streaming_threads and self.streaming_threads[camera_id].is_alive():
            self.stop_camera_stream(camera_index)
        
        try:
            # 카메라 객체 생성
            cap = cv2.VideoCapture(camera_index)
            if not cap.isOpened():
                return {
                    "success": False,
                    "message": f"카메라 {camera_index}를 열 수 없습니다"
                }
            
            # 해상도 설정 (요청된 경우)
            if resolution:
                try:
                    width, height = map(int, resolution.split('x'))
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                except (ValueError, AttributeError):
                    logger.warning(f"잘못된 해상도 형식: {resolution}, 기본값을 사용합니다.")
            
            # FPS 설정 (요청된 경우)
            if fps:
                try:
                    cap.set(cv2.CAP_PROP_FPS, fps)
                except Exception:
                    logger.warning(f"FPS {fps} 설정 실패, 기본값을 사용합니다.")
            
            # 중지 이벤트 생성
            stop_event = threading.Event()
            self.stop_events[camera_id] = stop_event
            
            # 스트리밍 스레드 시작
            streaming_thread = threading.Thread(
                target=self._camera_streaming_task,
                args=(camera_id, cap, stop_event),
                daemon=True
            )
            streaming_thread.start()
            
            # 스레드 참조 저장
            self.streaming_threads[camera_id] = streaming_thread
            self.connected_cameras[camera_id] = cap
            
            logger.info(f"카메라 {camera_index} 스트리밍 시작됨")
            
            # 카메라 정보 업데이트
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            camera_info = {
                "index": camera_index,
                "resolution": f"{width}x{height}",
                "fps": round(fps),
                "streaming": True
            }
            
            self.camera_info[camera_id] = camera_info
            
            return {
                "success": True,
                "message": f"카메라 {camera_index} 스트리밍 시작됨",
                "camera_info": camera_info
            }
            
        except Exception as e:
            logger.error(f"카메라 {camera_index} 스트리밍 시작 중 오류: {str(e)}")
            if camera_id in self.connected_cameras:
                self.connected_cameras[camera_id].release()
                del self.connected_cameras[camera_id]
            
            return {
                "success": False,
                "message": f"카메라 스트리밍 시작 중 오류: {str(e)}"
            }
    
    def stop_camera_stream(self, camera_index: int) -> Dict[str, Any]:
        """카메라 스트리밍 중지"""
        camera_id = f"camera_{camera_index}"
        
        try:
            # 스트리밍 중인 경우 중지
            if camera_id in self.stop_events:
                self.stop_events[camera_id].set()  # 중지 신호 전송
                
                # 스레드 종료 대기 (최대 1초)
                if camera_id in self.streaming_threads:
                    self.streaming_threads[camera_id].join(1.0)
                
                # 카메라 객체 해제
                if camera_id in self.connected_cameras:
                    self.connected_cameras[camera_id].release()
                    del self.connected_cameras[camera_id]
                
                # 정리
                if camera_id in self.stop_events:
                    del self.stop_events[camera_id]
                    
                if camera_id in self.streaming_threads:
                    del self.streaming_threads[camera_id]
                
                # 카메라 정보 업데이트
                if camera_id in self.camera_info:
                    self.camera_info[camera_id]["streaming"] = False
                
                logger.info(f"카메라 {camera_index} 스트리밍 중지됨")
                
                return {
                    "success": True,
                    "message": f"카메라 {camera_index} 스트리밍 중지됨"
                }
            else:
                logger.warning(f"카메라 {camera_index}는 현재 스트리밍 중이 아닙니다")
                return {
                    "success": True,
                    "message": f"카메라 {camera_index}는 현재 스트리밍 중이 아닙니다"
                }
                
        except Exception as e:
            logger.error(f"카메라 {camera_index} 스트리밍 중지 중 오류: {str(e)}")
            return {
                "success": False,
                "message": f"카메라 스트리밍 중지 중 오류: {str(e)}"
            }
    
    def _camera_streaming_task(self, camera_id: str, cap: cv2.VideoCapture, stop_event: threading.Event):
        """카메라 스트리밍 작업 (별도 스레드에서 실행)"""
        logger.info(f"카메라 {camera_id} 스트리밍 스레드 시작")
        
        try:
            while not stop_event.is_set():
                # 프레임 읽기
                ret, frame = cap.read()
                if not ret or frame is None:
                    logger.warning(f"카메라 {camera_id}에서 프레임을 읽을 수 없습니다")
                    break
                
                # 여기서 필요한 프레임 처리 수행 (인코딩, 전송 등)
                # 현재는 단순히 시뮬레이션용으로 딜레이만 추가
                time.sleep(0.033)  # 약 30fps
                
        except Exception as e:
            logger.error(f"카메라 {camera_id} 스트리밍 중 오류: {str(e)}")
        
        finally:
            # 리소스 정리
            if cap.isOpened():
                cap.release()
            logger.info(f"카메라 {camera_id} 스트리밍 스레드 종료")
    
    def cleanup(self):
        """모든 카메라 자원 정리"""
        logger.info("모든 카메라 연결 정리 중...")
        
        # 모든 스트리밍 중지
        for camera_id in list(self.connected_cameras.keys()):
            try:
                camera_index = int(camera_id.split("_")[1])
                self.stop_camera_stream(camera_index)
            except Exception as e:
                logger.error(f"카메라 {camera_id} 정리 중 오류: {str(e)}")
        
        # 확실하게 모든 OpenCV 윈도우 정리
        try:
            cv2.destroyAllWindows()
        except:
            pass
        
        logger.info("카메라 연결 정리 완료") 