"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

// 전역 STL 모델 캐시
const stlCache: Record<string, THREE.BufferGeometry> = {};

// STL 모델 로드를 위한 커스텀 훅
function useSTLModel(path: string, material: THREE.Material) {
  const [model, setModel] = useState<THREE.Mesh | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  
  // 로드 상태 추적
  const loadingRef = useRef(false);

  useEffect(() => {
    // 이미 로딩 중이거나 모델이 이미 로드된 경우 실행하지 않음
    if (loadingRef.current || model) return;
    
    loadingRef.current = true;
    
    // 캐시에서 먼저 확인
    if (stlCache[path]) {
      console.log(`STL 캐시에서 로드: ${path}`);
      const geometry = stlCache[path];
      
      // 모델의 중심을 계산하여 좌표 원점으로 조정
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        
        // 모델 정보 저장
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        setInfo({
          center,
          size,
          boundingBox: geometry.boundingBox
        });
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      setModel(mesh);
      setLoading(false);
      loadingRef.current = false;
      return;
    }
    
    const loader = new STLLoader();
    
    console.log(`STL 모델 로드 시작: ${path}`);
    setLoading(true);
    
    loader.load(
      path,
      (geometry: THREE.BufferGeometry) => {
        console.log(`STL 로드 성공: ${path}`);
        
        // 모델의 중심을 계산
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        if (geometry.boundingBox) {
          geometry.boundingBox.getCenter(center);
          
          // 모델 정보 저장
          const size = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          setInfo({
            center,
            size,
            boundingBox: geometry.boundingBox
          });
          
          console.log(`STL 모델 정보 (${path}):`, {
            size: {
              x: size.x,
              y: size.y,
              z: size.z
            },
            center: {
              x: center.x,
              y: center.y, 
              z: center.z
            }
          });
        }
        
        // 캐시에 저장
        stlCache[path] = geometry;
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        setModel(mesh);
        setLoading(false);
        loadingRef.current = false;
      },
      (progress: any) => {
        console.log(`STL 로드 진행 중: ${path}, ${Math.round((progress.loaded / progress.total) * 100)}%`);
      },
      (error: unknown) => {
        console.error(`STL 로드 오류: ${path}`, error);
        setError(`STL 파일 로드 실패: ${path}`);
        setLoading(false);
        loadingRef.current = false;
      }
    );
    
    // 클린업 함수
    return () => {
      // 로더는 직접 중단할 수 없지만, 플래그를 설정하여 비동기 완료 후 상태를 업데이트하지 않도록 함
      loadingRef.current = false;
    };
  }, [path, material, model]);

  return { model, loading, error, info };
}

