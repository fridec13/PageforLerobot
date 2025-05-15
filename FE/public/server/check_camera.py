#!/usr/bin/env python3
"""
카메라 연결 확인 유틸리티
"""

import cv2
import sys
import time
import os

def check_cameras():
    """사용 가능한 모든 카메라 확인"""
    print("카메라 연결 상태 확인 중...")
    
    # 리눅스 시스템에서 video 장치 확인
    if sys.platform.startswith('linux'):
        print("\n[리눅스 장치 확인]")
        try:
            video_devices = [d for d in os.listdir('/dev') if d.startswith('video')]
            if video_devices:
                print(f"발견된 비디오 장치: {', '.join(video_devices)}")
            else:
                print("비디오 장치를 찾을 수 없습니다.")
        except Exception as e:
            print(f"장치 확인 중 오류 발생: {str(e)}")
    
    # OpenCV를 사용한 카메라 확인
    print("\n[OpenCV 카메라 테스트]")
    found_cameras = []
    
    # 0~9 인덱스 확인 (일반적으로 10개면 충분)
    for i in range(10):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                
                if width == 0 or height == 0:
                    width, height = 640, 480
                
                if fps <= 0:
                    fps = 30.0
                
                print(f"카메라 {i}: 사용 가능 - {width}x{height}, {fps:.1f}fps")
                found_cameras.append(i)
            else:
                print(f"카메라 {i}: 열렸지만 프레임을 읽을 수 없음")
            cap.release()
        else:
            print(f"카메라 {i}: 사용 불가")
    
    # 요약
    print("\n[요약]")
    if found_cameras:
        print(f"총 {len(found_cameras)}개의 사용 가능한 카메라를 발견했습니다: {found_cameras}")
        print("\n첫 번째 카메라로 간단한 테스트 수행...")
        test_camera(found_cameras[0])
    else:
        print("사용 가능한 카메라를 찾을 수 없습니다.")

def test_camera(camera_index):
    """지정된 카메라의 프레임을 표시하는 간단한 테스트"""
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"카메라 {camera_index}를 열 수 없습니다.")
        return
    
    print(f"카메라 {camera_index} 테스트 중... (종료하려면 'q' 키를 누르세요)")
    
    start_time = time.time()
    frames = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("프레임을 읽을 수 없습니다.")
            break
        
        cv2.imshow(f'카메라 {camera_index} 테스트', frame)
        frames += 1
        
        # 'q' 키로 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
        # 10초 후 자동 종료
        if time.time() - start_time > 10:
            print("10초 제한에 도달했습니다.")
            break
    
    # 정리
    elapsed = time.time() - start_time
    print(f"실제 FPS: {frames / elapsed:.1f}")
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    check_cameras() 