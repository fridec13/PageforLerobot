import asyncio
import time
import logging
from typing import Dict, List, Any, Set, Optional

import serial
import serial.tools.list_ports

logger = logging.getLogger("lerobot-server.port_scanner")

class PortScanner:
    """시리얼 포트 스캔 및 변경 감지 클래스"""
    
    def __init__(self):
        self.last_scan: Set[str] = set()
        self.last_scan_time = 0
    
    def scan_ports(self) -> List[Dict[str, Any]]:
        """사용 가능한 모든 시리얼 포트를 스캔하여 반환"""
        try:
            # 현재 사용 가능한 모든 시리얼 포트 조회
            available_ports = list(serial.tools.list_ports.comports())
            
            # 포트 정보를 사용하기 쉬운 형태로 변환
            ports_info = []
            port_names = set()
            
            for port in available_ports:
                port_dict = {
                    "port": port.device,
                    "description": port.description or "Unknown Device",
                    "hardware_id": port.hwid or "Unknown",
                    "manufacturer": port.manufacturer or "Unknown",
                    "product": getattr(port, "product", None) or "Unknown",
                    "serial_number": getattr(port, "serial_number", None) or "Unknown",
                    "location": getattr(port, "location", None) or "Unknown"
                }
                ports_info.append(port_dict)
                port_names.add(port.device)
            
            # 마지막 스캔 결과 업데이트
            self.last_scan = port_names
            self.last_scan_time = time.time()
            
            logger.info(f"{len(ports_info)}개의 포트를 발견했습니다")
            return ports_info
        
        except Exception as e:
            logger.error(f"포트 스캔 중 오류 발생: {str(e)}")
            return []
    
    async def detect_port_change(self) -> Dict[str, Any]:
        """포트 변화를 감지하여 새로 연결된 장치를 식별"""
        previous_ports = self.last_scan
        
        # 사용자가 새 장치를 연결할 시간을 주기 위해 대기
        for i in range(5, 0, -1):
            logger.info(f"포트 변화 감지 대기 중... {i}초 남음")
            yield {"type": "waiting", "seconds_left": i}
            await asyncio.sleep(1)
        
        # 새로운 포트 스캔
        current_ports_info = self.scan_ports()
        current_ports = self.last_scan
        
        # 새로 추가된 포트 찾기
        new_ports = current_ports - previous_ports
        
        result = {
            "detected": len(new_ports) > 0,
            "new_ports": list(new_ports),
            "all_ports": [p["port"] for p in current_ports_info]
        }
        
        if len(new_ports) > 0:
            result["new_port"] = list(new_ports)[0]  # 첫 번째 새 포트만 반환
            logger.info(f"새 포트가 감지됨: {result['new_port']}")
        else:
            logger.info("새 포트가 감지되지 않음")
        
        return result
    
    def check_port_available(self, port: str) -> bool:
        """특정 포트가 사용 가능한지 확인"""
        try:
            # 포트 열기 시도
            ser = serial.Serial(port, 9600, timeout=0.5)
            ser.close()
            return True
        except (serial.SerialException, OSError):
            return False
    
    def guess_device_type(self, port_info: Dict[str, Any]) -> str:
        """포트 정보를 기반으로 장치 유형 추측"""
        # 간단한 휴리스틱을 사용한 장치 유형 추측
        description = port_info.get("description", "").lower()
        hardware_id = port_info.get("hardware_id", "").lower()
        
        if "arduino" in description or "arduino" in hardware_id:
            return "arduino"
        elif "ftdi" in description or "ft232" in hardware_id:
            return "ftdi"
        elif "cp210" in description or "cp210" in hardware_id:
            return "cp210x"
        elif "prolific" in description or "pl2303" in hardware_id:
            return "pl2303"
        elif "ch340" in description or "ch340" in hardware_id:
            return "ch340"
        elif "camera" in description or "cam" in description:
            return "camera"
        else:
            return "unknown" 