// 단일 STL 모델 테스트 컴포넌트
function SingleSTLModelTest() {
  const [currentModel, setCurrentModel] = useState<number>(0);
  const [modelScale, setModelScale] = useState<number>(4.0);
  const [rotateX, setRotateX] = useState<number>(-Math.PI/2);
  const [rotateY, setRotateY] = useState<number>(0);
  const [rotateZ, setRotateZ] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<'normal' | 'wireframe'>('normal');
  const [unitMode, setUnitMode] = useState<'미터(m)' | '밀리미터(mm)'>('미터(m)');
  
  // 모델 경로 목록
  const modelPaths = [
    '/models/so_100_arm_5dof/meshes/Base.STL',
    '/models/so_100_arm_5dof/meshes/Shoulder_Rotation_Pitch.STL',
    '/models/so_100_arm_5dof/meshes/Upper_Arm.STL',
    '/models/so_100_arm_5dof/meshes/Lower_Arm.STL',
    '/models/so_100_arm_5dof/meshes/Wrist_Pitch_Roll.STL',
    '/models/so_100_arm_5dof/meshes/Fixed_Gripper.STL',
    '/models/so_100_arm_5dof/meshes/Moving_Jaw.STL'
  ];
  
  // 재질 생성
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: new THREE.Color('orange'),
      roughness: 0.5,
      metalness: 0.7
    })
  , []);
  
  // 와이어프레임 재질
  const wireframeMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({ 
      color: new THREE.Color('white'),
      wireframe: true
    })
  , []);
  
  // 현재 모델 로드
  const { model, loading, error, info } = useSTLModel(
    modelPaths[currentModel], 
    displayMode === 'normal' ? material : wireframeMaterial
  );
  
  // 다음 모델 로드
  const nextModel = () => {
    setCurrentModel((prev) => (prev + 1) % modelPaths.length);
  };
  
  // 이전 모델 로드
  const prevModel = () => {
    setCurrentModel((prev) => (prev - 1 + modelPaths.length) % modelPaths.length);
  };
  
  // 모델 이름 추출
  const getModelName = (path: string) => {
    return path.split('/').pop() || '';
  };
  
  // 표시 모드 전환
  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'normal' ? 'wireframe' : 'normal');
  };
  
  // 단위 모드 전환
  const toggleUnitMode = () => {
    // 단위 모드 변경 시 적절한 스케일 값으로 자동 조정
    if (unitMode === '미터(m)') {
      setUnitMode('밀리미터(mm)');
      setModelScale(4000.0); // mm 단위에 적합한 스케일
    } else {
      setUnitMode('미터(m)');
      setModelScale(4.0); // m 단위에 적합한 스케일
    }
  };
  
  // 회전 초기화
  const resetRotation = () => {
    setRotateX(-Math.PI/2);
    setRotateY(0);
    setRotateZ(0);
  };
  
  // ROS2/URDF 좌표계로 회전 설정
  const setROS2Orientation = () => {
    setRotateX(-Math.PI/2);
    setRotateY(0);
    setRotateZ(0);
    setModelScale(unitMode === '미터(m)' ? 4.0 : 4000.0);
  };

  // 스케일 배율 높이기
  const enlargeScale = () => {
    setModelScale(prev => prev * 2);
  };

  // 스케일 배율 낮추기
  const reduceScale = () => {
    setModelScale(prev => prev / 2);
  };

  // 최적 스케일 설정
  const setOptimalScale = () => {
    setModelScale(unitMode === '미터(m)' ? 4.0 : 4000.0);
  };
  
  // 미터(m) 단위로 테스트 - 스케일 1
  const testMeterUnit = () => {
    setUnitMode('미터(m)');
    setModelScale(1.0);
  };

  // 밀리미터(mm) 단위로 테스트 - 스케일 1
  const testMillimeterUnit = () => {
    setUnitMode('밀리미터(mm)');
    setModelScale(1000.0);
  };
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          STL 모델 테스트 - {getModelName(modelPaths[currentModel])}
        </h1>
        <div className="flex space-x-2">
          <Button onClick={prevModel} disabled={loading}>이전</Button>
          <Button onClick={nextModel} disabled={loading}>다음</Button>
          <Button onClick={toggleDisplayMode}>
            {displayMode === 'normal' ? '와이어프레임' : '일반 모드'}
          </Button>
          <Button onClick={toggleUnitMode} variant="outline">
            단위: {unitMode}
          </Button>
        </div>
      </div>
      
      {/* 단위 테스트 버튼 */}
      <div className="mb-4 p-3 bg-gray-50 border rounded-md">
        <h3 className="text-sm font-medium mb-2">단위 테스트</h3>
        <div className="flex gap-2">
          <Button 
            onClick={testMeterUnit} 
            variant={unitMode === '미터(m)' && modelScale === 1.0 ? 'default' : 'outline'}
            className="text-xs"
          >
            미터(m) 단위로 테스트 (스케일 1.0)
          </Button>
          <Button 
            onClick={testMillimeterUnit}
            variant={unitMode === '밀리미터(mm)' && modelScale === 1000.0 ? 'default' : 'outline'}
            className="text-xs"
          >
            밀리미터(mm) 단위로 테스트 (스케일 1000.0)
          </Button>
          <Button 
            onClick={setOptimalScale}
            variant="outline"
            className="text-xs"
          >
            최적 스케일로 복원 ({unitMode === '미터(m)' ? '4.0' : '4000.0'})
          </Button>
        </div>
        <p className="text-xs mt-2 text-gray-500">
          미터(m) 단위로 설계된 모델은 스케일 1.0에서 실제 크기로 보입니다. 밀리미터(mm)로 설계된 모델은 스케일 1000.0에서 실제 크기로 보입니다.
        </p>
      </div>
      
      {/* 모델 조정 컨트롤 */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            스케일: {modelScale.toFixed(3)} ({unitMode})
          </label>
          <div className="flex gap-2 items-center">
            <Slider 
              value={[modelScale]} 
              min={unitMode === '미터(m)' ? 0.1 : 100}
              max={unitMode === '미터(m)' ? 20 : 20000}
              step={unitMode === '미터(m)' ? 0.1 : 100}
              onValueChange={(vals) => setModelScale(vals[0])} 
            />
            <Button size="sm" onClick={setOptimalScale} title="최적 스케일 설정">최적</Button>
            <Button size="sm" onClick={enlargeScale}>×2</Button>
            <Button size="sm" onClick={reduceScale}>÷2</Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            X축 회전: {(rotateX * 180 / Math.PI).toFixed(0)}°
          </label>
          <Slider 
            value={[rotateX]} 
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            onValueChange={(vals) => setRotateX(vals[0])} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Y축 회전: {(rotateY * 180 / Math.PI).toFixed(0)}°
          </label>
          <Slider 
            value={[rotateY]} 
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            onValueChange={(vals) => setRotateY(vals[0])} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Z축 회전: {(rotateZ * 180 / Math.PI).toFixed(0)}°
          </label>
          <Slider 
            value={[rotateZ]} 
            min={-Math.PI}
            max={Math.PI}
            step={0.01}
            onValueChange={(vals) => setRotateZ(vals[0])} 
          />
        </div>
      </div>
      
      <div className="mb-2 flex gap-2">
        <Button variant="outline" onClick={resetRotation}>회전 초기화</Button>
        <Button variant="outline" onClick={setROS2Orientation}>ROS2 방향으로 설정</Button>
      </div>
      
      <div className="h-[calc(100vh-350px)] relative bg-gray-100 rounded-lg overflow-hidden">
        <Canvas 
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          camera={{ position: [2, 2, 2], fov: 50 }}
          shadows
        >
          <ambientLight intensity={0.6} />
          <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.0} castShadow />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          
          {/* 좌표계 표시 */}
          <group>
            {/* X축 (빨간색) */}
            <mesh position={[0.5, 0, 0]}>
              <boxGeometry args={[1, 0.02, 0.02]} />
              <meshBasicMaterial color="red" />
            </mesh>
            
            {/* Y축 (녹색) */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.02, 1, 0.02]} />
              <meshBasicMaterial color="green" />
            </mesh>
            
            {/* Z축 (파란색) */}
            <mesh position={[0, 0, 0.5]}>
              <boxGeometry args={[0.02, 0.02, 1]} />
              <meshBasicMaterial color="blue" />
            </mesh>
          </group>
          
          {/* 원점 표시 */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
          
          {/* 현재 모델 표시 */}
          {!loading && !error && model && (
            <group 
              scale={[modelScale, modelScale, modelScale]}
              rotation={[rotateX, rotateY, rotateZ]}
            >
              <primitive object={model} />
            </group>
          )}
          
          {/* 로딩 표시 */}
          {loading && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="orange" opacity={0.5} transparent={true} />
            </mesh>
          )}
          
          {/* 에러 표시 */}
          {error && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="red" />
            </mesh>
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0.1}
            maxDistance={50}
          />
          <gridHelper args={[5, 20]} />
          <Environment preset="studio" />
        </Canvas>
      </div>
      
      {/* 모델 정보 표시 */}
      <div className="mt-4 p-4 bg-gray-50 border rounded-md">
        <h3 className="font-medium mb-2">모델 정보</h3>
        {loading ? (
          <p className="text-orange-500">로딩 중...</p>
        ) : error ? (
          <p className="text-red-500">오류: {error}</p>
        ) : info ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium">크기 (Size)</h4>
              <p>너비 (X): {info.size?.x.toFixed(4)}</p>
              <p>높이 (Y): {info.size?.y.toFixed(4)}</p>
              <p>깊이 (Z): {info.size?.z.toFixed(4)}</p>
            </div>
            <div>
              <h4 className="font-medium">중심점 (Center)</h4>
              <p>X: {info.center?.x.toFixed(4)}</p>
              <p>Y: {info.center?.y.toFixed(4)}</p>
              <p>Z: {info.center?.z.toFixed(4)}</p>
            </div>
          </div>
        ) : (
          <p>모델 정보 없음</p>
        )}
      </div>
      
      <div className="mt-4 flex justify-start">
        <Link href="/robocon" className="text-blue-600 hover:underline">
          ← 로보콘 메뉴로 돌아가기
        </Link>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function OffsetSimPage() {
  // STL 모델 테스트 컴포넌트 사용
  return <SingleSTLModelTest />;
}
