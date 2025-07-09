"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import Link from "next/link"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Upload } from "lucide-react"
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
// URDF 로더 라이브러리 가져오기
import URDFLoader from '@/lib/urdf-loader/URDFLoader.js'

// 전역 STL 모델 캐시
const stlCache: Record<string, THREE.BufferGeometry> = {};

// URDF 로봇 모델 타입
interface RobotModelProps {
  color: string;
  jointValues: number[];
  urdfModel?: any; // URDF 모델이 있을 경우
}

// URDF 모델을 로드하는 커스텀 훅
function useURDFModel(path: string, color: string) {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    
    // 패키지 경로 설정 - package:// 로 시작하는 경로를 public 경로로 매핑
    loader.packages = {
      'so_100_arm': '' // '/models' 에서 빈 문자열로 변경
    };
    
    // 기본 설정 변경
    loader.parseVisual = true;  // 비주얼 요소 파싱
    loader.parseCollision = false; // 충돌 요소는 파싱하지 않음
    
    // 커스텀 메시 로더 설정 (재질 적용을 위해)
    loader.loadMeshCb = (path, loadingManager, done) => {
      console.log(`메시 로드 시도: ${path}`);
      
      if (path.toLowerCase().endsWith('.stl')) {
        const stlLoader = new STLLoader(loadingManager);
        stlLoader.load(
          path, 
          (geometry: THREE.BufferGeometry) => {
            console.log(`STL 로드 성공: ${path}`);
            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(color),
              roughness: 0.5,
              metalness: 0.7
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            done(mesh);
          },
          undefined,
          (error: Error) => {
            console.error(`STL 로드 오류: ${path}`, error);
            done(null, error);
          }
        );
      } else {
        // 기본 메시 로더 사용
        console.log(`기본 로더 사용: ${path}`);
        loader.defaultMeshLoader(path, loadingManager, done);
      }
    };

    console.log(`URDF 모델 로드 시작: ${path}`);
    
    try {
      loader.load(
        path,
        (result: any) => {
          console.log('URDF 모델 로드 완료:', result);
          
          // 로봇의 계층 구조 출력
          console.log('로봇 구조 디버그:');
          let linkCount = 0;
          let meshCount = 0;
          
          result.traverse((child: any) => {
            // 로봇 구조 디버깅
            const type = child.type || 'unknown';
            const name = child.name || 'unnamed';
            console.log(`노드: ${name}, 타입: ${type}`);
            
            if (child.isURDFLink) linkCount++;
            
            // 메시에 재질 적용
            if (child instanceof THREE.Mesh) {
              meshCount++;
              console.log(`메시 발견: ${name}`);
              
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                roughness: 0.5,
                metalness: 0.7
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          console.log(`링크 수: ${linkCount}, 메시 수: ${meshCount}`);
          
          // 모델 위치 조정
          result.position.set(0, 0, 0);
          
          // 모델이 제대로 보이도록 크기 조정 - URDF 모델은 보통 미터 단위
          const scale = 0.01; // 센티미터로 변환
          result.scale.set(scale, scale, scale);
          
          // 모델 방향 조정 (필요시)
          // result.rotation.set(Math.PI/2, 0, 0);
          
          // 바운딩 박스로 모델 실제 크기 확인
          const box = new THREE.Box3().setFromObject(result);
          console.log('모델 바운딩 박스:', box.min, box.max);
          console.log('모델 크기:', 
            box.max.x - box.min.x,
            box.max.y - box.min.y,
            box.max.z - box.min.z
          );
          
          setModel(result);
          setLoading(false);
        },
        (progress: any) => {
          // 로드 진행 상황 로깅
          if (progress) {
            console.log(`URDF 로드 진행 중: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        },
        (error: any) => {
          console.error('URDF 로드 오류:', error);
          setError(`URDF 파일 로드 실패: ${error.message || error}`);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error('URDF 로드 중 예외 발생:', e);
      setError(`URDF 로드 중 예외 발생: ${e instanceof Error ? e.message : String(e)}`);
      setLoading(false);
    }
    
    return () => {
      // 필요시 정리 작업
    };
  }, [path, color]);

  return { model, loading, error };
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

  // STL 모델 로드
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
                   
  // 로딩 중이면 간단한 로딩 표시
  if (isLoading) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} opacity={0.5} transparent={true} />
      </mesh>
    );
  }
  
  // 에러 확인
  const hasError = baseModel.error || shoulderModel.error || upperArmModel.error || 
                  lowerArmModel.error || wristModel.error || 
                  fixedGripperModel.error || movingJawModel.error;
                  
  if (hasError) {
    console.error("STL 모델 로드 오류 발생");
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  // 관절 각도 계산 (라디안 변환)
  const shoulderRotation = THREE.MathUtils.degToRad(jointValues[0]);
  const shoulderPitch = THREE.MathUtils.degToRad(jointValues[1]);
  const elbow = THREE.MathUtils.degToRad(jointValues[2]);
  const wristPitch = THREE.MathUtils.degToRad(jointValues[3]);
  const wristRoll = THREE.MathUtils.degToRad(jointValues[4]);
  // 그리퍼 각도 계산 - 슬라이더 값을 직접 사용
  const gripper = THREE.MathUtils.degToRad(jointValues[5]); // 슬라이더 값을 바로 라디안으로 변환

  // STL 모델 렌더링 (스케일을 4.0으로 설정)
  return (
    <group scale={[4.0, 4.0, 4.0]} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.25, 0]}>
      {/* 베이스 - 원점에 위치 */}
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        {baseModel.model && <primitive object={baseModel.model.clone()} />}
        
        {/* Shoulder Rotation 관절 - URDF: xyz="0 -0.0452 0.0165" rpy="1.5708 0 0" axis="0 1 0" */}
        <group position={[0, -0.0452, 0.0165]} rotation={[Math.PI/2, 0, 0]}>
          <group rotation={[0, shoulderRotation, 0]}>
            {shoulderModel.model && <primitive object={shoulderModel.model.clone()} />}
            
            {/* Shoulder Pitch 관절 - URDF: xyz="0 0.1025 0.0306" rpy="0 0 0" axis="1 0 0" */}
            <group position={[0, 0.1025, 0.0306]} rotation={[0, 0, 0]}>
              <group rotation={[shoulderPitch, 0, 0]}>
                {upperArmModel.model && <primitive object={upperArmModel.model.clone()} />}
                
                {/* Elbow 관절 - URDF: xyz="0 0.11257 0.028" rpy="0 0 0" axis="1 0 0" */}
                <group position={[0, 0.11257, 0.028]} rotation={[0, 0, 0]}>
                  <group rotation={[elbow, 0, 0]}>
                    {lowerArmModel.model && <primitive object={lowerArmModel.model.clone()} />}
                    
                    {/* Wrist Pitch 관절 - URDF: xyz="0 0.0052 0.1349" rpy="0 0 0" axis="1 0 0" */}
                    <group position={[0, 0.0052, 0.1349]} rotation={[0, 0, 0]}>
                      <group rotation={[wristPitch, 0, 0]}>
                        {wristModel.model && <primitive object={wristModel.model.clone()} />}
                        
                        {/* Wrist Roll 관절 - URDF: xyz="0 -0.0601 0" rpy="0 0 0" axis="0 1 0" */}
                        <group position={[0, -0.0601, 0]} rotation={[0, 0, 0]}>
                          <group rotation={[0, wristRoll, 0]}>
                            {fixedGripperModel.model && <primitive object={fixedGripperModel.model.clone()} />}
                            
                            {/* 그리퍼 - URDF: xyz="-0.0202 -0.0244 0" rpy="3.1416 0 3.1416" axis="0 0 1" */}
                            <group position={[-0.0202, -0.0244, 0]} rotation={[Math.PI, 0, Math.PI]}>
                              <group rotation={[0, 0, gripper]}>
                                {movingJawModel.model && <primitive object={movingJawModel.model.clone()} />}
                              </group>
                            </group>
                          </group>
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

// URDF 뷰어 컴포넌트
function URDFViewer({ 
  urdfPath, 
  jointValues, 
  onLoad,
  color
}: { 
  urdfPath: string; 
  jointValues: number[]; 
  onLoad: (robot: any) => void;
  color: string;
}) {
  // URDF 모델 로드
  const { model, loading, error } = useURDFModel(urdfPath, color);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // 카메라와 모델 위치 조정
  useEffect(() => {
    if (model && !loading && !error) {
      // 모델의 바운딩 박스 계산
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // 모델의 중심으로 카메라 타겟 설정
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        
        // 모델 크기에 맞게 카메라 위치 조정
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // 카메라 위치 설정 (타입에 관계없이)
        camera.position.set(
          center.x + maxDim * 0.5,
          center.y + maxDim * 0.5, 
          center.z + maxDim
        );
        
        // PerspectiveCamera에 대한 추가 설정
        if ('fov' in camera) {
          camera.updateProjectionMatrix();
        }
        
        controlsRef.current.update();
      }
    }
  }, [model, loading, error, camera]);
  
  // 로드 완료 콜백
  useEffect(() => {
    if (model && !loading && !error) {
      onLoad(model);
    }
  }, [model, loading, error, onLoad]);
  
  if (loading) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} opacity={0.5} transparent={true} />
      </mesh>
    );
  }
  
  if (error) {
    console.error("URDF 로드 오류:", error);
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
  
  return (
    <>
      <primitive object={model} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={0.1}
        maxDistance={10}
      />
    </>
  );
}

// 로봇 타입 정의
type Robot = {
  id: number;
  color: string;
  name: string;
  jointValues: number[];
  offsets: number[];
  motorOffsets: number[]; // 각 관절별 모터 기준값 (기본값 2048)
  urdfPath?: string;
  urdfModel?: any;
};

export default function OffsetSimPage() {
  // 각 관절의 모터값 범위와 각도 범위 정의
  const motorConfig = [
    { min: 909, max: 3229, angleMin: -124, angleMax: 124 }, // Base
    { min: 819, max: 3217, angleMin: -102, angleMax: 102 }, // Shoulder Lift
    { min: 867, max: 3104, angleMin: -100, angleMax: 90 },  // Elbow Flex
    { min: 842, max: 3201, angleMin: -113, angleMax: 104 }, // Wrist Flex
    { min: 260, max: 3880, angleMin: -180, angleMax: 180 }, // Wrist Roll
    { min: 2044, max: 3532, angleMin: 0, angleMax: 100 }   // Gripper
  ];

  // 각도를 모터값으로 변환하는 함수
  const angleToMotorValue = (angle: number, jointIndex: number, motorOffset: number = 2048) => {
    const config = motorConfig[jointIndex];
    const angleRange = config.angleMax - config.angleMin;
    const motorRange = config.max - config.min;
    const motorPerDegree = motorRange / angleRange;
    
    // 0도일 때의 모터값을 motorOffset로 설정
    const zeroAngleMotorValue = motorOffset;
    return Math.round(zeroAngleMotorValue + (angle * motorPerDegree));
  };

  // 로봇 상태 관리
  const [robots, setRobots] = useState<Robot[]>([
    { 
      id: 1, 
      color: "orange", 
      name: "로봇 1",
      jointValues: [0, 0, 0, 0, 0, 0], // 마지막 요소는 그리퍼 제어용 (완전닫힘)
      offsets: [0, 0, 0, 0, 0, 0],
      motorOffsets: [2048, 2048, 2048, 2048, 2048, 2048] // 각 관절별 모터 기준값
    }
  ]);
  
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRobot, setSelectedRobot] = useState<number | null>(null);

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

  // 모터 오프셋 값 업데이트 핸들러
  const updateMotorOffset = (robotId: number, offsetIndex: number, value: number) => {
    setRobots(prev => 
      prev.map(robot => 
        robot.id === robotId 
          ? {
              ...robot,
              motorOffsets: robot.motorOffsets.map(
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
        jointValues: [0, 0, 0, 0, 0, 0], // 마지막 요소는 그리퍼 제어용 (완전닫힘)
        offsets: [0, 0, 0, 0, 0, 0],
        motorOffsets: [2048, 2048, 2048, 2048, 2048, 2048] // 각 관절별 모터 기준값
      }
    ]);
  };

  // 로봇 제거 함수
  const removeRobot = (id: number) => {
    if (robots.length <= 1) return; // 최소 1개는 유지
    setRobots(robots.filter(robot => robot.id !== id));
    if (selectedRobot === id) {
      setSelectedRobot(null);
    }
  };



  // 설정 초기화
  const resetSettings = () => {
    setRobots(robots.map(robot => ({
      ...robot,
      jointValues: [0, 0, 0, 0, 0, 0], // 그리퍼는 완전닫힘 상태로 초기화
      offsets: [0, 0, 0, 0, 0, 0]
    })));
  };

  // Rest Position으로 설정
  const setRestPosition = () => {
    setRobots(robots.map(robot => ({
      ...robot,
      jointValues: [0, -102, 90, 71, 0, 0] // Rest Position 각도
    })));
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
    "Base / Shoulder Pan", 
    "Shoulder Lift", 
    "Elbow Flex", 
    "Wrist Flex", 
    "Wrist Roll",
    "Gripper"
  ];

  // 슬라이더 휠 이벤트 핸들러
  const handleSliderWheel = (e: React.WheelEvent, robotId: number, jointIndex: number) => {
    e.preventDefault(); // 페이지 스크롤 방지
    
    const robot = robots.find(r => r.id === robotId);
    if (!robot) return;
    
    const currentValue = robot.jointValues[jointIndex];
    const delta = e.deltaY > 0 ? -1 : 1; // 아래로 스크롤하면 값 감소, 위로 스크롤하면 값 증가
    
    let newValue = currentValue + delta;
    
    // 각 관절별 범위 제한
    let min = -180, max = 180;
    if (jointIndex === 0) { min = -124; max = 124; }
    else if (jointIndex === 1) { min = -102; max = 102; }
    else if (jointIndex === 2) { min = -100; max = 90; }
    else if (jointIndex === 3) { min = -113; max = 104; }
    else if (jointIndex === 5) { min = 0; max = 100; }
    
    newValue = Math.max(min, Math.min(max, newValue));
    
    updateJointValue(robotId, jointIndex, newValue);
  };

  // 모델 로딩 상태 확인 함수
  const isModelLoading = () => {
    return loading;
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4 mt-6">
        <div>
          <p className="text-sm text-gray-600">
            SO-100 5DOF 로봇 팔 시뮬레이션 | 
            <span className="ml-1 text-blue-600">
              <a href="https://github.com/brukg/SO-100-arm" target="_blank" rel="noopener noreferrer" className="hover:underline">
                URDF 모델: Bruk G.
              </a>
            </span>
          </p>
        </div>
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

          <Button variant="outline" onClick={resetSettings}>초기화</Button>
          <Button variant="outline" onClick={setRestPosition} className="bg-green-50">Rest Position</Button>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
          <p><strong>스케일:</strong> 4.0 (3D 모델 표시용)</p>
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
                  {robots.length > 1 && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex items-center gap-1 h-8 px-2" 
                      onClick={() => removeRobot(robot.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-500">로봇 삭제</span>
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
                  
                  {/* SO-100 로봇 모델 - STL 파일 직접 로드 */}
                  <SO100ArmModel 
                    color={robot.color}
                    jointValues={robot.jointValues.map(
                      (val, idx) => {
                        let adjustedVal = val + robot.offsets[idx];
                        // Wrist Flex (index 3)의 경우 -90도를 기준점으로 설정
                        if (idx === 3) {
                          adjustedVal -= 90;
                        }
                        // Wrist Roll (index 4)의 경우 +90도를 기준점으로 설정
                        if (idx === 4) {
                          adjustedVal += 90;
                        }
                        // Gripper (index 5)의 경우 -10도를 기준점으로 설정
                        if (idx === 5) {
                          adjustedVal -= 10;
                        }
                        return adjustedVal;
                      }
                    )}
                  />
                  
                  <Environment preset="studio" />
                  {/* 그리드 헬퍼 추가 */}
                  <gridHelper args={[2, 20]} position={[0, -0.25, 0]} />
                  <axesHelper args={[1]} />
                  <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                </Canvas>
              </div>
            </div>
            
            {/* 관절 제어 영역 (오른쪽) - 2컬럼 레이아웃 */}
            <div className="w-80 border-l bg-gray-50 flex flex-col">
              <h3 className="text-sm font-medium p-3 pb-2 border-b bg-gray-50">{robot.name} 관절 제어</h3>
              
              {/* 2컬럼 레이아웃 - 고정 높이 */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* 왼쪽 컬럼: 슬라이더 제어 - 고정 */}
                <div className="w-1/2 p-3 space-y-4 bg-gray-50">
                  <h4 className="text-xs font-medium text-gray-700 border-b pb-1">관절 제어</h4>
                  
                  {jointNames.slice(0, 5).map((name, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-medium mb-1">
                        {name}: {robot.jointValues[idx]}°
                      </label>
                      <div 
                        onWheel={(e) => handleSliderWheel(e, robot.id, idx)}
                        className="cursor-pointer"
                      >
                        <Slider 
                          value={[robot.jointValues[idx]]} 
                          min={idx === 0 ? -124 : idx === 1 ? -102 : idx === 2 ? -100 : idx === 3 ? -113 : -180} 
                          max={idx === 0 ? 124 : idx === 1 ? 102 : idx === 2 ? 90 : idx === 3 ? 104 : 180} 
                          step={1} 
                          onValueChange={(vals) => updateJointValue(robot.id, idx, vals[0])}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* 그리퍼 제어 */}
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      그리퍼: {robot.jointValues[5] === 0 ? "완전닫힘" : robot.jointValues[5] === 100 ? "완전열림" : `${robot.jointValues[5]}°`}
                    </label>
                    <div 
                      onWheel={(e) => handleSliderWheel(e, robot.id, 5)}
                      className="cursor-pointer"
                    >
                      <Slider 
                        value={[robot.jointValues[5]]} 
                        min={0} 
                        max={100} 
                        step={1}
                        onValueChange={(vals) => updateJointValue(robot.id, 5, vals[0])}
                      />
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Button size="sm" variant="outline" className="text-xs flex-1 h-6 py-0"
                        onClick={() => updateJointValue(robot.id, 5, 0)}>
                        닫기
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs flex-1 h-6 py-0"
                        onClick={() => updateJointValue(robot.id, 5, 100)}>
                        열기
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* 오른쪽 컬럼: Offset & 모터값 - 스크롤 가능 */}
                <div className="w-1/2 border-l border-gray-200 overflow-y-auto">
                  <div className="p-3 space-y-3">
                    <h4 className="text-xs font-medium text-gray-700 border-b pb-1 sticky top-0 bg-gray-50">Offset & 모터값</h4>
                  
                  {jointNames.map((name, idx) => {
                    const currentMotorValue = angleToMotorValue(
                      robot.jointValues[idx] + robot.offsets[idx], 
                      idx, 
                      robot.motorOffsets[idx]
                    );
                    const config = motorConfig[idx];
                    
                    return (
                      <div key={idx} className="bg-white p-2 rounded border text-xs">
                        <label className="block font-medium mb-1 text-gray-800">{name.split(' / ')[0]}</label>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs whitespace-nowrap">모터값:</span>
                            <div className="flex-1 min-w-0 border rounded px-1 py-0.5 text-xs bg-blue-50 font-mono font-bold text-blue-700">
                              {currentMotorValue}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs whitespace-nowrap">모터 기준:</span>
                            <input 
                              type="number" 
                              className="flex-1 min-w-0 border rounded px-1 py-0.5 text-xs" 
                              value={robot.motorOffsets[idx]} 
                              onChange={(e) => updateMotorOffset(robot.id, idx, Number(e.target.value))}
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1 pt-1 border-t">
                          <div>범위: {config.min} ~ {config.max}</div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
} 