/**
 * LeRobotClient - 웹소켓 기반 LeRobot 제어 클라이언트
 * 이 클래스는 로컬 웹소켓 서버와 통신하여 로봇, 카메라, 학습 등을 제어합니다.
 */
class LeRobotClient {
  /**
   * LeRobot 클라이언트 생성
   * @param {string} serverUrl - 웹소켓 서버 URL (기본값: ws://localhost:8000/ws)
   * @param {Object} options - 클라이언트 옵션
   * @param {number} options.reconnectInterval - 재연결 시도 간격 (밀리초)
   * @param {number} options.maxReconnectAttempts - 최대 재연결 시도 횟수
   */
  constructor(serverUrl = 'ws://localhost:8000/ws', options = {}) {
    this.serverUrl = serverUrl;
    this.options = {
      reconnectInterval: 2000,
      maxReconnectAttempts: 5,
      ...options
    };
    
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 1;
    
    // 상태 변화 이벤트
    this.onConnect = () => {};
    this.onDisconnect = () => {};
    this.onError = () => {};
  }
  
  /**
   * 서버에 연결
   * @returns {Promise<boolean>} 연결 성공 여부
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.serverUrl);
        
        this.socket.onopen = () => {
          console.log('LeRobot 서버에 연결되었습니다.');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.onConnect();
          resolve(true);
        };
        
        this.socket.onclose = (event) => {
          this.isConnected = false;
          console.log('LeRobot 서버와의 연결이 끊겼습니다.', event.code, event.reason);
          this.onDisconnect(event);
          
          // 자동 재연결 시도
          if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`${this.options.reconnectInterval / 1000}초 후에 재연결 시도 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.options.reconnectInterval);
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('웹소켓 오류:', error);
          this.onError(error);
          reject(error);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this._handleMessage(message);
          } catch (err) {
            console.error('메시지 처리 중 오류:', err, event.data);
          }
        };
      } catch (err) {
        console.error('웹소켓 연결 중 오류:', err);
        reject(err);
      }
    });
  }
  
  /**
   * 서버 연결 종료
   */
  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.close();
      this.isConnected = false;
    }
  }
  
  /**
   * 특정 타입의 메시지 핸들러 등록
   * @param {string} messageType - 메시지 타입
   * @param {Function} handler - 메시지 처리 핸들러
   */
  on(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }
  
  /**
   * 메시지 핸들러 해제
   * @param {string} messageType - 메시지 타입
   */
  off(messageType) {
    this.messageHandlers.delete(messageType);
  }
  
  /**
   * 시리얼 포트 스캔 요청
   * @returns {Promise<Array>} 감지된 포트 목록
   */
  async scanPorts() {
    return this._sendRequest('scan_ports');
  }
  
  /**
   * 포트 변화 감지
   * @returns {Promise<Object>} 감지 결과
   */
  async detectPortChange() {
    return this._sendRequest('detect_port_change');
  }
  
  /**
   * 로봇 연결 테스트
   * @param {string} port - 테스트할 포트
   * @returns {Promise<Object>} 연결 결과
   */
  async testRobotConnection(port) {
    return this._sendRequest('test_robot_connection', { port });
  }
  
  /**
   * 카메라 연결 테스트
   * @param {number} index - 테스트할 카메라 인덱스
   * @returns {Promise<Object>} 연결 결과
   */
  async testCameraConnection(index) {
    return this._sendRequest('test_camera_connection', { index });
  }
  
  /**
   * 카메라 스캔
   * @returns {Promise<Array>} 감지된 카메라 목록
   */
  async scanCameras() {
    return this._sendRequest('scan_cameras');
  }
  
  /**
   * 로봇 설정 업데이트
   * @param {Object} config - 로봇 설정
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateRobotConfig(config) {
    return this._sendRequest('update_robot_config', { config });
  }
  
  /**
   * 학습 시작
   * @param {Object} trainingConfig - 학습 설정
   * @returns {Promise<Object>} 학습 시작 결과 (task_id 포함)
   */
  async startTraining(trainingConfig) {
    return this._sendRequest('start_training', { training_config: trainingConfig });
  }
  
  /**
   * 학습 중지
   * @param {string} taskId - 중지할 학습 작업 ID
   * @returns {Promise<Object>} 중지 결과
   */
  async stopTraining(taskId) {
    return this._sendRequest('stop_training', { task_id: taskId });
  }
  
  /**
   * 요청을 서버로 전송하고 응답을 기다립니다
   * @private
   * @param {string} type - 요청 타입
   * @param {Object} data - 요청 데이터
   * @returns {Promise<any>} 응답 데이터
   */
  _sendRequest(type, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('서버에 연결되어 있지 않습니다.'));
        return;
      }
      
      // 요청 ID 생성
      const requestId = this._generateRequestId();
      
      // 완료 핸들러 등록
      this.pendingRequests.set(requestId, { resolve, reject });
      
      // 요청 전송
      this.socket.send(JSON.stringify({
        type,
        request_id: requestId,
        ...data
      }));
    });
  }
  
  /**
   * 고유한 요청 ID 생성
   * @private
   * @returns {number} 요청 ID
   */
  _generateRequestId() {
    return this.requestId++;
  }
  
  /**
   * 수신된 메시지 처리
   * @private
   * @param {Object} message - 수신된 메시지
   */
  _handleMessage(message) {
    const { type, request_id } = message;
    
    // 요청에 대한 응답 처리
    if (request_id && this.pendingRequests.has(request_id)) {
      const { resolve, reject } = this.pendingRequests.get(request_id);
      
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message);
      }
      
      this.pendingRequests.delete(request_id);
      return;
    }
    
    // 등록된 메시지 핸들러로 처리
    if (type && this.messageHandlers.has(type)) {
      const handler = this.messageHandlers.get(type);
      handler(message);
    }
  }
}

// 브라우저에서 전역 객체로 노출
if (typeof window !== 'undefined') {
  window.LeRobotClient = LeRobotClient;
}

// ES6 모듈 내보내기
export default LeRobotClient; 