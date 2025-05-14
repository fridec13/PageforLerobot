"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import Link from "next/link"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, FileDown, Upload } from "lucide-react"
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
// URDF 로더는 현재 구현 중입니다
// import URDFLoader from 'urdf-loader'

// 전역 STL 모델 캐시
const stlCache: Record<string, THREE.BufferGeometry> = {};

// URDF 로봇 모델 타입
interface RobotModelProps {
  color: string;
  jointValues: number[];
  urdfModel?: any; // URDF 모델이 있을 경우
}

// STL 모델 로드를 위한 커스텀 훅
function useSTLModel(path: string, material: THREE.Material) {
  const [model, setModel] = useState<THREE.Mesh | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 로드 상태 추적
  const loadingRef = useRef(false);

  useEffect(() => {
    // 이미 로딩 중이거나 모델이 이미 로드된 경우 실행하지 않음
    if (loadingRef.current || model) return;
    
    loadingRef.current = true;
    
    // 캐시에서 먼저 확인
    if (stlCache[path]) {
      console.log(`STL 캐시에서 로드: ${path}`);
      const mesh = new THREE.Mesh(stlCache[path], material);
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
        // 캐시에 저장
        stlCache[path] = geometry;
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        setModel(mesh);
        setLoading(false);
        loadingRef.current = false;
      },
      (progress) => {
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
  }, [path, material]);

  return { model, loading, error };
}

// 메모이제이션된 SO-100 로봇 팔 모델 컴포넌트
const SO100ArmModel = memo(function SO100ArmModel({ color, jointValues, urdfModel }: RobotModelProps) {
  // 링크 및 관절 참조
  const baseRef = useRef<THREE.Group>(null!)
  const shoulderRotationRef = useRef<THREE.Group>(null!)
  const shoulderPitchRef = useRef<THREE.Group>(null!)
  const elbowRef = useRef<THREE.Group>(null!)
  const wristPitchRef = useRef<THREE.Group>(null!)
  const wristRollRef = useRef<THREE.Group>(null!)
  const gripperRef = useRef<THREE.Group>(null!)
  
  // 재질 생성 - useMemo로 최적화
  const mainMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color),
      roughness: 0.5,
      metalness: 0.7
    })
  , [color]);
  
  const darkMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).multiplyScalar(0.8),
      roughness: 0.6,
      metalness: 0.8
    })
  , [color]);

  // 각 부품의 STL 모델 로드
  const baseModel = useSTLModel('/models/so_100_arm_5dof/meshes/Base.STL', darkMaterial);
  const shoulderModel = useSTLModel('/models/so_100_arm_5dof/meshes/Shoulder_Rotation_Pitch.STL', mainMaterial);
  const upperArmModel = useSTLModel('/models/so_100_arm_5dof/meshes/Upper_Arm.STL', mainMaterial);
  const lowerArmModel = useSTLModel('/models/so_100_arm_5dof/meshes/Lower_Arm.STL', mainMaterial);
  const wristModel = useSTLModel('/models/so_100_arm_5dof/meshes/Wrist_Pitch_Roll.STL', mainMaterial);
  const fixedGripperModel = useSTLModel('/models/so_100_arm_5dof/meshes/Fixed_Gripper.STL', darkMaterial);
  const movingJawModel = useSTLModel('/models/so_100_arm_5dof/meshes/Moving_Jaw.STL', darkMaterial);
  
  // 모델 로딩 상태
  const isLoading = baseModel.loading || shoulderModel.loading || upperArmModel.loading ||
                    lowerArmModel.loading || wristModel.loading || 
                    fixedGripperModel.loading || movingJawModel.loading;

  // 로딩 에러 확인
  const loadError = baseModel.error || shoulderModel.error || upperArmModel.error ||
                    lowerArmModel.error || wristModel.error || 
                    fixedGripperModel.error || movingJawModel.error;
  
  // 관절 각도 업데이트
  useEffect(() => {
    // Shoulder Rotation (0번 관절) - Y축 기준 회전
    if (shoulderRotationRef.current) {
      shoulderRotationRef.current.rotation.y = THREE.MathUtils.degToRad(jointValues[0]);
    }
    
    // Shoulder Pitch (1번 관절) - X축 기준 회전
    if (shoulderPitchRef.current) {
      shoulderPitchRef.current.rotation.x = THREE.MathUtils.degToRad(jointValues[1]);
    }
    
    // Elbow (2번 관절) - X축 기준 회전
    if (elbowRef.current) {
      elbowRef.current.rotation.x = THREE.MathUtils.degToRad(jointValues[2]);
    }
    
    // Wrist Pitch (3번 관절) - X축 기준 회전
    if (wristPitchRef.current) {
      wristPitchRef.current.rotation.x = THREE.MathUtils.degToRad(jointValues[3]);
    }
    
    // Wrist Roll (4번 관절) - Y축 기준 회전
    if (wristRollRef.current) {
      wristRollRef.current.rotation.y = THREE.MathUtils.degToRad(jointValues[4]);
    }
    
    // 그리퍼 (5번 관절) - Z축 기준 회전 (열고 닫힘 제어)
    if (gripperRef.current) {
      // 그리퍼 열림 각도: 0~45도 범위 내에서 매핑
      const openAngle = Math.min(45, Math.max(0, jointValues[5])) / 45;
      gripperRef.current.rotation.z = THREE.MathUtils.degToRad(openAngle * 30); // 최대 30도까지 벌어짐
    }
  }, [jointValues]);

  // URDF 모델이 있으면 그것을 사용
  if (urdfModel) {
    return <primitive object={urdfModel} />;
  }

  // 로딩 중이면 간단한 로딩 표시
  if (isLoading) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} opacity={0.5} transparent={true} />
        <group position={[0, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </mesh>
    );
  }

  // 로드 에러가 있으면 기본 모델 사용
  if (loadError) {
    console.error("STL 모델 로딩 오류, 기본 모델 사용", loadError);
    return (
      <group ref={baseRef}>
        {/* 베이스 */}
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.05, 16]} />
          <meshStandardMaterial color={darkMaterial.color} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color={mainMaterial.color} />
        </mesh>
        
        {/* Shoulder_Rotation 관절 - 기존 코드와 동일 */}
        {/* ... 기존 도형 기반 모델 렌더링 ... */}
      </group>
    );
  }
  
  // STL 모델 렌더링
  return (
    <group ref={baseRef} scale={[0.01, 0.01, 0.01]}>
      {/* 베이스 - 원점에 위치 */}
      {baseModel.model && <primitive object={baseModel.model.clone()} />}
      
      {/* Shoulder Rotation 관절 */}
      <group ref={shoulderRotationRef} position={[0, -4.52, 1.65]} rotation={[Math.PI/2, 0, 0]}>
        {shoulderModel.model && <primitive object={shoulderModel.model.clone()} />}
        
        {/* Shoulder Pitch 관절 */}
        <group ref={shoulderPitchRef} position={[0, 10.25, 3.06]} rotation={[0, 0, 0]}>
          {upperArmModel.model && <primitive object={upperArmModel.model.clone()} />}
          
          {/* Elbow 관절 */}
          <group ref={elbowRef} position={[0, 11.257, 2.8]} rotation={[0, 0, 0]}>
            {lowerArmModel.model && <primitive object={lowerArmModel.model.clone()} />}
            
            {/* Wrist Pitch 관절 */}
            <group ref={wristPitchRef} position={[0, 0.52, 13.49]} rotation={[0, 0, 0]}>
              {wristModel.model && <primitive object={wristModel.model.clone()} />}
              
              {/* Wrist Roll 관절 */}
              <group ref={wristRollRef} position={[0, -6.01, 0]} rotation={[0, 0, 0]}>
                {fixedGripperModel.model && <primitive object={fixedGripperModel.model.clone()} />}
                
                {/* 그리퍼 */}
                <group ref={gripperRef} position={[-2.02, -2.44, 0]} rotation={[Math.PI, 0, Math.PI]}>
                  {movingJawModel.model && <primitive object={movingJawModel.model.clone()} />}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
      
      {/* 베이스 플레이트 */}
      <mesh position={[0, -25, 0]} receiveShadow>
        <boxGeometry args={[30, 2, 30]} />
        <meshStandardMaterial color={"#444"} />
      </mesh>
    </group>
  );
});

