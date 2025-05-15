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
  const toggleStreaming = (cameraId: string) => {
    // 실제로 스트리밍을 처리할 코드가 여기에 들어가야 함
    // 여기서는 상태만 변경
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId
        ? { ...camera, isStreaming: !camera.isStreaming }
        : camera
    ))
  }
  
  // 카메라 스캔 (실제로는 백엔드 API나 시스템 명령어를 호출해야 함)
  const scanForCameras = () => {
    // 시뮬레이션 목적으로 추가 카메라를 발견한 것처럼 동작
    const newCamera = { 
      id: `cam${cameras.length + 1}`, 
      name: `newCamera${cameras.length + 1}`, 
      port: `/dev/video${cameras.length * 2}`, 
      index: cameras.length * 2, 
      resolution: "640x480", 
      fps: 30, 
      isActive: false, 
      isStreaming: false 
    }
    
    setCameras(prev => [...prev, newCamera])
  }
  
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
  
  // 화면에 가짜 비디오 스트림 생성 (실제 카메라 연결 대신 사용)
  useEffect(() => {
    cameras.forEach(camera => {
      if (camera.isActive && camera.isStreaming && videoRefs.current[camera.id]) {
        const canvas = document.createElement('canvas')
        canvas.width = 640
        canvas.height = 480
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          // 간단한 애니메이션을 위한 타이머
          let frame = 0
          const interval = setInterval(() => {
            // 검은 배경
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // 카메라 ID와 이름 표시
            ctx.font = '20px Arial'
            ctx.fillStyle = 'white'
            ctx.fillText(`카메라: ${camera.name} (${camera.port})`, 20, 40)
            
            // 시간 표시
            const now = new Date()
            ctx.fillText(now.toLocaleTimeString(), 20, 70)
            
            // 모션 시뮬레이션
            const circleX = 320 + Math.sin(frame / 30) * 100
            const circleY = 240 + Math.cos(frame / 15) * 50
            
            ctx.beginPath()
            ctx.arc(circleX, circleY, 30, 0, Math.PI * 2)
            
            // 카메라마다 다른 색상
            if (camera.id === 'cam1') ctx.fillStyle = 'red'
            else if (camera.id === 'cam2') ctx.fillStyle = 'green'
            else ctx.fillStyle = 'blue'
            
            ctx.fill()
            
            // 캔버스를 비디오 스트림으로 변환
            if (videoRefs.current[camera.id]) {
              const videoElement = videoRefs.current[camera.id]
              if (videoElement && videoElement.srcObject === null) {
                // @ts-ignore: 가짜 스트림 생성
                videoElement.srcObject = canvas.captureStream(30)
                videoElement.play()
              }
            }
            
            frame++
          }, 33) // 약 30fps
          
          return () => {
            clearInterval(interval)
            if (videoRefs.current[camera.id]) {
              const videoElement = videoRefs.current[camera.id]
              if (videoElement && videoElement.srcObject) {
                // @ts-ignore: 스트림 정리
                const tracks = videoElement.srcObject.getTracks()
                tracks.forEach((track: any) => track.stop())
                videoElement.srcObject = null
              }
            }
          }
        }
      }
    })
  }, [cameras])
  
  return (
    <div className="container mx-auto py-6">
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
