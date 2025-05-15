import { useState, useEffect, useCallback, useRef } from 'react';

// Window 객체에 LeRobotClient 타입 확장
declare global {
  interface Window {
    LeRobotClient: any;
  }
}

// LeRobotClient 타입 정의
interface LeRobotClient {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  on: (messageType: string, handler: (message: any) => void) => void;
  off: (messageType: string) => void;
  scanPorts: () => Promise<any>;
  detectPortChange: () => Promise<any>;
  testRobotConnection: (port: string) => Promise<any>;
  testCameraConnection: (index: number) => Promise<any>;
  scanCameras: () => Promise<any>;
  updateRobotConfig: (config: any) => Promise<any>;
  startTraining: (trainingConfig: any) => Promise<any>;
  stopTraining: (taskId: string) => Promise<any>;
  isConnected: boolean;
}

// 전역 클라이언트 인스턴스 저장
let globalClient: any = null;

export function useLeRobotClient() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const clientRef = useRef<LeRobotClient | null>(null);

  // 클라이언트 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.LeRobotClient) {
        setIsClientLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = '/js/client.js';
      script.async = true;
      script.onload = () => {
        setIsClientLoaded(true);
      };
      script.onerror = () => {
        setError('LeRobot 클라이언트 스크립트를 로드할 수 없습니다.');
      };
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // 클라이언트 초기화 및 연결
  useEffect(() => {
    if (!isClientLoaded || !window.LeRobotClient) return;
    
    const initClient = async () => {
      try {
        // 전역 인스턴스가 없으면 생성
        if (!globalClient) {
          globalClient = new window.LeRobotClient('ws://localhost:8000/ws', {
            reconnectInterval: 3000,
            maxReconnectAttempts: 10
          });
          
          // 이벤트 핸들러 설정
          globalClient.onConnect = () => {
            console.log('LeRobot 서버에 연결되었습니다.');
            setIsConnected(true);
            setError(null);
          };
          
          globalClient.onDisconnect = () => {
            console.log('LeRobot 서버와의 연결이 끊겼습니다.');
            setIsConnected(false);
          };
          
          globalClient.onError = (err: Error) => {
            console.error('LeRobot 서버 연결 오류:', err);
            setError('서버 연결 오류: ' + (err.message || '알 수 없는 오류'));
          };
        }

        // 참조 저장
        clientRef.current = globalClient;
        
        // 연결 시도
        setIsLoading(true);
        try {
          await globalClient.connect();
          setIsLoading(false);
        } catch (err) {
          console.error('연결 시도 중 오류:', err);
          setIsLoading(false);
          setError('서버에 연결할 수 없습니다. 로컬 서버가 실행 중인지 확인하세요.');
        }
      } catch (err) {
        console.error('클라이언트 초기화 오류:', err);
        setError('클라이언트 초기화 중 오류가 발생했습니다.');
      }
    };

    initClient();
    
    return () => {
      // 컴포넌트가 언마운트될 때 연결을 끊지 않음
      // 전역적으로 하나의 연결을 유지하기 위함
    };
  }, [isClientLoaded]);

  // 서버에 메시지 전송
  const sendMessage = useCallback(async (type: string, data: any = {}) => {
    if (!clientRef.current || !clientRef.current.isConnected) {
      throw new Error('서버에 연결되어 있지 않습니다.');
    }
    
    const client = clientRef.current;
    
    switch (type) {
      case 'scan_ports':
        return await client.scanPorts();
      case 'detect_port_change':
        return await client.detectPortChange();
      case 'test_robot_connection':
        return await client.testRobotConnection(data.port);
      case 'test_camera_connection':
        return await client.testCameraConnection(data.index);
      case 'scan_cameras':
        return await client.scanCameras();
      case 'update_robot_config':
        return await client.updateRobotConfig(data.config);
      case 'start_training':
        return await client.startTraining(data.trainingConfig);
      case 'stop_training':
        return await client.stopTraining(data.taskId);
      default:
        throw new Error(`알 수 없는 메시지 유형: ${type}`);
    }
  }, []);

  // 이벤트 핸들러 등록
  const addMessageHandler = useCallback((messageType: string, handler: (message: any) => void) => {
    if (clientRef.current) {
      clientRef.current.on(messageType, handler);
    }
  }, []);

  // 이벤트 핸들러 제거
  const removeMessageHandler = useCallback((messageType: string) => {
    if (clientRef.current) {
      clientRef.current.off(messageType);
    }
  }, []);

  // 연결 상태 객체 반환
  return {
    isConnected,
    isLoading,
    error,
    sendMessage,
    addMessageHandler,
    removeMessageHandler,
    client: clientRef.current
  };
} 