// 간단한 URDF 뷰어 컴포넌트 (임시 구현)
function URDFViewer({ 
  urdfPath, 
  jointValues, 
  onLoad 
}: { 
  urdfPath: string; 
  jointValues: number[]; 
  onLoad: (robot: any) => void;
}) {
  // 현재는 URDF를 로드하지 않고 간단한 메시지만 표시
  useEffect(() => {
    console.log("URDF 기능은 아직 구현 중입니다. 기본 모델을 사용합니다.");
    
    // 임시 로봇 생성
    const robot = new THREE.Group();
    // @ts-ignore
    robot.isRobot = true;
    
    // 로드 완료 콜백
    onLoad(robot);
  }, [onLoad]);
  
  return null;
}

// 로봇 타입 정의
type Robot = {
  id: number;
  color: string;
  name: string;
  jointValues: number[];
  offsets: number[];
  urdfPath?: string;
  urdfModel?: any;
};

export default function OffsetSimPage() {
  // 로봇 상태 관리
  const [robots, setRobots] = useState<Robot[]>([
    { 
      id: 1, 
      color: "orange", 
      name: "로봇 1",
      jointValues: [0, 0, 0, 0, 0, 0], // 마지막 요소는 그리퍼 제어용
      offsets: [0, 0, 0, 0, 0, 0]
    }
  ]);
  
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRobot, setSelectedRobot] = useState<number | null>(null);
  // URDF 로더 준비 상태 - 현재 사용하지 않음
  const [urdfLoaderReady, setUrdfLoaderReady] = useState<boolean>(false);

  // 관절 값 업데이트 핸들러
  const updateJointValue = (robotId: number, jointIndex: number, value: number) => {
    setRobots(prev => 
      prev.map(robot => 
        robot.id === robotId 
          ? {
              ...robot,
              jointValues: robot.jointValues.map(
                (jointValue, idx) => idx === jointIndex ? value : jointValue
              )
            }
          : robot
      )
    );
  };

  // Offset 값 업데이트 핸들러
  const updateOffset = (robotId: number, offsetIndex: number, value: number) => {
    setRobots(prev => 
      prev.map(robot => 
        robot.id === robotId 
          ? {
              ...robot,
              offsets: robot.offsets.map(
                (offsetValue, idx) => idx === offsetIndex ? value : offsetValue
              )
            }
          : robot
      )
    );
  };

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
        name: `로봇 ${newId}`,
        jointValues: [0, 0, 0, 0, 0, 0], // 마지막 요소는 그리퍼 제어용
        offsets: [0, 0, 0, 0, 0, 0]
      }
    ]);
  };

  // 로봇 제거 함수
  const removeRobot = (id: number) => {
    if (robots.length <= 1) return; // 최소 1개는 유지
    setRobots(robots.filter(robot => robot.id !== id));
  };

  // 설정 저장
  const saveSettings = () => {
    const data = JSON.stringify(robots, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robot_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 설정 초기화
  const resetSettings = () => {
    setRobots(robots.map(robot => ({
      ...robot,
      jointValues: [0, 0, 0, 0, 0, 0],
      offsets: [0, 0, 0, 0, 0, 0]
    })));
  };

  // URDF 모델 로드 함수 (임시 구현 - 현재는 알림만 표시)
  const loadURDFModel = (event: React.ChangeEvent<HTMLInputElement>, robotId: number) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setLoading(true);
    setSelectedRobot(robotId);
    
    // 임시 알림
    alert("URDF 파일 로딩 기능은 현재 개발 중입니다. 곧 사용 가능해질 예정입니다.");
    
    // 로딩 상태 해제
    setLoading(false);
  };

  // URDF 모델 로드 완료 핸들러
  const handleModelLoad = (robotId: number, model: any) => {
    setRobots(prev => 
      prev.map(robot => 
        robot.id === robotId 
          ? { ...robot, urdfModel: model }
          : robot
      )
    );
  };

  // 샘플 URDF 로드 (임시 구현 - 현재는 알림만 표시)
  const loadSampleURDF = (robotId: number) => {
    // 임시 알림
    alert("샘플 URDF 로딩 기능은 현재 개발 중입니다. 곧 사용 가능해질 예정입니다.");
    
    setLoading(true);
    setSelectedRobot(robotId);
    
    // 잠시 후 로딩 상태 해제
    setTimeout(() => setLoading(false), 500);
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

  // 관절 이름 배열 (UI 표시용)
  const jointNames = [
    "Shoulder Rotation", 
    "Shoulder Pitch", 
    "Elbow", 
    "Wrist Pitch", 
    "Wrist Roll",
    "Gripper"
  ];

  // 모델 로딩 상태 확인 함수
  const isModelLoading = () => {
    return loading;
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Offset 시뮬레이션 - SO-100 로봇 팔</h1>
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
          <Button 
            className="flex items-center bg-blue-600"
            onClick={saveSettings}
          >
            <FileDown className="h-4 w-4 mr-1" />
            설정 저장
          </Button>
          <Button variant="outline" onClick={resetSettings}>초기화</Button>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
          <p><strong>정보:</strong> STL 모델을 불러오고 있습니다. 모델 크기가 크므로 로드에 시간이 걸릴 수 있습니다. 브라우저 콘솔에서 진행 상태를 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className={`grid ${getGridClass()} gap-4 h-[calc(100vh-250px)]`}>
        {robots.map((robot) => (
          <div key={robot.id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
            {/* 3D 모델 영역 (왼쪽) */}
            <div className="flex-1 flex flex-col">
              <div className="p-2 bg-gray-100 border-b font-medium flex justify-between items-center">
                <div className="flex items-center">
                  <span>{robot.name}</span>
                  {loading && selectedRobot === robot.id && (
                    <span className="ml-2 text-xs text-orange-500">로딩중...</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="file" 
                    id={`urdf-upload-${robot.id}`} 
                    className="hidden"
                    accept=".urdf,.xml"
                    onChange={(e) => loadURDFModel(e, robot.id)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => document.getElementById(`urdf-upload-${robot.id}`)?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    <span className="opacity-50">URDF</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs opacity-50"
                    onClick={() => loadSampleURDF(robot.id)}
                  >
                    샘플
                  </Button>
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
              </div>
              <div className="flex-1 relative">
                <Canvas 
                  key={`canvas-${robot.id}`}
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                  camera={{ position: [1.0, 1.0, 1.5], fov: 50 }}
                  shadows
                >
                  <ambientLight intensity={0.6} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.7} castShadow />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  
                  {/* SO-100 로봇 모델 */}
                  <SO100ArmModel 
                    color={robot.color}
                    jointValues={robot.jointValues.map(
                      (val, idx) => val + robot.offsets[idx]
                    )}
                  />
                  
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={0.5}
                    maxDistance={5}
                  />
                  <Environment preset="studio" />
                  {/* 그리드 헬퍼 추가 */}
                  <gridHelper args={[2, 20]} position={[0, -0.25, 0]} />
                  <axesHelper args={[1]} />
                </Canvas>
              </div>
            </div>
            
            {/* 관절 제어 영역 (오른쪽) */}
            <div className="w-48 p-3 border-l bg-gray-50 overflow-y-auto">
              <div className="mb-3">
                <h3 className="text-sm font-medium mb-2">{robot.name} 관절 제어</h3>
                <div className="space-y-4">
                  {jointNames.slice(0, 5).map((name, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium mb-1">
                        {name}: {robot.jointValues[idx]}°
                      </label>
                      <Slider 
                        value={[robot.jointValues[idx]]} 
                        min={-180} 
                        max={180} 
                        step={1} 
                        onValueChange={(vals) => updateJointValue(robot.id, idx, vals[0])}
                      />
                    </div>
                  ))}
                  
                  {/* 그리퍼 제어 (열기/닫기) */}
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      그리퍼: {robot.jointValues[5] === 0 ? "닫힘" : robot.jointValues[5] === 45 ? "열림" : `${robot.jointValues[5]}°`}
                    </label>
                    <Slider 
                      value={[robot.jointValues[5]]} 
                      min={0} 
                      max={45} 
                      step={1}
                      onValueChange={(vals) => updateJointValue(robot.id, 5, vals[0])}
                    />
                    {/* 그리퍼 빠른 제어 버튼 */}
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" className="text-xs flex-1 h-7"
                        onClick={() => updateJointValue(robot.id, 5, 0)}>
                        닫기
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs flex-1 h-7"
                        onClick={() => updateJointValue(robot.id, 5, 45)}>
                        열기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <h3 className="text-xs font-medium mb-2">Offset 값</h3>
                <div className="space-y-2">
                  {jointNames.map((name, idx) => (
                    <div key={idx}>
                      <label className="block text-xs mb-1">{name} Offset</label>
                      <input 
                        type="number" 
                        className="w-full border rounded px-2 py-1 text-sm" 
                        value={robot.offsets[idx]} 
                        onChange={(e) => updateOffset(robot.id, idx, Number(e.target.value))}
                      />
                    </div>
                  ))}
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