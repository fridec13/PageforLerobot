"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useLeRobotClient } from "@/hooks/useLeRobotClient"

// 카메라 인터페이스
interface Camera {
  id: string
  name: string
  port: string
  index: number
  resolution: string
  fps: number
  isActive: boolean
  isStreaming: boolean
}

export default function CameraPage() {
  // 상태 관리
  const [cameras, setCameras] = useState<Camera[]>([
    { id: "cam1", name: "overviewCamera", port: "/dev/video0", index: 0, resolution: "640x480", fps: 30, isActive: false, isStreaming: false },
    { id: "cam2", name: "leftCamera", port: "/dev/video2", index: 2, resolution: "640x480", fps: 30, isActive: false, isStreaming: false },
    { id: "cam3", name: "rightCamera", port: "/dev/video4", index: 4, resolution: "640x480", fps: 30, isActive: false, isStreaming: false }
  ])
  
  // 선택된 카메라를 추적
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  
  // 비디오 요소 참조
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  
  // 카메라 활성화/비활성화 처리
  const toggleCamera = (cameraId: string) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId
        ? { ...camera, isActive: !camera.isActive, isStreaming: false }
        : camera
    ))
  }
  
  // 카메라 스트리밍 시작/중지
  const toggleStreaming = async (cameraId: string) => {
    const camera = cameras.find(cam => cam.id === cameraId);
    if (!camera) return;

    try {
      if (!camera.isStreaming) {
        // 기존에 연결된 웹소켓이 있으면 먼저 정리
        if (webSocketConnections[cameraId] && 
            webSocketConnections[cameraId].readyState !== WebSocket.CLOSED) {
          try {
            webSocketConnections[cameraId].close();
          } catch (err) {
            console.warn('기존 웹소켓 연결 정리 중 오류:', err);
          }
        }
      
        // 웹소켓 연결
        const ws = new WebSocket(`ws://localhost:8000/ws`);
        
        // 웹소켓 연결 저장
        setWebSocketConnections(prev => ({
          ...prev,
          [cameraId]: ws
        }));
        
        ws.onopen = () => {
          // 카메라 스트림 시작 요청
          if (ws.readyState === WebSocket.OPEN) {
            console.log(`카메라 스트림 시작 요청: 인덱스 ${camera.index} (${camera.port})`);
            ws.send(JSON.stringify({
              type: "start_camera_stream",
              index: parseInt(String(camera.index))  // 인덱스를 정수로 확실하게 변환
            }));
          }
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('서버 메시지 수신:', message.type);
          
          if (message.type === "camera_stream" && message.image) {
            const videoElement = videoRefs.current[cameraId];
            if (videoElement) {
              try {
                // 이미지 URL 생성
                const imageUrl = `data:image/jpeg;base64,${message.image}`;
                
                // 이미지 로딩
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                // 캔버스 참조 가져오기 또는 생성
                if (!canvasRefs.current[cameraId]) {
                  const canvas = document.createElement('canvas');
                  canvas.width = 640;
                  canvas.height = 480;
                  canvasRefs.current[cameraId] = canvas;
                }
                
                const canvas = canvasRefs.current[cameraId];
                if (!canvas) return;
                
                img.onload = () => {
                  try {
                    if (!videoRefs.current[cameraId] || !canvas) return;
                    
                    const ctx = canvas.getContext('2d', { alpha: false });
                    if (!ctx) return;
                    
                    // 이전 프레임 지우기
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 새 이미지 그리기
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // 이전 비디오 스트림 정리
                    if (videoElement.srcObject) {
                      try {
                        const stream = videoElement.srcObject as MediaStream;
                        const tracks = stream.getTracks();
                        tracks.forEach((track: MediaStreamTrack) => {
                          if (track.readyState === 'live') {
                            track.stop();
                          }
                        });
                      } catch (err) {
                        console.warn('기존 트랙 정리 오류:', err);
                      }
                    }
                    
                    try {
                      // 새 스트림 생성
                      const stream = canvas.captureStream(30);
                      videoElement.srcObject = stream;
                      
                      // 자동 재생 설정
                      if (videoElement.paused) {
                        const playPromise = videoElement.play();
                        if (playPromise !== undefined) {
                          playPromise.catch(error => {
                            console.warn('비디오 재생 오류:', error);
                          });
                        }
                      }
                    } catch (streamErr) {
                      console.error('스트림 생성 오류:', streamErr);
                    }
                  } catch (renderErr) {
                    console.error('렌더링 오류:', renderErr);
                  }
                };
                
                img.onerror = (err) => {
                  console.error('이미지 로딩 오류:', err);
                };
                
                // 이미지 로드 시작
                img.src = imageUrl;
              } catch (processErr) {
                console.error('이미지 처리 오류:', processErr);
              }
            }
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          // 자세한 오류 정보 표시
          console.error('연결 정보:', { 
            cameraId, 
            index: camera.index, 
            portPath: camera.port 
          });
          
          alert('카메라 스트림 연결 중 오류가 발생했습니다. 콘솔에서 자세한 정보를 확인하세요.');
        };

      } else {
        // 스트림 중지
        const ws = webSocketConnections[cameraId];
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              type: "stop_camera_stream",
              index: camera.index
            }));
            ws.close();
          } catch (err) {
            console.warn('웹소켓 통신 중 오류:', err);
          }
        }
        
        // 웹소켓 연결 제거
        setWebSocketConnections(prev => {
          const newConnections = { ...prev };
          delete newConnections[cameraId];
          return newConnections;
        });
        
        // 비디오 스트림 정리
        const videoElement = videoRefs.current[cameraId];
        if (videoElement && videoElement.srcObject) {
          try {
            const stream = videoElement.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach((track: MediaStreamTrack) => {
              if (track.readyState === 'live') {
                track.stop();
              }
            });
            videoElement.srcObject = null;
          } catch (err) {
            console.warn('스트림 정리 오류:', err);
          }
        }
        
        // 캔버스 정리
        canvasRefs.current[cameraId] = null;
      }

      // 상태 업데이트
      setCameras(prev => prev.map(cam => 
        cam.id === cameraId
          ? { ...cam, isStreaming: !cam.isStreaming }
          : cam
      ));
    } catch (error) {
      console.error('Streaming error:', error);
      alert('카메라 스트림 처리 중 오류가 발생했습니다.');
    }
  };
  
  // 카메라 스캔 함수 수정
  const scanForCameras = async () => {
    try {
      const ws = new WebSocket(`ws://localhost:8000/ws`);
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "scan_ports"
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === "ports_list") {
          // 기존 카메라 설정 정보 저장
          const existingCamerasMap = cameras.reduce((acc: Record<string, Camera>, camera) => {
            // 포트 기준으로 매핑 (인덱스는 변경될 수 있음)
            acc[camera.port] = camera;
            return acc;
          }, {});
          
          // 새로 발견된 포트로 카메라 객체 생성
          const newCameras = message.ports.map((port: any, idx: number) => {
            const portPath = port.port;
            const resolution = port.description.split('(')[1]?.split(')')[0] || "640x480";
            const fps = parseInt(port.description.split('@')[1]) || 30;
            
            // 중요: 포트 경로에서 실제 인덱스 추출 (OpenCV에서 사용하는 인덱스)
            // 예: "/dev/video2" -> 2
            const extractedIndex = parseInt(portPath.replace(/^.*?(\d+)$/, '$1'));
            
            // 이전에 설정된 동일 포트의 카메라가 있는지 확인
            const existingCamera = Object.values(existingCamerasMap).find(
              (cam: any) => cam.port === portPath || 
                            // 포트 번호만 추출하여 비교 (/dev/videoX에서 X 부분)
                            cam.port.replace(/^.*video(\d+)$/, '$1') === portPath.replace(/^.*video(\d+)$/, '$1')
            );
            
            // 기존 설정이 있으면 유지하고, 인덱스만 업데이트
            if (existingCamera) {
              return {
                ...existingCamera,
                index: extractedIndex, // 포트 경로에서 추출한 정확한 인덱스 사용
                port: portPath, // 정확한 포트 업데이트
                isActive: true, // 자동 활성화
                isStreaming: false // 스트리밍 상태 초기화
              };
            }
            
            // 새 카메라인 경우 기본 설정으로 생성
            return {
              id: `cam${idx + 1}`,
              name: `Camera ${extractedIndex}`,
              port: portPath,
              index: extractedIndex, // 포트 경로에서 추출한 정확한 인덱스 사용
              resolution,
              fps,
              isActive: true,
              isStreaming: false
            };
          });
          
          console.log('스캔된 카메라:', newCameras);
          setCameras(newCameras);
          
          // 카메라가 발견되면 첫 번째 카메라를 선택하고 자동으로 스트리밍 시작
          if (newCameras.length > 0) {
            // 이전에 선택된 카메라가 있으면 해당 ID의 카메라 선택, 아니면 첫 번째 카메라 선택
            const previouslySelectedId = selectedCamera?.id;
            const cameraToSelect = previouslySelectedId 
              ? newCameras.find((cam: Camera) => cam.id === previouslySelectedId) || newCameras[0] 
              : newCameras[0];
              
            setSelectedCamera(cameraToSelect);
            
            // 약간의 지연 후 모든 카메라 스트리밍 시작
            setTimeout(() => {
              newCameras.forEach((camera: Camera) => {
                toggleStreaming(camera.id);
              });
            }, 500); // 카메라 활성화 후 스트리밍 시작 전 약간의 지연
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('카메라 스캔 중 오류가 발생했습니다.');
      };
      
      // 완료 후 웹소켓 닫기
      ws.onclose = () => {
        console.log('카메라 스캔 완료, 웹소켓 연결 종료');
      };
    } catch (error) {
      console.error('Scan error:', error);
      alert('카메라 스캔 중 오류가 발생했습니다.');
    }
  };
  
  // 카메라 정보 업데이트
  const updateCamera = (cameraId: string, field: string, value: any) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId
        ? { ...camera, [field]: value }
        : camera
    ))
  }
  
  // 카메라 선택
  const selectCamera = (camera: Camera) => {
    setSelectedCamera(camera)
  }
  
  // 스크린샷 촬영 시뮬레이션
  const takeScreenshot = (cameraId: string) => {
    const camera = cameras.find(cam => cam.id === cameraId)
    if (!camera || !camera.isActive) return
    
    alert(`${camera.name} 카메라에서 스크린샷을 촬영했습니다.`)
  }
  
  // 웹소켓 연결 상태 관리
  const [webSocketConnections, setWebSocketConnections] = useState<Record<string, WebSocket>>({});
  // 캔버스 레퍼런스 추가
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // 컴포넌트 언마운트 시 웹소켓 연결 정리
  useEffect(() => {
    return () => {
      // 웹소켓 연결 정리
      Object.values(webSocketConnections).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
      
      // 비디오 스트림 정리
      Object.keys(videoRefs.current).forEach(id => {
        const videoElement = videoRefs.current[id];
        if (videoElement && videoElement.srcObject) {
          try {
            const stream = videoElement.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
          } catch (err) {
            console.warn('정리 중 오류:', err);
          }
        }
      });
      
      // 캔버스 레퍼런스 정리
      canvasRefs.current = {};
    };
  }, [webSocketConnections]);
  
  // 화면에 가짜 비디오 스트림 생성 (실제 카메라 연결 대신 사용)
  useEffect(() => {
    const activeIntervals: number[] = [];
    
    // 각 카메라에 대해 가상 스트림 생성
    cameras.forEach((cam) => {
      if (cam.isActive && videoRefs.current[cam.id]) {
        const videoElement = videoRefs.current[cam.id];
        if (!videoElement) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 애니메이션 프레임 카운터
        let frame = 0;
        
        // 애니메이션 간격 생성
        const intervalId = window.setInterval(() => {
          // 배경 그리기
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 상단 정보 표시줄
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, canvas.width, 60);
          
          // 카메라 정보 텍스트
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.fillText(`카메라: ${cam.name} (${cam.port})`, 20, 30);
          
          // 날짜/시간 표시
          const now = new Date();
          ctx.fillText(now.toLocaleTimeString(), 20, 50);
          
          // 움직이는 원 애니메이션
          const centerX = 320 + Math.sin(frame / 30) * 120;
          const centerY = 240 + Math.cos(frame / 20) * 80;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
          
          // 카메라별 색상
          ctx.fillStyle = cam.id === 'cam1' ? 'red' : 
                          cam.id === 'cam2' ? 'green' : 'blue';
          ctx.fill();
          
          // 그리드 라인 그리기
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          
          // 세로선
          for (let x = 0; x < canvas.width; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          
          // 가로선
          for (let y = 60; y < canvas.height; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
          
          // 중앙 표적
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(320, 240, 50, 0, Math.PI * 2);
          ctx.moveTo(320 - 60, 240);
          ctx.lineTo(320 + 60, 240);
          ctx.moveTo(320, 240 - 60);
          ctx.lineTo(320, 240 + 60);
          ctx.stroke();
          
          // 해상도 정보
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText(`${cam.resolution} @ ${cam.fps}fps`, 20, 100);
          
          // 스트리밍 상태 표시
          ctx.fillStyle = cam.isStreaming ? '#4CAF50' : '#FF9800';
          ctx.font = '14px Arial';
          ctx.fillText(
            cam.isStreaming ? '스트리밍 중' : '스트리밍 대기', 
            canvas.width - 150, 
            30
          );
          
          // 비디오 엘리먼트에 스트림 연결
          if (videoElement && (!videoElement.srcObject || !(videoElement.srcObject as MediaStream).active)) {
            try {
              // 이전 스트림 정리
              if (videoElement.srcObject) {
                const oldStream = videoElement.srcObject as MediaStream;
                oldStream.getTracks().forEach(track => track.stop());
              }
              
              // 새 스트림 생성 및 연결
              videoElement.srcObject = canvas.captureStream(30);
              videoElement.play().catch(err => {
                console.warn('비디오 재생 오류:', err);
              });
            } catch (err) {
              console.error('스트림 생성 오류:', err);
            }
          }
          
          frame++;
        }, 33); // ~30fps
        
        // 인터벌 ID 저장
        activeIntervals.push(intervalId);
      }
    });
    
    // 정리 함수
    return () => {
      // 모든 인터벌 정리
      activeIntervals.forEach(id => {
        clearInterval(id);
      });
    };
  }, [cameras]);
  
  // 페이지 로드 시 자동 카메라 스캔
  useEffect(() => {
    scanForCameras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 text-sm">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
          <p><strong>정보:</strong> 아직 구현중인 기능입니다.</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">카메라 관리</h1>
        <div className="flex gap-2">
          <Button onClick={scanForCameras}>
            카메라 스캔
          </Button>
          <Link href="/robocon/configs">
            <Button variant="outline">
              연결 설정으로 이동
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 카메라 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">연결된 카메라</h2>
          
          {cameras.map(camera => (
            <Card 
              key={camera.id} 
              className={`cursor-pointer ${selectedCamera?.id === camera.id ? 'border-blue-500 shadow-md' : ''}`}
              onClick={() => selectCamera(camera)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">{camera.name}</CardTitle>
                  <Switch 
                    checked={camera.isActive} 
                    onCheckedChange={() => toggleCamera(camera.id)} 
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <CardDescription>{camera.port} (인덱스: {camera.index})</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-500">
                  {camera.resolution} @ {camera.fps}fps
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation()
                    takeScreenshot(camera.id)
                  }}
                  disabled={!camera.isActive}
                >
                  스크린샷
                </Button>
                <Button 
                  size="sm" 
                  variant={camera.isStreaming ? "destructive" : "default"}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStreaming(camera.id)
                  }}
                  disabled={!camera.isActive}
                >
                  {camera.isStreaming ? '스트리밍 중지' : '스트리밍 시작'}
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {cameras.length === 0 && (
            <div className="p-8 text-center border rounded-lg bg-gray-50">
              <p>연결된 카메라가 없습니다.</p>
              <Button onClick={scanForCameras} className="mt-2">
                카메라 스캔
              </Button>
            </div>
          )}
        </div>
        
        {/* 카메라 미리보기 및 제어 */}
        <div className="col-span-2">
          {selectedCamera ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>카메라 미리보기: {selectedCamera.name}</CardTitle>
                  <CardDescription>
                    {selectedCamera.port} ({selectedCamera.resolution} @ {selectedCamera.fps}fps)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                    {selectedCamera.isActive ? (
                      selectedCamera.isStreaming ? (
                        <video 
                          ref={el => { videoRefs.current[selectedCamera.id] = el }}
                          className="w-full h-full object-cover"
                          autoPlay 
                          playsInline 
                          muted
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <p>카메라가 활성화되었지만 스트리밍이 시작되지 않았습니다.</p>
                        </div>
                      )
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <p>카메라가 비활성화 상태입니다.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={() => toggleCamera(selectedCamera.id)}
                    variant={selectedCamera.isActive ? "destructive" : "default"}
                  >
                    {selectedCamera.isActive ? '카메라 비활성화' : '카메라 활성화'}
                  </Button>
                  <Button 
                    onClick={() => toggleStreaming(selectedCamera.id)}
                    disabled={!selectedCamera.isActive}
                    variant={selectedCamera.isStreaming ? "outline" : "default"}
                  >
                    {selectedCamera.isStreaming ? '스트리밍 중지' : '스트리밍 시작'}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>카메라 설정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="camera-name">카메라 이름</Label>
                        <Input 
                          id="camera-name" 
                          value={selectedCamera.name} 
                          onChange={(e) => updateCamera(selectedCamera.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="camera-port">포트</Label>
                        <Input 
                          id="camera-port" 
                          value={selectedCamera.port} 
                          onChange={(e) => updateCamera(selectedCamera.id, 'port', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="camera-index">인덱스</Label>
                        <Input 
                          id="camera-index" 
                          type="number" 
                          value={selectedCamera.index} 
                          onChange={(e) => updateCamera(selectedCamera.id, 'index', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="camera-fps">FPS</Label>
                        <Input 
                          id="camera-fps" 
                          type="number" 
                          value={selectedCamera.fps} 
                          onChange={(e) => updateCamera(selectedCamera.id, 'fps', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="camera-resolution">해상도</Label>
                      <Select 
                        value={selectedCamera.resolution}
                        onValueChange={(value) => updateCamera(selectedCamera.id, 'resolution', value)}
                      >
                        <SelectTrigger id="camera-resolution">
                          <SelectValue placeholder="해상도 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="320x240">320x240</SelectItem>
                          <SelectItem value="640x480">640x480</SelectItem>
                          <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                          <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">설정 저장</Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-gray-50">
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">카메라를 선택하세요</h3>
                <p className="text-gray-500">왼쪽 메뉴에서 카메라를 선택하여 미리보기와 설정을 확인할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
