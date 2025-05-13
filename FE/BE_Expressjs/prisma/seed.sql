-- 사용자 데이터 삽입 (위키 문서 작성자용)
INSERT INTO "User" (id, name, email, password, role, title, contribution, "createdAt", "updatedAt")
VALUES
  ('user_admin', '관리자', 'admin@robossafyens.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'ADMIN', '로봇 마스터', 100, NOW(), NOW()),
  ('user_mod', '운영자', 'mod@robossafyens.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'MODERATOR', '로봇 전문가', 50, NOW(), NOW()),
  ('user_jk', '김정국', 'jk@robossafyens.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'USER', '열정 기여자', 30, NOW(), NOW()),
  ('user_ms', '민성', 'ms@robossafyens.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'USER', '새싹', 5, NOW(), NOW()),
  ('user_yj', '윤정', 'yj@robossafyens.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'USER', '로봇 연구자', 15, NOW(), NOW());

-- 위키 카테고리 데이터 삽입
INSERT INTO "WikiCategory" (id, name, slug, description, "createdAt", "updatedAt")
VALUES
  ('cat_basics', '기초 지식', 'basics', '로봇 공학의 기초 개념', NOW(), NOW()),
  ('cat_hardware', '하드웨어', 'hardware', '로봇 하드웨어 관련', NOW(), NOW()),
  ('cat_software', '소프트웨어', 'software', '로봇 소프트웨어 관련', NOW(), NOW()),
  ('cat_ai', '인공지능', 'ai', '로봇 인공지능 기술', NOW(), NOW()),
  ('cat_sensors', '센서 기술', 'sensors', '로봇 센서 관련 기술', NOW(), NOW()),
  ('cat_applications', '응용 분야', 'applications', '로봇 응용 분야', NOW(), NOW()),
  ('cat_programming', '프로그래밍', 'programming', '로봇 프로그래밍', NOW(), NOW()),
  ('cat_future', '미래 기술', 'future', '로봇 미래 기술', NOW(), NOW()),
  ('cat_ros', 'ROS', 'ros', 'Robot Operating System', NOW(), NOW());

-- 위키 문서 데이터 삽입
INSERT INTO "WikiDocument" (id, slug, title, content, "isPublished", "viewCount", "createdAt", "updatedAt", "createdById", "lastModifiedById")
VALUES
  ('doc_basics', 'robot-basics', '로봇 공학 기초', '# 로봇 공학 기초\n\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문으로, 로봇의 설계, 제작, 운용에 관한 기술을 연구합니다.\n\n## 로봇의 정의\n\n로봇은 프로그래밍 가능한 기계 장치로, 다양한 작업을 자동으로 수행할 수 있습니다. 로봇은 센서를 통해 환경을 인식하고, 프로세서로 정보를 처리하며, 액추에이터를 통해 물리적 행동을 수행합니다.\n\n## 로봇의 역사\n\n로봇이라는 용어는 1920년 체코 작가 카렐 차페크의 희곡 "R.U.R."에서 처음 등장했습니다. 현대적 의미의 로봇 개발은 1950년대부터 시작되었으며, 산업용 로봇은 1960년대 처음 도입되었습니다.', TRUE, 1250, '2023-01-15', '2023-06-20', 'user_admin', 'user_mod'),
  
  ('doc_sensors', 'robot-sensors', '로봇 센서의 종류와 활용', '# 로봇 센서의 종류와 활용\n\n로봇이 주변 환경을 인식하고 상호작용하기 위해서는 다양한 센서가 필요합니다.\n\n## 센서의 종류\n\n### 1. 시각 센서\n- 카메라: RGB, 스테레오, 열화상 등\n- 라이다(LiDAR): 레이저를 이용한 거리 측정\n- 초음파 센서: 음파를 이용한 장애물 감지\n\n### 2. 촉각 센서\n- 압력 센서: 물체 접촉 감지\n- 힘/토크 센서: 작용하는 힘과 회전력 측정\n\n### 3. 위치 센서\n- 엔코더: 모터 회전 측정\n- IMU(관성 측정 장치): 가속도, 각속도 측정\n- GPS: 전역 위치 측정', TRUE, 980, '2023-02-10', '2023-07-15', 'user_mod', 'user_mod'),
  
  ('doc_programming', 'robot-programming', '로봇 프로그래밍 입문', '# 로봇 프로그래밍 입문\n\n로봇 프로그래밍은 로봇이 특정 작업을 수행하도록 명령을 내리는 과정입니다.\n\n## 로봇 프로그래밍 언어\n\n### 1. 텍스트 기반 언어\n- C/C++: 하드웨어 제어에 적합\n- Python: 빠른 개발과 AI 통합에 유용\n- Java: 크로스 플랫폼 애플리케이션에 사용\n\n### 2. 그래픽 기반 언어\n- Scratch: 교육용 로봇 프로그래밍\n- Blockly: 블록 기반 시각적 프로그래밍\n\n## ROS (Robot Operating System)\n\nROS는 로봇 소프트웨어 개발을 위한 오픈소스 프레임워크로, 다양한 로봇 하드웨어와 소프트웨어 모듈을 통합하는 데 사용됩니다.', TRUE, 1540, '2023-03-05', '2023-08-10', 'user_jk', 'user_admin'),
  
  ('doc_ai', 'ai-robot-future', '인공지능과 로봇의 미래', '# 인공지능과 로봇의 미래\n\n인공지능 기술의 발전은 로봇 산업에 혁명적인 변화를 가져오고 있습니다.\n\n## 인공지능 로봇의 현재\n\n현재 인공지능 로봇은 다음과 같은 분야에서 활용되고 있습니다:\n- 제조업: 스마트 팩토리, 자동화 생산 라인\n- 의료: 수술 보조, 환자 케어\n- 서비스: 고객 응대, 안내\n- 탐사: 우주, 심해, 재난 지역 탐사\n\n## 미래 전망\n\n인공지능과 로봇 기술의 융합은 다음과 같은 미래를 가져올 것으로 예상됩니다:\n- 완전 자율 주행 차량\n- 인간과 자연스럽게 상호작용하는 소셜 로봇\n- 인간의 능력을 확장하는 웨어러블 로봇\n- 가정 내 일상 생활을 지원하는 가정용 로봇', TRUE, 2100, '2023-04-20', '2023-09-05', 'user_yj', 'user_yj'),
  
  ('doc_arm', 'robotic-arm-control', '로봇 팔 제어 알고리즘', '# 로봇 팔 제어 알고리즘\n\n로봇 팔을 정확하게 제어하기 위해서는 여러 수학적 모델과 알고리즘이 필요합니다.\n\n## 순방향 운동학(Forward Kinematics)\n\n관절 각도가 주어졌을 때 엔드 이펙터의 위치와 방향을 계산하는 방법입니다. 주로 DH 파라미터(Denavit-Hartenberg parameters)를 사용하여 계산합니다.\n\n## 역방향 운동학(Inverse Kinematics)\n\n원하는 엔드 이펙터의 위치와 방향을 달성하기 위한 관절 각도를 계산하는 방법입니다. 해석적 방법과 수치적 방법이 있습니다.\n\n## 궤적 계획(Trajectory Planning)\n\n시작점에서 목표점까지 부드럽게 이동하기 위한 경로를 계획하는 기술입니다. 속도, 가속도, 저크(jerk)를 고려하여 설계합니다.', TRUE, 450, NOW() - INTERVAL '1 HOUR', NOW() - INTERVAL '1 HOUR', 'user_admin', 'user_jk'),
  
  ('doc_navigation', 'robot-navigation', '로봇 내비게이션 시스템', '# 로봇 내비게이션 시스템\n\n로봇이 환경을 인식하고 목적지까지 안전하게 이동하는 기술입니다.\n\n## SLAM (Simultaneous Localization and Mapping)\n\nSLAM은 로봇이 미지의 환경에서 자신의 위치를 파악하면서 동시에 환경의 지도를 작성하는 기술입니다. 주요 알고리즘으로는 Extended Kalman Filter(EKF), Particle Filter, Graph-based SLAM 등이 있습니다.\n\n## 경로 계획(Path Planning)\n\n시작점에서 목표점까지의 최적 경로를 찾는 알고리즘입니다. 대표적인 알고리즘으로는 다음과 같은 것들이 있습니다:\n- A* 알고리즘\n- RRT (Rapidly-exploring Random Tree)\n- 포텐셜 필드 방법\n\n## 장애물 회피(Obstacle Avoidance)\n\n주행 중 예상치 못한 장애물을 감지하고 회피하는 기술입니다. 지역 경로 계획 알고리즘과 반응형 제어 방법을 사용합니다.', TRUE, 320, NOW() - INTERVAL '3 HOURS', NOW() - INTERVAL '3 HOURS', 'user_mod', 'user_ms'),
  
  ('doc_ros2', 'ros2-basics', 'ROS2 기초', '# ROS2 기초\n\nROS2(Robot Operating System 2)는 로봇 애플리케이션 개발을 위한 오픈소스 소프트웨어 프레임워크입니다.\n\n## ROS2의 주요 특징\n\n- **실시간 지원**: 실시간 시스템에서의 사용을 위한 설계\n- **멀티 플랫폼**: Linux, Windows, macOS 지원\n- **보안 강화**: DDS(Data Distribution Service) 기반 통신\n- **모듈식 설계**: 필요한 기능만 선택적으로 사용 가능\n\n## ROS2 기본 개념\n\n### 노드(Nodes)\n\n단일 목적을 가진 실행 가능한 프로세스입니다. 각 노드는 독립적으로 실행되며, 다른 노드와 통신할 수 있습니다.\n\n### 토픽(Topics)\n\n노드 간 데이터를 교환하는 통로입니다. 발행자(Publisher)와 구독자(Subscriber) 모델을 사용합니다.\n\n### 서비스(Services)\n\n요청-응답 방식의 통신 방법입니다. 클라이언트가 서비스 서버에 요청을 보내고 응답을 받습니다.', TRUE, 780, NOW() - INTERVAL '6 HOURS', NOW() - INTERVAL '6 HOURS', 'user_jk', 'user_yj');

-- 위키 문서와 카테고리 연결
INSERT INTO "_DocumentToCategory" ("A", "B")
VALUES
  ('cat_basics', 'doc_basics'),
  ('cat_sensors', 'doc_sensors'),
  ('cat_programming', 'doc_programming'),
  ('cat_ai', 'doc_ai'),
  ('cat_future', 'doc_ai'),
  ('cat_hardware', 'doc_arm'),
  ('cat_software', 'doc_navigation'),
  ('cat_ros', 'doc_ros2'),
  ('cat_programming', 'doc_ros2');

-- 위키 문서 수정 이력
INSERT INTO "WikiRevision" (id, "documentId", content, diff, comment, "createdAt", "createdById")
VALUES
  ('rev_basics_1', 'doc_basics', '# 로봇 공학 기초\n\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문입니다.', NULL, '문서 생성', '2023-01-15', 'user_admin'),
  ('rev_basics_2', 'doc_basics', '# 로봇 공학 기초\n\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문으로, 로봇의 설계, 제작, 운용에 관한 기술을 연구합니다.', '내용 추가', '내용 보강', '2023-06-20', 'user_mod'),
  
  ('rev_sensors_1', 'doc_sensors', '# 로봇 센서의 종류와 활용\n\n로봇이 주변 환경을 인식하기 위한 센서에 대한 설명입니다.', NULL, '문서 생성', '2023-02-10', 'user_mod'),
  ('rev_sensors_2', 'doc_sensors', '# 로봇 센서의 종류와 활용\n\n로봇이 주변 환경을 인식하고 상호작용하기 위해서는 다양한 센서가 필요합니다.', '내용 수정', '도입부 개선', '2023-07-15', 'user_mod'),
  
  ('rev_programming_1', 'doc_programming', '# 로봇 프로그래밍 입문\n\n로봇 프로그래밍 기초에 대한 설명입니다.', NULL, '문서 생성', '2023-03-05', 'user_jk'),
  ('rev_programming_2', 'doc_programming', '# 로봇 프로그래밍 입문\n\n로봇 프로그래밍은 로봇이 특정 작업을 수행하도록 명령을 내리는 과정입니다.', '내용 수정', '정의 명확화', '2023-08-10', 'user_admin');

-- 위키 토론
INSERT INTO "WikiDiscussion" (id, "documentId", title, status, "createdAt", "updatedAt", "createdById")
VALUES
  ('disc_basics_1', 'doc_basics', '로봇의 정의 부분 보강 필요', 'resolved', '2023-05-15', '2023-06-10', 'user_jk'),
  ('disc_sensors_1', 'doc_sensors', '최신 센서 기술 추가 제안', 'open', '2023-07-20', '2023-07-20', 'user_ms'),
  ('disc_ai_1', 'doc_ai', '인공지능 로봇의 윤리적 문제 섹션 추가 필요', 'open', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '2 DAYS', 'user_yj');

-- 위키 토론 댓글
INSERT INTO "WikiComment" (id, "discussionId", content, "createdAt", "updatedAt", "createdById")
VALUES
  ('comment_1', 'disc_basics_1', '로봇의 정의에 자율성과 지능에 대한 부분을 추가하면 좋을 것 같습니다.', '2023-05-15', '2023-05-15', 'user_jk'),
  ('comment_2', 'disc_basics_1', '좋은 제안입니다. 다음 수정에 반영하겠습니다.', '2023-05-16', '2023-05-16', 'user_admin'),
  ('comment_3', 'disc_basics_1', '수정 완료했습니다. 확인 부탁드립니다.', '2023-06-10', '2023-06-10', 'user_mod'),
  
  ('comment_4', 'disc_sensors_1', 'ToF 센서와 이벤트 카메라에 대한 내용을 추가하면 좋을 것 같습니다.', '2023-07-20', '2023-07-20', 'user_ms'),
  ('comment_5', 'disc_sensors_1', '좋은 아이디어입니다. 관련 자료를 찾아보고 추가하겠습니다.', '2023-07-21', '2023-07-21', 'user_mod'),
  
  ('comment_6', 'disc_ai_1', '인공지능 로봇의 윤리적 문제와 관련된 섹션을 추가하면 좋을 것 같습니다. 특히 의사결정 과정의 투명성과 책임 소재에 대한 내용이 필요합니다.', NOW() - INTERVAL '2 DAYS', NOW() - INTERVAL '2 DAYS', 'user_yj'),
  ('comment_7', 'disc_ai_1', '동의합니다. 아사모프의 로봇 3원칙과 현대적 윤리 가이드라인에 대한 내용도 포함하면 좋을 것 같습니다.', NOW() - INTERVAL '1 DAY', NOW() - INTERVAL '1 DAY', 'user_admin');

-- 사용자 기여 내역
INSERT INTO "UserContribution" (id, "userId", type, title, "documentId", "createdAt")
VALUES
  ('contrib_1', 'user_admin', 'WIKI', '위키 문서 "로봇 공학 기초" 생성', 'doc_basics', '2023-01-15'),
  ('contrib_2', 'user_mod', 'WIKI', '위키 문서 "로봇 센서의 종류와 활용" 생성', 'doc_sensors', '2023-02-10'),
  ('contrib_3', 'user_jk', 'WIKI', '위키 문서 "로봇 프로그래밍 입문" 생성', 'doc_programming', '2023-03-05'),
  ('contrib_4', 'user_yj', 'WIKI', '위키 문서 "인공지능과 로봇의 미래" 생성', 'doc_ai', '2023-04-20'),
  ('contrib_5', 'user_mod', 'WIKI', '위키 문서 "로봇 공학 기초" 수정', 'doc_basics', '2023-06-20'),
  ('contrib_6', 'user_admin', 'WIKI', '위키 문서 "로봇 프로그래밍 입문" 수정', 'doc_programming', '2023-08-10'),
  ('contrib_7', 'user_admin', 'WIKI', '위키 문서 "로봇 팔 제어 알고리즘" 생성', 'doc_arm', NOW() - INTERVAL '1 DAY'),
  ('contrib_8', 'user_mod', 'WIKI', '위키 문서 "로봇 내비게이션 시스템" 생성', 'doc_navigation', NOW() - INTERVAL '3 HOURS'),
  ('contrib_9', 'user_jk', 'WIKI', '위키 문서 "ROS2 기초" 생성', 'doc_ros2', NOW() - INTERVAL '6 HOURS');

-- 사용자 기여도 업데이트
UPDATE "User"
SET contribution = 
  CASE id
    WHEN 'user_admin' THEN 100
    WHEN 'user_mod' THEN 50
    WHEN 'user_jk' THEN 30
    WHEN 'user_ms' THEN 5
    WHEN 'user_yj' THEN 15
    ELSE contribution
  END; 