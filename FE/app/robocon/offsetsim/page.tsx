"use client"

import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"

export default function OffsetSimPage() {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Offset 시뮬레이션</h1>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">설정 저장</button>
          <button className="bg-gray-200 px-3 py-1 rounded text-sm">초기화</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-2 bg-gray-100 border-b font-medium">로봇 1</div>
          <div className="h-[calc(100%-40px)]">
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
              </mesh>
              <OrbitControls />
              <Environment preset="studio" />
            </Canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-2 bg-gray-100 border-b font-medium">로봇 2</div>
          <div className="h-[calc(100%-40px)]">
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="blue" />
              </mesh>
              <OrbitControls />
              <Environment preset="studio" />
            </Canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-2 bg-gray-100 border-b font-medium">로봇 3</div>
          <div className="h-[calc(100%-40px)]">
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="green" />
              </mesh>
              <OrbitControls />
              <Environment preset="studio" />
            </Canvas>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-2 bg-gray-100 border-b font-medium">로봇 4</div>
          <div className="h-[calc(100%-40px)]">
            <Canvas>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
              </mesh>
              <OrbitControls />
              <Environment preset="studio" />
            </Canvas>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">관절 제어</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">관절 1</label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">관절 2</label>
            <Slider defaultValue={[30]} max={100} step={1} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">관절 3</label>
            <Slider defaultValue={[70]} max={100} step={1} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">관절 4</label>
            <Slider defaultValue={[20]} max={100} step={1} />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Offset 값</h3>
          <div className="grid grid-cols-4 gap-2">
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
        
        <div className="mt-6">
          <Link href="/robocon" className="text-blue-600 hover:underline">
            ← 로보콘 메뉴로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
} 