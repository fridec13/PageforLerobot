"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlarmClock, Database, Play, Save, Settings, Volume2 } from "lucide-react"
import Link from "next/link"
import { useLeRobotClient } from "@/hooks/useLeRobotClient"

interface ModelConfig {
  name: string
  repo: string
  description: string
}

interface TrainingConfig {
  modelRepo: string
  modelName: string
  duration: number
  episodes: number
  robotType: string
  recordData: boolean
  useCamera: boolean
  volume: number
  countdownTime: number
  customCommands: string
}

export default function TrainingPage() {
  // 상태 관리
  const [isRunning, setIsRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([
    { name: "so100-control", repo: "huggingface/so100-control", description: "SO-100 로봇용 기본 제어 모델" },
    { name: "so101-grasp", repo: "huggingface/so101-grasp", description: "SO-101 로봇용 물체 인식 및 그래스핑 모델" },
    { name: "generic-follow", repo: "huggingface/generic-follow", description: "다목적 물체 추적 모델" }
  ])
  
  // 학습 설정
  const [config, setConfig] = useState<TrainingConfig>({
    modelRepo: "huggingface/so100-control",
    modelName: "so100-control",
    duration: 300, // 5분
    episodes: 10,
    robotType: "so100",
    recordData: true,
    useCamera: true,
    volume: 70,
    countdownTime: 5,
    customCommands: ""
  })
  
  // 오디오 참조
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null)
  const startAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // 로그 상태
  const [logs, setLogs] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)
  
  // 로그 추가 함수
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }
  
  // 로그가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])
  
  // 오디오 요소 생성
  useEffect(() => {
    countdownAudioRef.current = new Audio("/sounds/beep.mp3")
    startAudioRef.current = new Audio("/sounds/start.mp3")
    
    return () => {
      countdownAudioRef.current = null
      startAudioRef.current = null
    }
  }, [])
  
  // 설정 업데이트 핸들러
  const updateConfig = (key: keyof TrainingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }
  
  // 모델 선택 핸들러
  const selectModel = (repo: string) => {
    const model = availableModels.find(m => m.repo === repo)
    if (model) {
      updateConfig('modelRepo', model.repo)
      updateConfig('modelName', model.name)
    }
  }
  
  // 카운트다운 및 학습 시작
  const startTraining = () => {
    if (isRunning) return
    
    addLog(`학습 준비 중... (카운트다운: ${config.countdownTime}초)`)
    
    // 카운트다운 시작
    setCountdown(config.countdownTime)
    setIsRunning(true)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(countdownInterval)
          return 0
        }
        
        // 소리 재생
        if (countdownAudioRef.current && prev <= 3) {
          countdownAudioRef.current.volume = config.volume / 100
          countdownAudioRef.current.play()
        }
        
        return prev - 1
      })
    }, 1000)
    
    // 카운트다운 완료 후 학습 시작
    setTimeout(() => {
      if (startAudioRef.current) {
        startAudioRef.current.volume = config.volume / 100
        startAudioRef.current.play()
      }
      
      addLog("학습이 시작되었습니다!")
      addLog(`모델: ${config.modelName} (${config.modelRepo})`)
      addLog(`에피소드: ${config.episodes}, 시간: ${config.duration}초`)
      addLog(`로봇 타입: ${config.robotType}`)
      
      // 실제 학습 명령어 실행 (현재는 시뮬레이션)
      const command = generateTrainingCommand()
      addLog(`실행 명령어: ${command}`)
      
      // 학습 진행상황 시뮬레이션
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 1
        
        if (progress % 10 === 0) {
          addLog(`학습 진행 중... (${Math.min(progress, config.episodes)}/${config.episodes} 에피소드)`)
        }
        
        if (progress >= config.episodes) {
          clearInterval(progressInterval)
          setIsRunning(false)
          addLog("학습이 완료되었습니다!")
        }
      }, config.duration * 1000 / config.episodes)
      
    }, config.countdownTime * 1000)
  }
  
  // 학습 중지
  const stopTraining = () => {
    if (!isRunning) return
    
    addLog("학습이 중단되었습니다.")
    setIsRunning(false)
    setCountdown(null)
  }
  
  // 학습 명령어 생성
  const generateTrainingCommand = (): string => {
    return `python -m lerobot.train \
--robot-type=${config.robotType} \
--model-repo=${config.modelRepo} \
--episodes=${config.episodes} \
--duration=${config.duration} \
--record-data=${config.recordData ? "True" : "False"} \
--use-camera=${config.useCamera ? "True" : "False"} ${config.customCommands}`
  }
  
  // 설정 저장
  const saveConfig = () => {
    addLog("학습 설정이 저장되었습니다.")
    
    // 실제로는 설정을 파일로 저장하거나 API를 통해 서버에 전송
    const configJSON = JSON.stringify(config, null, 2)
    console.log("저장된 설정:", configJSON)
    
    // 다운로드 파일로 저장
    const blob = new Blob([configJSON], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'training_config.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">로봇 학습</h1>
        <div className="flex gap-2">
          <Button onClick={saveConfig} variant="outline" className="flex items-center gap-1">
            <Save className="w-4 h-4" />
            설정 저장
          </Button>
          <Link href="/robocon/configs">
            <Button variant="outline">
              연결 설정으로 이동
            </Button>
          </Link>
        </div>
      </div>

      {/* 학습 설정 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>모델 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>모델 저장소</Label>
              <Select value={config.modelRepo} onValueChange={selectModel}>
                <SelectTrigger>
                  <SelectValue placeholder="모델을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model.repo} value={model.repo}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableModels.find(m => m.repo === config.modelRepo)?.description && (
                <p className="text-sm text-gray-500">
                  {availableModels.find(m => m.repo === config.modelRepo)?.description}
                </p>
              )}
            </div>
            
            <div>
              <Label>모델 이름</Label>
              <Input 
                value={config.modelName} 
                onChange={(e) => updateConfig('modelName', e.target.value)}
              />
            </div>
            
            <div>
              <Label>로봇 타입</Label>
              <Select 
                value={config.robotType} 
                onValueChange={(value) => updateConfig('robotType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="so100">SO-100</SelectItem>
                  <SelectItem value="so101">SO-101</SelectItem>
                  <SelectItem value="koch">Koch</SelectItem>
                  <SelectItem value="moss">Moss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>학습 매개변수</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between">
                <Label>학습 시간 (초)</Label>
                <span className="text-sm">{config.duration}초</span>
              </div>
              <Slider
                value={[config.duration]}
                min={60}
                max={1800}
                step={30}
                onValueChange={(value) => updateConfig('duration', value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label>에피소드</Label>
                <span className="text-sm">{config.episodes}회</span>
              </div>
              <Slider
                value={[config.episodes]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => updateConfig('episodes', value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>데이터 기록</Label>
              <Switch
                checked={config.recordData}
                onCheckedChange={(checked) => updateConfig('recordData', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>카메라 사용</Label>
              <Switch
                checked={config.useCamera}
                onCheckedChange={(checked) => updateConfig('useCamera', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  소리 볼륨
                </Label>
                <span className="text-sm">{config.volume}%</span>
              </div>
              <Slider
                value={[config.volume]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => updateConfig('volume', value[0])}
                className="mt-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <AlarmClock className="w-4 h-4" />
                  카운트다운 시간
                </Label>
                <span className="text-sm">{config.countdownTime}초</span>
              </div>
              <Slider
                value={[config.countdownTime]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => updateConfig('countdownTime', value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="pt-2">
              <Button
                onClick={() => {
                  if (countdownAudioRef.current) {
                    countdownAudioRef.current.volume = config.volume / 100
                    countdownAudioRef.current.play()
                  }
                }}
                variant="outline"
                size="sm"
              >
                카운트다운 소리 테스트
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>고급 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>추가 명령어</Label>
              <Textarea
                placeholder="추가 파라미터를 입력하세요 (--param=value 형식)"
                value={config.customCommands}
                onChange={(e) => updateConfig('customCommands', e.target.value)}
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <Label>생성된 명령어</Label>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm overflow-x-auto">
                {generateTrainingCommand()}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={startTraining}
              disabled={isRunning}
            >
              <Play className="w-4 h-4 mr-2" />
              학습 시작
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 학습 콘솔 영역 */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              학습 로그
            </CardTitle>
            {isRunning && countdown !== null && countdown > 0 && (
              <div className="text-lg font-bold bg-orange-100 text-orange-800 px-4 py-1 rounded-full">
                카운트다운: {countdown}
              </div>
            )}
            {isRunning && (countdown === 0 || countdown === null) && (
              <div className="text-lg font-bold bg-green-100 text-green-800 px-4 py-1 rounded-full animate-pulse">
                학습 진행 중...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] border rounded-md p-4 overflow-y-auto font-mono text-sm bg-gray-50">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                학습을 시작하면 로그가 여기에 표시됩니다.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="destructive" 
            onClick={stopTraining}
            disabled={!isRunning}
          >
            학습 중지
          </Button>
          <Button 
            onClick={startTraining} 
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            학습 시작
          </Button>
        </CardFooter>
      </Card>
      
      {/* 사운드 레이어 */}
      <div className="hidden">
        <audio src="/sounds/beep.mp3" preload="auto" ref={countdownAudioRef} />
        <audio src="/sounds/start.mp3" preload="auto" ref={startAudioRef} />
      </div>
    </div>
  )
}
