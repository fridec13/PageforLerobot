"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export default function OffsetSimPage() {
  // 로봇 상태 관리
  const [robots, setRobots] = useState([
    { id: 1, color: "orange", name: "로봇 1" }
  ]);

  // 로봇 추가 함수
  const addRobot = () => {
    if (robots.length >= 4) return; // 최대 4개까지만 추가 가능
    
    const colors = ["orange", "blue", "green", "red"];
    const newId = robots.length + 1;
    
    setRobots([
      ...robots, 
      { 
        id: newId, 
        color: colors[newId - 1], 
        name: `로봇 ${newId}` 
      }
    ]);
  };

  // 로봇 제거 함수
  const removeRobot = (id: number) => {
    if (robots.length <= 1) return; // 최소 1개는 유지
    setRobots(robots.filter(robot => robot.id !== id));
  };

  // 로봇 배치를 위한 그리드 클래스 계산
  const getGridClass = () => {
    switch (robots.length) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 grid-rows-2";
      case 4: return "grid-cols-2 grid-rows-2";
      default: return "grid-cols-1";
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Offset 시뮬레이션</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={addRobot} 
            disabled={robots.length >= 4}
            className="flex items-center"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            로봇 추가
          </Button>
          <Button className="bg-blue-600">설정 저장</Button>
          <Button variant="outline">초기화</Button>
        </div>
      </div>

      <div className={`grid ${getGridClass()} gap-4 h-[calc(100vh-200px)]`}>
        {robots.map((robot) => (
          <div key={robot.id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
            {/* 3D 모델 영역 (왼쪽) */}
            <div className="flex-1 flex flex-col">
              <div className="p-2 bg-gray-100 border-b font-medium flex justify-between items-center">
                <span>{robot.name}</span>
                {robots.length > 1 && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0" 
                    onClick={() => removeRobot(robot.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              <div className="flex-1 relative">
                <Canvas 
                  key={`${robot.id}-${robots.length}`}
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                >
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                  <pointLight position={[-10, -10, -10]} />
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={robot.color} />
                  </mesh>
                  <OrbitControls />
                  <Environment preset="studio" />
                </Canvas>
              </div>
            </div>
            
            {/* 관절 제어 영역 (오른쪽) */}
            <div className="w-48 p-3 border-l bg-gray-50 overflow-y-auto">
              <div className="mb-3">
                <h3 className="text-sm font-medium mb-2">{robot.name} 관절 제어</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">관절 1</label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">관절 2</label>
                    <Slider defaultValue={[30]} max={100} step={1} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">관절 3</label>
                    <Slider defaultValue={[70]} max={100} step={1} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">관절 4</label>
                    <Slider defaultValue={[20]} max={100} step={1} />
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <h3 className="text-xs font-medium mb-2">Offset 값</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs mb-1">X Offset</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" defaultValue="0" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Y Offset</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" defaultValue="0" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Z Offset</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" defaultValue="0" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">R Offset</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" defaultValue="0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-start">
        <Link href="/robocon" className="text-blue-600 hover:underline">
          ← 로보콘 메뉴로 돌아가기
        </Link>
      </div>
    </div>
  )
} 