"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Terminal } from "lucide-react"
import { Terminal as TerminalComponent } from "@/components/ui/terminal"
import Link from "next/link"
import { useLeRobotClient } from "@/hooks/useLeRobotClient"

// 로봇 타입 인터페이스
interface RobotConfig {
  type: string
  id: string
  port: string
  status: "connected" | "disconnected" | "error"
  lastSeen?: string
  motors?: {
    name: string
    id: number
    model: string
    position?: number
    temperature?: number
  }[]
}

// 카메라 타입 인터페이스
interface CameraConfig {
  name: string
  port: string
  index: number
  status: "connected" | "disconnected" | "error"
  resolution: string
  fps: number
}

export default function ConnectPage() {
  // 웹소켓 클라이언트 연결
  const { isConnected, isLoading, error, sendMessage } = useLeRobotClient();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState("setup")
  const [isEnvironmentReady, setIsEnvironmentReady] = useState(false)
  const [installOutput, setInstallOutput] = useState<string[]>([])
  const [robotConfigs, setRobotConfigs] = useState<RobotConfig[]>([
    { 
      type: "so100", 
      id: "main", 
      port: "/dev/ttyACM0", 
      status: "disconnected",
      motors: [
        { name: "shoulder_pan", id: 1, model: "sts3215" },
        { name: "shoulder_lift", id: 2, model: "sts3215" },
        { name: "elbow_flex", id: 3, model: "sts3215" },
        { name: "wrist_flex", id: 4, model: "sts3215" },
        { name: "wrist_roll", id: 5, model: "sts3215" },
        { name: "gripper", id: 6, model: "sts3215" },
      ]
    }
  ])
  const [cameras, setCameras] = useState<CameraConfig[]>([
    { name: "overviewCamera", port: "/dev/video0", index: 0, status: "disconnected", resolution: "640x480", fps: 30 },
    { name: "leftCamera", port: "/dev/video2", index: 2, status: "disconnected", resolution: "640x480", fps: 30 },
    { name: "rightCamera", port: "/dev/video4", index: 4, status: "disconnected", resolution: "640x480", fps: 30 },
  ])
  const [configText, setConfigText] = useState("")
  const [terminalCommands, setTerminalCommands] = useState<string[]>([])
  const [portScanOutput, setPortScanOutput] = useState<string[]>([])
  const [isScanningPorts, setIsScanningPorts] = useState(false)
  
  // 환경 설정 스크립트
  useEffect(() => {
    // 초기 설정 스크립트 생성
    setConfigText(`# SO-100 로봇 연결을 위한 설정 파일
@RobotConfig.register_subclass("so100")
@dataclass
class So100RobotConfig(ManipulatorRobotConfig):
    calibration_dir: str = ".cache/calibration/so100"
    max_relative_target: int | None = 5

    leader_arms: dict[str, MotorsBusConfig] = field(
        default_factory=lambda: {
            "main": FeetechMotorsBusConfig(
                port="${robotConfigs[0].port}",
                motors={
                    # name: (index, model)
                    "shoulder_pan": [1, "sts3215"],
                    "shoulder_lift": [2, "sts3215"],
                    "elbow_flex": [3, "sts3215"],
                    "wrist_flex": [4, "sts3215"],
                    "wrist_roll": [5, "sts3215"],
                    "gripper": [6, "sts3215"],
                },
            ),
        }
    )

    cameras: dict[str, CameraConfig] = field(
        default_factory=lambda: {
            "${cameras[0].name}": OpenCVCameraConfig(
                camera_index=${cameras[0].index},
                fps=${cameras[0].fps},
                width=640,
                height=480,
            ),
            "${cameras[1].name}": OpenCVCameraConfig(
                camera_index=${cameras[1].index},
                fps=${cameras[1].fps},
                width=640,
                height=480,
            ),
            "${cameras[2].name}": OpenCVCameraConfig(
                camera_index=${cameras[2].index},
                fps=${cameras[2].fps},
                width=640,
                height=480,
            ),
        }
    )

    mock: bool = False`)
  }, [robotConfigs, cameras])
  
  // 설치 명령어 실행
  const runInstallation = () => {
    setInstallOutput([])
    setTerminalCommands([
      "# LeRobot 설치를 위한 명령어",
      "# 1. Miniconda 설치",
      "wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh",
      "bash miniconda.sh -b -p $HOME/miniconda",
      "export PATH=\"$HOME/miniconda/bin:$PATH\"",
      "# 2. 환경 생성",
      "conda create -n lerobot python=3.10 -y",
      "conda activate lerobot",
      "# 3. LeRobot 설치",
      "git clone https://github.com/huggingface/lerobot.git",
      "cd lerobot",
      "pip install -e .",
      "# 4. 필요한 추가 패키지 설치",
      "pip install opencv-python pyserial"
    ])
    
    // 설치 과정 시뮬레이션
    // 실제 구현에서는 웹소켓 서버를 통해 실제 설치 명령을 실행하고 결과를 받을 수 있음
    const installSteps = [
      "Miniconda 다운로드 중...",
      "Miniconda 설치 중...",
      "환경 변수 설정 중...",
      "conda 환경 생성 중...",
      "lerobot 환경 활성화...",
      "LeRobot 저장소 복제 중...",
      "LeRobot 디렉토리로 이동...",
      "LeRobot 패키지 설치 중...",
      "추가 패키지 설치 중...",
      "설치가 완료되었습니다! 이제 로봇과 카메라를 연결하세요."
    ]
    
    let i = 0
    const interval = setInterval(() => {
      if (i < installSteps.length) {
        setInstallOutput(prev => [...prev, installSteps[i]])
        i++
      } else {
        clearInterval(interval)
        setIsEnvironmentReady(true)
      }
    }, 1500)
  }
  
  // 로봇 포트 스캔 기능
  const scanPorts = async () => {
    if (!isConnected) {
      setPortScanOutput(["서버에 연결되어 있지 않습니다. 서버가 실행 중인지 확인하세요."]);
      return;
    }
    
    setIsScanningPorts(true);
    setPortScanOutput(["포트 스캔 중..."]);
    
    try {
      // 웹소켓을 통해 포트 스캔 요청
      const result = await sendMessage('scan_ports');
      
      if (result && result.ports) {
        const portsList = result.ports.map((port: any) => 
          `${port.port} - ${port.description || '알 수 없는 장치'}`
        );
        
        setPortScanOutput([
          "사용 가능한 포트 목록:",
          ...portsList,
          "",
          "로봇 포트를 찾으려면:",
          "1. 로봇의 USB 케이블을 분리하세요",
          "2. 아래 '포트 변화 감지' 버튼을 클릭하세요",
          "3. USB 케이블을 다시 연결하세요"
        ]);
      } else {
        setPortScanOutput(["포트를 찾을 수 없습니다."]);
      }
    } catch (err) {
      console.error('포트 스캔 오류:', err);
      setPortScanOutput(["포트 스캔 중 오류가 발생했습니다."]);
    } finally {
      setIsScanningPorts(false);
    }
  }
  
  // 포트 변화 감지
  const detectPortChange = async () => {
    if (!isConnected) {
      setPortScanOutput(prev => [...prev, "서버에 연결되어 있지 않습니다."]);
      return;
    }
    
    setPortScanOutput(prev => [...prev, "포트 변화 감지 중..."]);
    
    try {
      // 5초 대기 후 포트 변화 확인
      setPortScanOutput(prev => [...prev, "USB 장치를 연결하세요. 5초 후에 새 장치를 확인합니다..."]);
      
      // 웹소켓을 통해 포트 변화 감지 요청
      const result = await sendMessage('detect_port_change');
      
      if (result && result.detected) {
        setPortScanOutput(prev => [...prev, `새 포트가 감지되었습니다: ${result.new_port}`]);
        
        // 감지된 포트가 있으면 로봇 설정 업데이트
        if (result.new_port) {
          setRobotConfigs(prev => prev.map((robot, idx) => 
            idx === 0 ? { ...robot, port: result.new_port } : robot
          ));
        }
      } else {
        setPortScanOutput(prev => [...prev, "새 포트가 감지되지 않았습니다."]);
      }
    } catch (err) {
      console.error('포트 변화 감지 오류:', err);
      setPortScanOutput(prev => [...prev, "포트 변화 감지 중 오류가 발생했습니다."]);
    }
  }
  
  // 로봇 연결 테스트
  const testRobotConnection = async (robotIndex: number) => {
    if (!isConnected) {
      alert("서버에 연결되어 있지 않습니다.");
      return;
    }
    
    const robot = robotConfigs[robotIndex];
    
    try {
      // 웹소켓을 통해 로봇 연결 테스트 요청
      const result = await sendMessage('test_robot_connection', { port: robot.port });
      
      if (result && result.success) {
        // 연결 성공
        setRobotConfigs(prev => prev.map((r, idx) => 
          idx === robotIndex 
            ? { 
                ...r, 
                status: "connected",
                lastSeen: new Date().toLocaleString(),
                motors: result.robot_info.motors || r.motors
              } 
            : r
        ));
        alert(`${robot.port}에 연결된 로봇 연결에 성공했습니다.`);
      } else {
        // 연결 실패
        setRobotConfigs(prev => prev.map((r, idx) => 
          idx === robotIndex ? { ...r, status: "error" } : r
        ));
        alert(`로봇 연결 실패: ${result ? result.message : '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('로봇 연결 테스트 오류:', err);
      setRobotConfigs(prev => prev.map((r, idx) => 
        idx === robotIndex ? { ...r, status: "error" } : r
      ));
      alert('로봇 연결 테스트 중 오류가 발생했습니다.');
    }
  }
  
  // 카메라 연결 테스트
  const testCameraConnection = async (cameraIndex: number) => {
    if (!isConnected) {
      alert("서버에 연결되어 있지 않습니다.");
      return;
    }
    
    const camera = cameras[cameraIndex];
    
    try {
      // 웹소켓을 통해 카메라 연결 테스트 요청
      const result = await sendMessage('test_camera_connection', { index: camera.index });
      
      if (result && result.success) {
        // 연결 성공
        setCameras(prev => prev.map((c, idx) => 
          idx === cameraIndex 
            ? { 
                ...c, 
                status: "connected",
                resolution: result.camera_info.resolution || c.resolution,
                fps: result.camera_info.fps || c.fps
              } 
            : c
        ));
        alert(`카메라 ${camera.index}(${camera.name}) 연결에 성공했습니다.`);
      } else {
        // 연결 실패
        setCameras(prev => prev.map((c, idx) => 
          idx === cameraIndex ? { ...c, status: "error" } : c
        ));
        alert(`카메라 연결 실패: ${result ? result.message : '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('카메라 연결 테스트 오류:', err);
      setCameras(prev => prev.map((c, idx) => 
        idx === cameraIndex ? { ...c, status: "error" } : c
      ));
      alert('카메라 연결 테스트 중 오류가 발생했습니다.');
    }
  }
  
  // 카메라 이름 변경
  const updateCameraName = (index: number, newName: string) => {
    setCameras(prev => prev.map((camera, idx) => 
      idx === index ? { ...camera, name: newName } : camera
    ))
  }
  
  // 새 로봇 설정 추가
  const addNewRobot = () => {
    const newId = robotConfigs.length + 1
    setRobotConfigs(prev => [
      ...prev,
      { 
        type: "so100", 
        id: `robot${newId}`, 
        port: `/dev/ttyACM${newId}`, 
        status: "disconnected",
        motors: [
          { name: "shoulder_pan", id: 1, model: "sts3215" },
          { name: "shoulder_lift", id: 2, model: "sts3215" },
          { name: "elbow_flex", id: 3, model: "sts3215" },
          { name: "wrist_flex", id: 4, model: "sts3215" },
          { name: "wrist_roll", id: 5, model: "sts3215" },
          { name: "gripper", id: 6, model: "sts3215" },
        ]
      }
    ])
  }
  
  // 로봇 설정 업데이트
  const updateRobotConfig = async () => {
    if (!isConnected) {
      alert("서버에 연결되어 있지 않습니다.");
      return;
    }
    
    try {
      // 로봇 및 카메라 설정 구성
      const config = {
        type: "so100",
        calibration_dir: ".cache/calibration/so100",
        max_relative_target: 5,
        leader_arms: robotConfigs.reduce((acc, robot) => {
          acc[robot.id] = {
            port: robot.port,
            motors: robot.motors?.reduce((motorAcc, motor) => {
              motorAcc[motor.name] = { id: motor.id, model: motor.model };
              return motorAcc;
            }, {} as any)
          };
          return acc;
        }, {} as any),
        cameras: cameras.reduce((acc, camera) => {
          acc[camera.name] = {
            camera_index: camera.index,
            fps: camera.fps,
            width: parseInt(camera.resolution.split('x')[0]),
            height: parseInt(camera.resolution.split('x')[1])
          };
          return acc;
        }, {} as any)
      };
      
      // 웹소켓을 통해 설정 업데이트 요청
      const result = await sendMessage('update_robot_config', { config });
      
      if (result && result.success) {
        alert("설정이 성공적으로 저장되었습니다.");
      } else {
        alert(`설정 저장 실패: ${result ? result.message : '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('설정 업데이트 오류:', err);
      alert('설정 업데이트 중 오류가 발생했습니다.');
    }
  }
  
  // 서버 연결 상태 표시
  const getConnectionStatusText = () => {
    if (isLoading) return "서버에 연결 중...";
    if (error) return `연결 오류: ${error}`;
    if (isConnected) return "서버에 연결됨";
    return "서버에 연결되지 않음";
  }
  
  // 서버 연결 상태 스타일
  const getConnectionStatusStyle = () => {
    if (isLoading) return "text-yellow-500";
    if (error) return "text-red-500";
    if (isConnected) return "text-green-500";
    return "text-red-500";
  }

  // 여기서부터는 기존 UI 렌더링 코드를 유지
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">로봇 및 카메라 설정</h1>
          <p className={`text-sm ${getConnectionStatusStyle()}`}>
            {getConnectionStatusText()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/robocon">
            <Button variant="outline">
              메인 메뉴
            </Button>
          </Link>
          <Link href="/robocon/train">
            <Button variant="outline">
              학습으로 이동
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">초기 설정</TabsTrigger>
          <TabsTrigger value="robot">로봇 설정</TabsTrigger>
          <TabsTrigger value="camera">카메라 설정</TabsTrigger>
          <TabsTrigger value="config">설정 파일</TabsTrigger>
          <TabsTrigger value="port">포트 스캔</TabsTrigger>
        </TabsList>
        
        {/* 초기 설정 탭 */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LeRobot 환경 설정</CardTitle>
              <CardDescription>
                Ubuntu 22.04 환경에서 LeRobot을 사용하기 위한 초기 설정입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">설치 단계</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Miniconda 설치</li>
                    <li>Python 가상환경 생성</li>
                    <li>LeRobot 및 필요한 패키지 설치</li>
                    <li>시리얼 포트 및 카메라 권한 설정</li>
                  </ol>
                </div>
                
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>터미널 명령어</AlertTitle>
                  <AlertDescription>
                    아래 명령어를 실행하여 필요한 패키지와 환경을 설정하세요.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-black text-white p-4 rounded-md font-mono text-sm">
                  {terminalCommands.map((cmd, i) => (
                    <div key={i} className={cmd.startsWith("#") ? "text-green-400" : ""}>
                      {cmd}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={runInstallation} disabled={installOutput.length > 0}>
                    {installOutput.length > 0 ? "설치 중..." : "설치 시작"}
                  </Button>
                </div>
                
                {installOutput.length > 0 && (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">설치 출력:</h4>
                    <div className="space-y-1 text-sm">
                      {installOutput.map((line, i) => (
                        <div key={i} className="text-gray-800">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 로봇 설정 탭 */}
        <TabsContent value="robot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>로봇 연결 설정</CardTitle>
              <CardDescription>
                로봇의 포트 설정과 연결 상태를 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {robotConfigs.map((robot, idx) => (
                  <div key={idx} className="space-y-3 pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {robot.type.toUpperCase()} 로봇 {robot.id}
                        <span className={`ml-2 text-sm ${
                          robot.status === 'connected' ? 'text-green-500' :
                          robot.status === 'error' ? 'text-red-500' :
                          'text-gray-500'
                        }`}>
                          ({robot.status})
                        </span>
                      </h3>
                      
                      <Button 
                        onClick={() => testRobotConnection(idx)}
                        variant={robot.status === 'connected' ? "outline" : "default"}
                      >
                        {robot.status === 'connected' ? '연결됨' : '연결 테스트'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`port-${idx}`}>포트</Label>
                        <Input 
                          id={`port-${idx}`} 
                          value={robot.port}
                          onChange={(e) => {
                            setRobotConfigs(prev => prev.map((r, i) => 
                              i === idx ? { ...r, port: e.target.value } : r
                            ))
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>마지막 연결</Label>
                        <Input value={robot.lastSeen || 'N/A'} readOnly />
                      </div>
                    </div>
                    
                    {robot.status === 'connected' && robot.motors && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">모터 정보</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>이름</TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>모델</TableHead>
                              <TableHead>온도</TableHead>
                              <TableHead>위치</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {robot.motors.map((motor, motorIdx) => (
                              <TableRow key={motorIdx}>
                                <TableCell>{motor.name}</TableCell>
                                <TableCell>{motor.id}</TableCell>
                                <TableCell>{motor.model}</TableCell>
                                <TableCell>{motor.temperature || 'N/A'}</TableCell>
                                <TableCell>{motor.position !== undefined ? motor.position : 'N/A'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between pt-4">
                  <Button onClick={addNewRobot} variant="outline">로봇 추가</Button>
                  <Button onClick={updateRobotConfig}>저장</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 카메라 설정 탭 */}
        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>카메라 설정</CardTitle>
              <CardDescription>
                로봇 제어에 사용될 카메라를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cameras.map((camera, idx) => (
                  <div key={idx} className="space-y-3 pb-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <Input 
                          value={camera.name}
                          onChange={(e) => updateCameraName(idx, e.target.value)}
                          className="font-medium text-lg border-none p-0 h-auto focus-visible:ring-0"
                        />
                        <span className={`text-sm ${
                          camera.status === 'connected' ? 'text-green-500' :
                          camera.status === 'error' ? 'text-red-500' :
                          'text-gray-500'
                        }`}>
                          ({camera.status})
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => testCameraConnection(idx)}
                        variant={camera.status === 'connected' ? "outline" : "default"}
                      >
                        {camera.status === 'connected' ? '연결됨' : '연결 테스트'}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`camera-port-${idx}`}>포트</Label>
                        <Input 
                          id={`camera-port-${idx}`} 
                          value={camera.port}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`camera-index-${idx}`}>인덱스</Label>
                        <Input 
                          id={`camera-index-${idx}`} 
                          value={camera.index}
                          onChange={(e) => {
                            setCameras(prev => prev.map((c, i) => 
                              i === idx ? { ...c, index: Number(e.target.value) } : c
                            ))
                          }}
                          type="number"
                          min="0"
                          step="2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`camera-resolution-${idx}`}>해상도</Label>
                        <Input 
                          id={`camera-resolution-${idx}`} 
                          value={camera.resolution}
                          onChange={(e) => {
                            setCameras(prev => prev.map((c, i) => 
                              i === idx ? { ...c, resolution: e.target.value } : c
                            ))
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button onClick={updateRobotConfig}>저장</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 설정 파일 탭 */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>설정 파일</CardTitle>
              <CardDescription>
                자동으로 생성된 설정 파일입니다. 필요한 경우 직접 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={configText}
                onChange={(e) => setConfigText(e.target.value)}
                className="font-mono text-sm h-96 resize-none"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                // 설정 초기화
                updateRobotConfig();
              }}>설정 초기화</Button>
              <Button onClick={updateRobotConfig}>저장</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* 포트 스캔 탭 */}
        <TabsContent value="port" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>포트 스캔</CardTitle>
              <CardDescription>
                연결된 USB 장치 및 시리얼 포트를 스캔합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={scanPorts} 
                  disabled={isScanningPorts || !isConnected}
                >
                  포트 스캔
                </Button>
                <Button 
                  onClick={detectPortChange} 
                  variant="outline"
                  disabled={isScanningPorts || !isConnected}
                >
                  포트 변화 감지
                </Button>
              </div>
              
              <TerminalComponent className="min-h-80">
                {portScanOutput.map((line, i) => (
                  <div key={i} className="mb-1">{line}</div>
                ))}
              </TerminalComponent>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
