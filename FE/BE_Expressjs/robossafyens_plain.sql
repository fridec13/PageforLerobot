--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'MODERATOR',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Badge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Badge" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Badge" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    path text NOT NULL,
    description text,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Contribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contribution" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contribution" OWNER TO postgres;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    path text NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL,
    "createdById" text NOT NULL,
    "lastModifiedById" text NOT NULL
);


ALTER TABLE public."Document" OWNER TO postgres;

--
-- Name: DocumentChangeRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DocumentChangeRequest" (
    id text NOT NULL,
    "proposedContent" text NOT NULL,
    status text NOT NULL,
    "reviewComment" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "documentId" text NOT NULL,
    "proposedById" text NOT NULL,
    "reviewedById" text
);


ALTER TABLE public."DocumentChangeRequest" OWNER TO postgres;

--
-- Name: DocumentHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DocumentHistory" (
    id text NOT NULL,
    content text NOT NULL,
    version integer NOT NULL,
    "changeDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "documentId" text NOT NULL,
    "editedById" text NOT NULL
);


ALTER TABLE public."DocumentHistory" OWNER TO postgres;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "senderId" text NOT NULL,
    "receiverId" text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "readAt" timestamp(3) without time zone
);


ALTER TABLE public."Message" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contribution integer DEFAULT 0 NOT NULL,
    image text,
    "lastLoginAt" timestamp(3) without time zone,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    title text DEFAULT '새싹'::text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserBadge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserBadge" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "badgeId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserBadge" OWNER TO postgres;

--
-- Name: UserContribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserContribution" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    "documentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserContribution" OWNER TO postgres;

--
-- Name: WikiCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WikiCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WikiCategory" OWNER TO postgres;

--
-- Name: WikiComment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WikiComment" (
    id text NOT NULL,
    "discussionId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL
);


ALTER TABLE public."WikiComment" OWNER TO postgres;

--
-- Name: WikiDiscussion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WikiDiscussion" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL
);


ALTER TABLE public."WikiDiscussion" OWNER TO postgres;

--
-- Name: WikiDocument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WikiDocument" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "lastModifiedById" text NOT NULL
);


ALTER TABLE public."WikiDocument" OWNER TO postgres;

--
-- Name: WikiRevision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WikiRevision" (
    id text NOT NULL,
    "documentId" text NOT NULL,
    content text NOT NULL,
    diff text,
    comment text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text NOT NULL
);


ALTER TABLE public."WikiRevision" OWNER TO postgres;

--
-- Name: _DocumentToCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DocumentToCategory" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_DocumentToCategory" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Badge" (id, name, description, image, "createdAt", "updatedAt") FROM stdin;
badge_001	첫 기여	첫 번째 기여를 완료했습니다!	https://example.com/badges/first_contribution.png	2025-05-13 09:44:15.641	2025-05-13 09:44:15.641
badge_002	전문가	10개 이상의 문서를 작성했습니다!	https://example.com/badges/expert.png	2025-05-13 09:44:15.641	2025-05-13 09:44:15.641
badge_003	RoboSSAFYens	SSAFY 교육생으로 인증되었습니다!	https://example.com/badges/robossafyens.png	2025-05-13 09:44:15.641	2025-05-13 09:44:15.641
badge_004	위키 마스터	10개 이상의 위키 페이지를 작성했습니다	https://api.dicebear.com/7.x/shapes/svg?seed=badge2	2025-05-13 10:37:30.856	2025-05-13 10:37:30.856
badge_005	문서화 달인	5개 이상의 기술 문서를 작성했습니다	https://api.dicebear.com/7.x/shapes/svg?seed=badge3	2025-05-13 10:37:30.856	2025-05-13 10:37:30.856
badge_006	도움의 손길	20개 이상의 질문에 답변했습니다	https://api.dicebear.com/7.x/shapes/svg?seed=badge4	2025-05-13 10:37:30.856	2025-05-13 10:37:30.856
badge_007	인증 전문가	SSAFY 인증을 획득했습니다	https://api.dicebear.com/7.x/shapes/svg?seed=badge5	2025-05-13 10:37:30.856	2025-05-13 10:37:30.856
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, path, description, "parentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Contribution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Contribution" (id, "userId", type, description, points, "createdAt", "updatedAt") FROM stdin;
contrib_wiki_001	usr_admin_001	wiki	인트로 위키 페이지 작성	5	2025-05-06 10:37:30.826	2025-05-06 10:37:30.826
contrib_doc_001	usr_admin_001	document	RoboDK 기술 문서 작성	3	2025-05-08 10:37:30.839	2025-05-08 10:37:30.839
contrib_forum_001	usr_admin_001	forum	질문에 대한 답변 작성	2	2025-05-11 10:37:30.85	2025-05-11 10:37:30.85
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Document" (id, title, content, path, "isPublished", version, "createdAt", "updatedAt", "categoryId", "createdById", "lastModifiedById") FROM stdin;
\.


--
-- Data for Name: DocumentChangeRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DocumentChangeRequest" (id, "proposedContent", status, "reviewComment", "createdAt", "reviewedAt", "documentId", "proposedById", "reviewedById") FROM stdin;
\.


--
-- Data for Name: DocumentHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DocumentHistory" (id, content, version, "changeDescription", "createdAt", "documentId", "editedById") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Message" (id, "senderId", "receiverId", content, read, "createdAt", "readAt") FROM stdin;
msg_welcome_001	usr_admin_001	usr_admin_001	프로필 페이지에 오신 것을 환영합니다! 이곳에서 기여 내역과 메시지를 확인할 수 있습니다.	t	2025-05-10 10:37:32.428	2025-05-13 01:41:39.108
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, "createdAt", contribution, image, "lastLoginAt", password, role, title, "updatedAt") FROM stdin;
f5751229-6794-4799-8ce9-c49bb603f608	c205@robossafyens.com	c205	2025-05-12 08:06:02.586	0	https://api.dicebear.com/7.x/lorelei/svg?seed=1747037162584	2025-05-13 00:14:21.035	$2b$10$dCdxFxL.y3j9tHqRs4h3jOHzLKf02rMyy6j12pwLLY5tdW.B489i.	USER	새싹	2025-05-13 00:14:21.036
4897e221-d8b8-4135-96ba-1b21ebe6cf60	test@robossafyens.com	테스트	2025-05-13 01:03:04.737	0	https://api.dicebear.com/7.x/lorelei/svg?seed=1747098184734	\N	$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba	USER	새싹	2025-05-13 01:03:04.737
usr_test_001	user@robossafyens.com	테스트유저	2025-05-13 09:44:01.832	10	https://api.dicebear.com/7.x/lorelei/svg?seed=user123	\N	$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba	USER	로봇 애호가	2025-05-13 09:44:01.832
usr_admin_001	admin@robossafyens.com	관리자	2025-05-13 09:44:01.814	100	https://api.dicebear.com/7.x/lorelei/svg?seed=admin123	2025-05-13 01:42:19.485	$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba	ADMIN	RoboSSAFYens	2025-05-13 01:42:19.487
d20662cb-45b3-45be-8b55-4483ea0d7b66	jk@robossafyens.com	김정국	2025-05-13 02:42:40.154	30	https://api.dicebear.com/7.x/lorelei/svg?seed=1747104160153	\N	$2b$10$ows.nP.ODb25YQ33FzzL6OKcuV1PcIHZZjcyY2wBt2.YxvIkPUG3G	USER	새싹	2025-05-13 02:42:40.154
01f89a10-b2de-43da-a1ce-010a96b997e6	ms@robossafyens.com	이민성	2025-05-13 02:43:12.589	5	https://api.dicebear.com/7.x/lorelei/svg?seed=1747104192588	\N	$2b$10$A2Gte5i2tzU.TTnJsqMuoe/riBdG.xGSyUdv69nNzlqLap498XNM6	USER	새싹	2025-05-13 02:43:12.589
usr_mod_001	mod@robossafyens.com	모더레이터	2025-05-13 09:44:02.601	50	https://api.dicebear.com/7.x/lorelei/svg?seed=mod123	2025-05-13 04:25:21.31	$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba	MODERATOR	로봇 전문가	2025-05-13 04:25:21.312
1ac62255-19bf-44c8-8237-ff8bcaac777d	yj@robossafyens.com	박윤정	2025-05-13 02:43:50.254	15	https://api.dicebear.com/7.x/lorelei/svg?seed=1747104230253	2025-05-13 06:57:54.565	$2b$10$1n.rfdlrjNvFL0rhB0BhzeP2C/WxIhOoJvhFjaWOV.W9EXYvpkvCO	USER	새싹	2025-05-13 06:57:54.566
\.


--
-- Data for Name: UserBadge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserBadge" (id, "userId", "badgeId", "createdAt") FROM stdin;
ub_001	usr_admin_001	badge_001	2025-05-13 09:44:26.569
ub_002	usr_admin_001	badge_002	2025-05-13 09:44:26.569
ub_003	usr_admin_001	badge_003	2025-05-13 09:44:26.569
ub_004	usr_mod_001	badge_001	2025-05-13 09:44:26.587
ub_005	usr_mod_001	badge_003	2025-05-13 09:44:26.587
ub_006	usr_test_001	badge_001	2025-05-13 09:44:27.147
\.


--
-- Data for Name: UserContribution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserContribution" (id, "userId", type, title, "documentId", "createdAt") FROM stdin;
contrib_1	usr_admin_001	WIKI	위키 문서 "로봇 공학 기초" 생성	doc_basics	2023-01-15 00:00:00
contrib_2	usr_mod_001	WIKI	위키 문서 "로봇 센서의 종류와 활용" 생성	doc_sensors	2023-02-10 00:00:00
contrib_3	d20662cb-45b3-45be-8b55-4483ea0d7b66	WIKI	위키 문서 "로봇 프로그래밍 입문" 생성	doc_programming	2023-03-05 00:00:00
contrib_4	1ac62255-19bf-44c8-8237-ff8bcaac777d	WIKI	위키 문서 "인공지능과 로봇의 미래" 생성	doc_ai	2023-04-20 00:00:00
contrib_5	usr_mod_001	WIKI	위키 문서 "로봇 공학 기초" 수정	doc_basics	2023-06-20 00:00:00
contrib_6	usr_admin_001	WIKI	위키 문서 "로봇 프로그래밍 입문" 수정	doc_programming	2023-08-10 00:00:00
contrib_7	usr_admin_001	WIKI	위키 문서 "로봇 팔 제어 알고리즘" 생성	doc_arm	2025-05-12 11:51:34.955
contrib_8	usr_mod_001	WIKI	위키 문서 "로봇 내비게이션 시스템" 생성	doc_navigation	2025-05-13 08:51:34.955
contrib_9	d20662cb-45b3-45be-8b55-4483ea0d7b66	WIKI	위키 문서 "ROS2 기초" 생성	doc_ros2	2025-05-13 05:51:34.955
77656223-5f94-48b2-a949-1a2bb127fc90	usr_mod_001	WIKI	위키 문서 "인공지능과 로봇의 미래" 수정	doc_ai	2025-05-13 04:22:09.756
962284a2-7c05-4a63-b146-17d504326a43	usr_mod_001	WIKI	위키 문서 "인공지능과 로봇의 미래" 수정	doc_ai	2025-05-13 04:28:11.426
24472340-4e81-4efc-b009-7e5bebac828a	usr_mod_001	WIKI	위키 문서 "인공지능과 로봇의 미래" 수정	doc_ai	2025-05-13 04:49:57.611
0dfe9608-5b1f-4c7f-b239-6d6609c0d143	usr_mod_001	WIKI	위키 문서 "CNN" 생성	e0aa61d9-a093-4bb8-9e71-d1c9c516ac96	2025-05-13 05:09:39.628
\.


--
-- Data for Name: WikiCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WikiCategory" (id, name, slug, description, "parentId", "createdAt", "updatedAt") FROM stdin;
cat_basics	기초 지식	basics	로봇 공학의 기초 개념	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_hardware	하드웨어	hardware	로봇 하드웨어 관련	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_software	소프트웨어	software	로봇 소프트웨어 관련	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_ai	인공지능	ai	로봇 인공지능 기술	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_sensors	센서 기술	sensors	로봇 센서 관련 기술	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_applications	응용 분야	applications	로봇 응용 분야	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_programming	프로그래밍	programming	로봇 프로그래밍	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_future	미래 기술	future	로봇 미래 기술	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
cat_ros	ROS	ros	Robot Operating System	\N	2025-05-13 11:51:34.835	2025-05-13 11:51:34.835
\.


--
-- Data for Name: WikiComment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WikiComment" (id, "discussionId", content, "createdAt", "updatedAt", "createdById") FROM stdin;
comment_1	disc_basics_1	로봇의 정의에 자율성과 지능에 대한 부분을 추가하면 좋을 것 같습니다.	2023-05-15 00:00:00	2023-05-15 00:00:00	d20662cb-45b3-45be-8b55-4483ea0d7b66
comment_2	disc_basics_1	좋은 제안입니다. 다음 수정에 반영하겠습니다.	2023-05-16 00:00:00	2023-05-16 00:00:00	usr_admin_001
comment_3	disc_basics_1	수정 완료했습니다. 확인 부탁드립니다.	2023-06-10 00:00:00	2023-06-10 00:00:00	usr_mod_001
comment_4	disc_sensors_1	ToF 센서와 이벤트 카메라에 대한 내용을 추가하면 좋을 것 같습니다.	2023-07-20 00:00:00	2023-07-20 00:00:00	01f89a10-b2de-43da-a1ce-010a96b997e6
comment_5	disc_sensors_1	좋은 아이디어입니다. 관련 자료를 찾아보고 추가하겠습니다.	2023-07-21 00:00:00	2023-07-21 00:00:00	usr_mod_001
comment_6	disc_ai_1	인공지능 로봇의 윤리적 문제와 관련된 섹션을 추가하면 좋을 것 같습니다. 특히 의사결정 과정의 투명성과 책임 소재에 대한 내용이 필요합니다.	2025-05-11 11:51:34.941	2025-05-11 11:51:34.941	1ac62255-19bf-44c8-8237-ff8bcaac777d
comment_7	disc_ai_1	동의합니다. 아사모프의 로봇 3원칙과 현대적 윤리 가이드라인에 대한 내용도 포함하면 좋을 것 같습니다.	2025-05-12 11:51:34.941	2025-05-12 11:51:34.941	usr_admin_001
\.


--
-- Data for Name: WikiDiscussion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WikiDiscussion" (id, "documentId", title, status, "createdAt", "updatedAt", "createdById") FROM stdin;
disc_basics_1	doc_basics	로봇의 정의 부분 보강 필요	resolved	2023-05-15 00:00:00	2023-06-10 00:00:00	d20662cb-45b3-45be-8b55-4483ea0d7b66
disc_sensors_1	doc_sensors	최신 센서 기술 추가 제안	open	2023-07-20 00:00:00	2023-07-20 00:00:00	01f89a10-b2de-43da-a1ce-010a96b997e6
disc_ai_1	doc_ai	인공지능 로봇의 윤리적 문제 섹션 추가 필요	open	2025-05-11 11:51:34.924	2025-05-11 11:51:34.924	1ac62255-19bf-44c8-8237-ff8bcaac777d
\.


--
-- Data for Name: WikiDocument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WikiDocument" (id, slug, title, content, "isPublished", "viewCount", "createdAt", "updatedAt", "createdById", "lastModifiedById") FROM stdin;
doc_sensors	robot-sensors	로봇 센서의 종류와 활용	# 로봇 센서의 종류와 활용\\n\\n로봇이 주변 환경을 인식하고 상호작용하기 위해서는 다양한 센서가 필요합니다.\\n\\n## 센서의 종류\\n\\n### 1. 시각 센서\\n- 카메라: RGB, 스테레오, 열화상 등\\n- 라이다(LiDAR): 레이저를 이용한 거리 측정\\n- 초음파 센서: 음파를 이용한 장애물 감지\\n\\n### 2. 촉각 센서\\n- 압력 센서: 물체 접촉 감지\\n- 힘/토크 센서: 작용하는 힘과 회전력 측정\\n\\n### 3. 위치 센서\\n- 엔코더: 모터 회전 측정\\n- IMU(관성 측정 장치): 가속도, 각속도 측정\\n- GPS: 전역 위치 측정	t	980	2023-02-10 00:00:00	2023-07-15 00:00:00	usr_mod_001	usr_mod_001
doc_basics	robot-basics	로봇 공학 기초	# 로봇 공학 기초\\n\\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문으로, 로봇의 설계, 제작, 운용에 관한 기술을 연구합니다.\\n\\n## 로봇의 정의\\n\\n로봇은 프로그래밍 가능한 기계 장치로, 다양한 작업을 자동으로 수행할 수 있습니다. 로봇은 센서를 통해 환경을 인식하고, 프로세서로 정보를 처리하며, 액추에이터를 통해 물리적 행동을 수행합니다.\\n\\n## 로봇의 역사\\n\\n로봇이라는 용어는 1920년 체코 작가 카렐 차페크의 희곡 "R.U.R."에서 처음 등장했습니다. 현대적 의미의 로봇 개발은 1950년대부터 시작되었으며, 산업용 로봇은 1960년대 처음 도입되었습니다.	t	1256	2023-01-15 00:00:00	2025-05-13 03:11:16.022	usr_admin_001	usr_mod_001
e0aa61d9-a093-4bb8-9e71-d1c9c516ac96	cnn	CNN	===마크다운이 될리가 없잖아===	t	6	2025-05-13 05:09:39.597	2025-05-13 05:30:58.206	usr_mod_001	usr_mod_001
doc_arm	robotic-arm-control	로봇 팔 제어 알고리즘	# 로봇 팔 제어 알고리즘\\n\\n로봇 팔을 정확하게 제어하기 위해서는 여러 수학적 모델과 알고리즘이 필요합니다.\\n\\n## 순방향 운동학(Forward Kinematics)\\n\\n관절 각도가 주어졌을 때 엔드 이펙터의 위치와 방향을 계산하는 방법입니다. 주로 DH 파라미터(Denavit-Hartenberg parameters)를 사용하여 계산합니다.\\n\\n## 역방향 운동학(Inverse Kinematics)\\n\\n원하는 엔드 이펙터의 위치와 방향을 달성하기 위한 관절 각도를 계산하는 방법입니다. 해석적 방법과 수치적 방법이 있습니다.\\n\\n## 궤적 계획(Trajectory Planning)\\n\\n시작점에서 목표점까지 부드럽게 이동하기 위한 경로를 계획하는 기술입니다. 속도, 가속도, 저크(jerk)를 고려하여 설계합니다.	t	458	2025-05-13 10:51:34.871	2025-05-13 05:31:06.739	usr_admin_001	d20662cb-45b3-45be-8b55-4483ea0d7b66
doc_ai	ai-robot-future	인공지능과 로봇의 미래	[[분류:갤럭시 S25]]\n[include(틀:공개, 대상=스마트폰, 주제=스마트폰, 회사= 삼성전자)]\n[include(틀:삼성 갤럭시 라인업/플래그십)]\n[include(틀:삼성 갤럭시 S 시리즈)]\n||<-2><tablealign=center><tablebordercolor=#191919,#666><tablewidth=700px><tablebgcolor=#fff,#000> [br] {{{#000,#fff {{{+5 '''Galaxy S25 Edge'''}}}}}} [br] {{{#000,#fff {{{-3 '''SM-S937'''}}}}}} [br] {{{#333,#e5e5e5 {{{-1 '''Beyond Slim'''}}}}}} [br] [br] ||\n||<-2><bgcolor=#191919,#000> [[https://www.samsung.com/sec/smartphones/galaxy-s25-edge/|{{{#fff 한국 삼성전자 갤럭시 S25 엣지 마이크로 사이트}}}]] ||\n[목차]\n[clearfix]\n== 개요 ==\n[[삼성전자]]가 [[2025년]] [[5월 13일]]에 공개한 [[갤럭시 S 시리즈]] 소속 플래그십 [[Android]] [[스마트폰]]이다. 시리즈 코드네임은 '''[[과학혁명의 구조#s-2.2|Paradigm]]'''.\n\n== 사양 ==\n사양이 두 가지 이상으로 나뉘는 경우, 한국 내수용에 해당하는 사양에 {{{#!wiki style="display: inline; padding: 1px 3px 2px; background: #fff5a0" dark-style="display: inline; padding: 1px 3px 2px; background: #5f5500"\n'''노란색 바탕'''}}} 혹은 {{{#green '''초록색 볼드체'''}}}로 표기.\n{{{#!wiki style="word-break: keep-all"\n||<tablealign=center><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff><width=8%> '''[[SoC|{{{#fff 프로세서}}}]]''' ||<width=92%>[[퀄컴 스냅드래곤/8 시리즈/8 Elite#8 Elite (1세대)|퀄컴 스냅드래곤 8 Elite for Galaxy Mobile Platform {{{-3 (SM8750-AB)}}}]][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 구성 내용 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> [[CPU|{{{#fff CPU}}}]] ||2 × [[퀄컴/마이크로아키텍처#Oryon-L (2세대)|Oryon-L (2세대)]] 4.47 GHz[br]6 × [[퀄컴/마이크로아키텍처#Oryon-M (2세대)|Oryon-M (2세대)]] 3.53 GHz ||\n|| [[GPU|{{{#fff GPU}}}]] ||[[퀄컴 Adreno GPU#Adreno 830|퀄컴 Adreno 830]] 1.2 GHz||\n|| [[NPU|{{{#fff NPU}}}]] ||[[퀄컴]] Hexagon V79 ||\n|| 통신 모뎀 ||[[퀄컴 스냅드래곤/통신 모뎀 솔루션#스냅드래곤 X80 5G 모뎀|퀄컴 스냅드래곤 X80 5G 모뎀]] ||\n|| 제조 공정 ||[[TSMC/공정 노드 추이#3nm|TSMC N3E]] ||}}}}}}}}} ||\n|| '''[[기억 장치|{{{#fff 메모리}}}]]''' ||12 GB [[DRAM#LPDDR5|LPDDR5X SDRAM]] 9,600 MT/s[br]256 / 512 GB [[유니버설 플래시 스토리지#버전별 특징(속도 및 대역폭, IOPS)|UFS 4.0]] 내장 메모리 ||\n|| '''[[디스플레이|{{{#fff 디스[br]플레이}}}]]''' ||6.7인치 {{{-2 (169.1 mm)}}}[* 인치 환산 시 6.66인치] 19.5:9 비율 [[해상도/목록#s-2.5.2|3120 × 1440]] Dynamic [[AMOLED]] 2X [[Infinity-O Display]] {{{-2 (516 ppi)}}}[br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 세부 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 공급사 ||[[삼성디스플레이]] ||\n|| 픽셀배열 ||다이아몬드 픽셀 {{{-2 ([[펜타일#RG-BG 펜타일 서브픽셀|RG-BG 서브픽셀]])}}} ||\n|| 패널정보 ||'''[[HOP]] 3.0''', [[AMOLED]] {{{-2 (M13 유기재료)}}} ||\n|| 색 영역 ||[[sRGB]], [[DCI-P3]] ||\n|| 명암비 ||5,000,000:1 ||\n|| 재생빈도 ||1-120 Hz 가변형 ||\n|| 부가정보 ||[[고릴라 글래스]] 세라믹 2, [[HDR10+]], [[HLG]] 지원 ||}}}}}}}}}[br]멀티터치 지원 정전식 [[터치 스크린]][br](최대 밝기 1,500 nits HBM / 2,600 nits HDR10+) ||\n|| '''[[이동통신|{{{#fff 이동통신}}}]]''' ||{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 5G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[NR]][*NM NSA & SA] 3GPP Rel.17 & 18 Sub-6 FDD & TDD ↓6[[캐리어 어그리게이션|CA]] ||\n|| 선택 지원 ||[[NR]][*NM NSA & SA] 3GPP Rel.17 & 18 Sub-6 FDD & TDD / [[mmWave]] TDD ↓8[[캐리어 어그리게이션|CA]] ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 4G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent>[[LTE]] FDD & [[LTE-TDD|TDD]] ↓?[[캐리어 어그리게이션|CA]] Cat.?? / ?CA Cat.??↑[br][[VoLTE]] 지원 ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 3G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[WCDMA|UMTS & HSDPA & HSUPA]] & [[HSPA+]] ↓42.2 Mbps / 5.76 Mbps↑[br][[Wideband Audio]] 음성통화·[[영상통화]] 지원 ||\n||<|2> 선택 지원 ||[[CDMA2000#EV-DO(=EV-DO Rel.0)|CDMA2000 1xEV-DO Rel.0 & Rev.A]] ↓3.1 Mbps / 1.8 Mbps↑[br][[영상통화]] 지원 ||\n||[[TD-SCDMA|TD-SCDMA & TD-HSDPA & TD-HSUPA]] ↓2.8 Mbps / 2.2 Mbps↑ ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 2G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[GSM|GSM & GPRS & EDGE]] ↓384 Kbps[br]음성통화 지원 ||\n|| 선택 지원 ||[[CDMA]] & [[CDMA2000#1XRTT|CDMA2000 1xRTT]] ↓144 Kbps[br]음성통화 지원 ||}}}}}}}}} ||\n|| '''근접통신''' ||[[Wi-Fi]] [[802.11b|1]]/[[802.11a|2]]/[[802.11g|3]]/[[Wi-Fi 4|4]]/[[Wi-Fi 5|5]]/[[Wi-Fi 6|6]]/[[Wi-Fi 6E|6E]]/[[Wi-Fi 7|7]], [[블루투스#5.4|블루투스 5.4]], [[NFC]][* 일부 지역에서 [[FeliCa]] 지원], [[마그네틱 스트라이프#MST/WMC|{{{#Green '''MST'''}}}]][* 한국 내수용만 지원], [[UWB]] ||\n|| '''[[GNSS|{{{#fff 위성항법}}}]]''' ||[[GPS|GPS & A-GPS]], [[GLONASS]], [[갈릴레오#GNSS|Galileo]], [[Beidou]], [[QZSS]] ||\n|| '''[[카메라|{{{#fff 카메라}}}]]''' ||전면 듀얼픽셀 [[PDAF]] 지원 1,200만 화소 (ƒ/2.2 & 80°)[br]후면 2렌즈 카메라 및 [[LED]] [[플래시(카메라)|플래시]][* 초광각 촬영 시 플래시 미지원] {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 후면 카메라 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 초광각 || 1200만 화소 || ƒ/2.2 || 120° || ||<|4> [[능동식 AF|레이저 AF]] || 듀얼픽셀 [[PDAF]] ||\n|| 광각[br]{{{-3 (기본)}}} || 2억 화소 || ƒ/1.7 || 85° ||<|3> [[OIS]] || 다방향 [[PDAF]] ||}}}}}}}}} ||\n|| '''[[배터리|{{{#fff 배터리}}}]]''' ||내장형 [[리튬 이온 배터리|Li-Ion]] 3,900 mAh[* 3.88 V - 3,900 mAh (19.02 Wh)][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 충전 기술 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 유선 ||[[삼성전자]] [[Super Fast Charging#2.0|Super Fast Charging]] - [[USB PD#USB PD rev.3.x / PPS|USB PD PPS]] (25 W)[br][[삼성전자]] [[Adaptive Fast Charging]] (15 W)[br][[USB PD#USB PD rev.2 / PDO|USB PD 1.0~2.0]] (10~15 W) ||\n|| 무선 ||[[삼성전자]] [[Fast Wireless Charging#2.0|Fast Wireless Charging 2.0]] (15 W)[br][[Qi#Qi2|Qi 2.1.0]][*Qi2-Ready 자석 부착 기능은 별도의 악세사리를 통해 사용해야 한다.] (15 W) ||}}}}}}}}} ||\n|| '''[[운영체제|{{{#fff 운영체제}}}]]''' ||[[Android]] [[Android 15|15]] ||\n|| '''[[사용자 경험|{{{#fff UX}}}]]''' ||[[One UI]] [[One UI 7|7.0]] ||\n|| '''규격''' ||75.5 × 158.2 × 5.8 mm, 163 g ||\n|| '''색상''' ||'''티타늄 아이시블루''', '''티타늄 실버''', '''티타늄 제트블랙'''[* 삼성닷컴 전용 컬러는 미출시] {{{#!wiki style="text-align: right; margin: calc(-1em / 4) -8px -5px 0"\n{{{#!wiki style="font: 0.6em/1 serif; font-family: revert"\n제품 공개 당시 같이 공개된 기본 색상에 '''볼드''' 처리}}}}}} ||\n|| '''단자 정보''' ||[[USB Type-C]] × 1 {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 지원 프로토콜 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent>[[USB 3.2 Gen 1x1]] (5 Gbps)[br][[DisplayPort]] 1.2 ||}}}}}}}}} ||\n|| '''[[삼성 갤럭시/생체 인식|{{{#fff 생체인식}}}]]''' ||[[지문인식]] - 초음파 방식 (디스플레이 내장)[br][[생체 인식#종류|얼굴인식]] - 전면 카메라 인식 방식 ||\n|| '''기타''' ||[[eSIM]] 연계 듀얼심 지원, [[IP등급|IP68]] 등급 [[방수]]·방진 지원, [[AKG]] 튜닝 및 [[Dolby Atmos]] 기술 탑재, [[FM방송|FM 라디오]] 지원[*R [[삼성 EO 시리즈#EO-IC100|FM라디오 모듈이 내장된 별도의 USB Type-C 이어폰]]을 연결해야 한다.][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 탑재 센서 정보 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent> 지문, 가속도, 기압, 자이로, 지자기, 조도, 근접, 홀 ||}}}}}}}}} ||}}}\n\n== 출시 ==\n=== 한국 시장 ===\n||<tablealign=center><tablebordercolor=#000,#666><tablebgcolor=#fff,#1c1d1f><rowbgcolor=#000><rowcolor=#000><bgcolor=#000><tablewidth=700><width=50%> '''{{{#white 256 GB}}}''' ||<bgcolor=#000> '''{{{#white 512 GB}}}''' ||\n||<rowbgcolor=#fff,#1c1d1f><rowcolor=#000,#fff> 1,496,000 원 || 1,639,000 원 ||\n\n[[대한민국]]에선 [[2025년]] [[5월 14일]]부터 [[5월 20일]]까지 사전예약[*공홈혜택 삼성닷컴 자급제 기준 더블 스토리지 제공, 3% 할인, 삼성카드 결제 한정 (3% 청구할인, 24개월 무이자)]을 진행한 후, [[5월 23일]]에 정식 출시한다.\n\n== [[갤럭시 S25/공개 전 루머#갤럭시 S25 Edge|공개 전 루머]] ==\n[include(틀:상세 내용, 문서명=갤럭시 S25/공개 전 루머)]\n\n== 기타 ==\n * 2016년 [[갤럭시 S7 엣지]] 이후 "엣지"라는 네임이 9년 만에 다시 사용되었다. 다만 엣지 디스플레이를 강조한 S7 엣지와는 다르게, 플랫 디스플레이를 탑재하였고 경량화와 두께 감소에 초점을 둔 모델인 것이 차이점이다.\n\n * 원래 4월 16일 공개 예정이었지만, 모종의 이유로 5월 13일로 밀렸다.\n\n * 간단하게 성능을 요약하자면 [[S25+]]와 같은 디스플레이 크기, [[S25]]와 거의 비슷한 무게, [[S25 울트라]]와 동일한 성능의 메인 카메라(대신 카메라 수는 2개), S25보다 적은 배터리 용량이다. 크고 가벼우며 카메라도 좋은 모델치고 140만원대의 가격도 꽤나 괜찮게 나왔다는 평가를 받고 있다. S25의 각 모델들의 최대 장점을 하나씩 가져와 합친 모델이지만 Z플립보다도 미세하게 적은 배터리 용량이 유일한 단점이다.[* 기존 [[갤럭시 Z 플립|Z 플립]]과 [[갤럭시 Z 플립3|Z 플립3]]에서 이런 특징이 좋지 못한 전성비와 더해져서 큰 단점으로 지적됐는데, 이번에는 칩셋의 효율이 부족한 용량을 커버해줄 수 있을지 주목된다. 당장 아이폰 16e도 칩셋은 아니지만 새로운 통신모뎀 덕에 배터리 타임을 늘릴 수 있었으니. ]	t	2200	2023-04-20 00:00:00	2025-05-13 07:30:06.89	1ac62255-19bf-44c8-8237-ff8bcaac777d	usr_mod_001
doc_programming	robot-programming	로봇 프로그래밍 입문	# 로봇 프로그래밍 입문\\n\\n로봇 프로그래밍은 로봇이 특정 작업을 수행하도록 명령을 내리는 과정입니다.\\n\\n## 로봇 프로그래밍 언어\\n\\n### 1. 텍스트 기반 언어\\n- C/C++: 하드웨어 제어에 적합\\n- Python: 빠른 개발과 AI 통합에 유용\\n- Java: 크로스 플랫폼 애플리케이션에 사용\\n\\n### 2. 그래픽 기반 언어\\n- Scratch: 교육용 로봇 프로그래밍\\n- Blockly: 블록 기반 시각적 프로그래밍\\n\\n## ROS (Robot Operating System)\\n\\nROS는 로봇 소프트웨어 개발을 위한 오픈소스 프레임워크로, 다양한 로봇 하드웨어와 소프트웨어 모듈을 통합하는 데 사용됩니다.	t	1546	2023-03-05 00:00:00	2025-05-13 07:30:13.357	d20662cb-45b3-45be-8b55-4483ea0d7b66	usr_admin_001
doc_ros2	ros2-basics	ROS2 기초	# ROS2 기초\\n\\nROS2(Robot Operating System 2)는 로봇 애플리케이션 개발을 위한 오픈소스 소프트웨어 프레임워크입니다.\\n\\n## ROS2의 주요 특징\\n\\n- **실시간 지원**: 실시간 시스템에서의 사용을 위한 설계\\n- **멀티 플랫폼**: Linux, Windows, macOS 지원\\n- **보안 강화**: DDS(Data Distribution Service) 기반 통신\\n- **모듈식 설계**: 필요한 기능만 선택적으로 사용 가능\\n\\n## ROS2 기본 개념\\n\\n### 노드(Nodes)\\n\\n단일 목적을 가진 실행 가능한 프로세스입니다. 각 노드는 독립적으로 실행되며, 다른 노드와 통신할 수 있습니다.\\n\\n### 토픽(Topics)\\n\\n노드 간 데이터를 교환하는 통로입니다. 발행자(Publisher)와 구독자(Subscriber) 모델을 사용합니다.\\n\\n### 서비스(Services)\\n\\n요청-응답 방식의 통신 방법입니다. 클라이언트가 서비스 서버에 요청을 보내고 응답을 받습니다.	t	784	2025-05-13 05:51:34.871	2025-05-13 05:31:24.915	d20662cb-45b3-45be-8b55-4483ea0d7b66	1ac62255-19bf-44c8-8237-ff8bcaac777d
doc_navigation	robot-navigation	로봇 내비게이션 시스템	# 로봇 내비게이션 시스템\\n\\n로봇이 환경을 인식하고 목적지까지 안전하게 이동하는 기술입니다.\\n\\n## SLAM (Simultaneous Localization and Mapping)\\n\\nSLAM은 로봇이 미지의 환경에서 자신의 위치를 파악하면서 동시에 환경의 지도를 작성하는 기술입니다. 주요 알고리즘으로는 Extended Kalman Filter(EKF), Particle Filter, Graph-based SLAM 등이 있습니다.\\n\\n## 경로 계획(Path Planning)\\n\\n시작점에서 목표점까지의 최적 경로를 찾는 알고리즘입니다. 대표적인 알고리즘으로는 다음과 같은 것들이 있습니다:\\n- A* 알고리즘\\n- RRT (Rapidly-exploring Random Tree)\\n- 포텐셜 필드 방법\\n\\n## 장애물 회피(Obstacle Avoidance)\\n\\n주행 중 예상치 못한 장애물을 감지하고 회피하는 기술입니다. 지역 경로 계획 알고리즘과 반응형 제어 방법을 사용합니다.	t	324	2025-05-13 08:51:34.871	2025-05-13 05:31:19.626	usr_mod_001	01f89a10-b2de-43da-a1ce-010a96b997e6
\.


--
-- Data for Name: WikiRevision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WikiRevision" (id, "documentId", content, diff, comment, "createdAt", "createdById") FROM stdin;
rev_basics_1	doc_basics	# 로봇 공학 기초\\n\\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문입니다.	\N	문서 생성	2023-01-15 00:00:00	usr_admin_001
rev_basics_2	doc_basics	# 로봇 공학 기초\\n\\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문으로, 로봇의 설계, 제작, 운용에 관한 기술을 연구합니다.	내용 추가	내용 보강	2023-06-20 00:00:00	usr_mod_001
rev_sensors_1	doc_sensors	# 로봇 센서의 종류와 활용\\n\\n로봇이 주변 환경을 인식하기 위한 센서에 대한 설명입니다.	\N	문서 생성	2023-02-10 00:00:00	usr_mod_001
rev_sensors_2	doc_sensors	# 로봇 센서의 종류와 활용\\n\\n로봇이 주변 환경을 인식하고 상호작용하기 위해서는 다양한 센서가 필요합니다.	내용 수정	도입부 개선	2023-07-15 00:00:00	usr_mod_001
rev_programming_1	doc_programming	# 로봇 프로그래밍 입문\\n\\n로봇 프로그래밍 기초에 대한 설명입니다.	\N	문서 생성	2023-03-05 00:00:00	d20662cb-45b3-45be-8b55-4483ea0d7b66
rev_programming_2	doc_programming	# 로봇 프로그래밍 입문\\n\\n로봇 프로그래밍은 로봇이 특정 작업을 수행하도록 명령을 내리는 과정입니다.	내용 수정	정의 명확화	2023-08-10 00:00:00	usr_admin_001
560cde19-5907-4447-8296-f40af5475cbc	doc_ai	# 인공지능과 로봇의 미래\\n\\n인공지능 기술의 발전은 로봇 산업에 혁명적인 변화를 가져오고 있습니다.\\n\\n## 인공지능 로봇의 현재\\n\\n현재 인공지능 로봇은 다음과 같은 분야에서 활용되고 있습니다:\\n- 제조업: 스마트 팩토리, 자동화 생산 라인\\n- 의료: 수술 보조, 환자 케어\\n- 서비스: 고객 응대, 안내\\n- 탐사: 우주, 심해, 재난 지역 탐사\\n\\n## 미래 전망\\n\\n인공지능과 로봇 기술의 융합은 다음과 같은 미래를 가져올 것으로 예상됩니다:\\n- 완전 자율 주행 차량\\n- 인간과 자연스럽게 상호작용하는 소셜 로봇\\n- 인간의 능력을 확장하는 웨어러블 로봇\\n- 가정 내 일상 생활을 지원하는 가정용 로봇	\N	내용 추가	2025-05-13 04:15:31.639	usr_mod_001
75e33b12-a943-4d76-91eb-ef528a65c045	doc_ai	# 인공지능과 로봇의 미래\\n\\n인공지능 기술의 발전은 로봇 산업에 혁명적인 변화를 가져오고 있습니다.\\n\\n## 인공지능 로봇의 현재\\n\\n현재 인공지능 로봇은 다음과 같은 분야에서 활용되고 있습니다:\\n- 제조업: 스마트 팩토리, 자동화 생산 라인\\n- 의료: 수술 보조, 환자 케어\\n- 서비스: 고객 응대, 안내\\n- 탐사: 우주, 심해, 재난 지역 탐사\\n\\n## 미래 전망\\n\\n인공지능과 로봇 기술의 융합은 다음과 같은 미래를 가져올 것으로 예상됩니다:\\n- 완전 자율 주행 차량\\n- 인간과 자연스럽게 상호작용하는 소셜 로봇\\n- 인간의 능력을 확장하는 웨어러블 로봇\\n- 가정 내 일상 생활을 지원하는 가정용 로봇	\N	내용 추가	2025-05-13 04:18:36.256	usr_mod_001
4df4148a-7b32-45f7-b693-e746b66c92a5	doc_ai	# 인공지능과 로봇의 미래\\n\\n인공지능 기술의 발전은 로봇 산업에 혁명적인 변화를 가져오고 있습니다.\\n\\n## 인공지능 로봇의 현재\\n\\n현재 인공지능 로봇은 다음과 같은 분야에서 활용되고 있습니다:\\n- 제조업: 스마트 팩토리, 자동화 생산 라인\\n- 의료: 수술 보조, 환자 케어\\n- 서비스: 고객 응대, 안내\\n- 탐사: 우주, 심해, 재난 지역 탐사\\n\\n## 미래 전망\\n\\n인공지능과 로봇 기술의 융합은 다음과 같은 미래를 가져올 것으로 예상됩니다:\\n- 완전 자율 주행 차량\\n- 인간과 자연스럽게 상호작용하는 소셜 로봇\\n- 인간의 능력을 확장하는 웨어러블 로봇\\n- 가정 내 일상 생활을 지원하는 가정용 로봇	\N	내용 추가	2025-05-13 04:22:09.75	usr_mod_001
b06ba888-2672-4007-be87-fbbdc9b07681	doc_ai	== 인공지능과 로봇의 미래 ==\n인공지능(AI)과 로봇 기술의 발전은 우리 사회의 모든 영역에 혁명적인 변화를 가져오고 있습니다. 이 문서에서는 현재 기술 동향과 미래 전망에 대해 살펴봅니다.\n=== 현재의 인공지능 로봇 기술 ===\n현재 인공지능 로봇 기술은 다양한 분야에서 활용되고 있습니다:\n'''제조업''': 스마트 팩토리, 자동화 생산 라인, 품질 관리\n'''의료''': 수술 보조 로봇, 환자 케어, 진단 지원\n'''서비스''': 고객 응대, 안내, 물류 운반\n'''탐사''': 우주, 심해, 재난 지역 접근이 어려운 환경 탐사\n<!-- 추가 내용: 실제 사례와 성공 사례들도 넣으면 좋을 것 같습니다 -->\n=== 핵심 기술 발전 동향 ===\n인공지능과 로봇 기술의 발전을 이끄는 핵심 기술 트렌드는 다음과 같습니다:\n==== 딥러닝과 강화학습 ====\n'''딥러닝'''은 로봇이 이미지와 언어를 이해하는 능력을 크게 향상시켰습니다. [[딥러닝|심층 신경망]]은 로봇의 인식 능력을 인간 수준에 근접하게 만들었습니다.\n'''강화학습'''은 로봇이 환경과의 상호작용을 통해 스스로 학습하는 방법론으로, 자율 주행 로봇과 산업용 로봇 제어에 혁신을 가져왔습니다.\n==== 센서 기술과 IoT ====\n고성능 센서와 IoT(사물인터넷) 기술의 발전으로 로봇은 주변 환경을 더 정확하게 인식할 수 있게 되었습니다.\n{|\n! 센서 유형 ! 기능 ! 응용 분야\n|-\n| 라이다(LiDAR) | 거리 측정 및 3D 매핑 | 자율주행, 환경 인식\n|-\n| 고해상도 카메라 | 이미지 인식 | 객체 탐지, 얼굴 인식\n|-\n| 촉각 센서 | 압력 및 질감 감지 | 정밀 조작, 그리핑\n|-\n| IMU | 방향 및 가속도 측정 | 균형 유지, 움직임 제어\n|}\n=== 미래 전망 ===\n인공지능과 로봇 기술의 융합은 다음과 같은 미래를 가져올 것으로 예상됩니다:\n'''자율 이동체''': 완전 자율 주행 차량, 드론, 배송 로봇\n'''소셜 로봇''': 인간과 자연스럽게 상호작용하는 감성 인식 로봇\n'''웨어러블 로봇''': 인간의 능력을 확장하는 외골격 로봇 및 생체 보조 장치\n'''가정용 로봇''': 일상 생활의 모든 영역을 지원하는 스마트 홈 로봇\n==== 윤리적 고려사항 ====\nAI 로봇의 발전은 다양한 윤리적 질문을 제기합니다:\n로봇의 의사 결정에 대한 책임은 누구에게 있는가?\n자율 무기 시스템의 사용은 허용되어야 하는가?\n로봇으로 인한 일자리 대체 문제를 어떻게 해결할 것인가?\n인간과 로봇의 경계는 어디까지인가?\n{{각주|로봇 윤리에 관한 아시모프의 로봇 3원칙은 현대 로봇 윤리학의 기초가 되었습니다.}}\n=== 한국의 로봇 산업 현황 ===\n한국은 '''세계 6위'''의 로봇 강국으로, 특히 제조용 로봇 분야에서 높은 경쟁력을 보유하고 있습니다. 정부는 2030년까지 세계 4대 로봇 강국 진입을 목표로 하고 있습니다.\n주요 기업으로는 [[현대로보틱스]], [[두산로보틱스]], [[로보티즈]] 등이 있으며, 서비스 로봇 분야에서도 빠르게 성장하고 있습니다.\n== 참고 문헌 ==\n로봇산업진흥원(2023), "2023 로봇산업 실태조사"\nWorld Robotics(2022), "Industrial Robots: Global Report"\n''로봇과 인공지능의 미래'', 홍길동(2023), 미래출판사\n<code>https://www.robotics-journal.com/future-of-ai-robots</code>\n<!-- 이 문서는 지속적으로 업데이트되어야 합니다. 최신 기술 동향을 반영해 주세요. -->	\N	내용 추가	2025-05-13 04:28:11.418	usr_mod_001
96bbdcf1-c4a3-40e9-9946-12d2e434dba6	doc_ai	[[분류:갤럭시 S25]]\n[include(틀:공개, 대상=스마트폰, 주제=스마트폰, 회사= 삼성전자)]\n[include(틀:삼성 갤럭시 라인업/플래그십)]\n[include(틀:삼성 갤럭시 S 시리즈)]\n||<-2><tablealign=center><tablebordercolor=#191919,#666><tablewidth=700px><tablebgcolor=#fff,#000> [br] {{{#000,#fff {{{+5 '''Galaxy S25 Edge'''}}}}}} [br] {{{#000,#fff {{{-3 '''SM-S937'''}}}}}} [br] {{{#333,#e5e5e5 {{{-1 '''Beyond Slim'''}}}}}} [br] [br] ||\n||<-2><bgcolor=#191919,#000> [[https://www.samsung.com/sec/smartphones/galaxy-s25-edge/|{{{#fff 한국 삼성전자 갤럭시 S25 엣지 마이크로 사이트}}}]] ||\n[목차]\n[clearfix]\n== 개요 ==\n[[삼성전자]]가 [[2025년]] [[5월 13일]]에 공개한 [[갤럭시 S 시리즈]] 소속 플래그십 [[Android]] [[스마트폰]]이다. 시리즈 코드네임은 '''[[과학혁명의 구조#s-2.2|Paradigm]]'''.\n\n== 사양 ==\n사양이 두 가지 이상으로 나뉘는 경우, 한국 내수용에 해당하는 사양에 {{{#!wiki style="display: inline; padding: 1px 3px 2px; background: #fff5a0" dark-style="display: inline; padding: 1px 3px 2px; background: #5f5500"\n'''노란색 바탕'''}}} 혹은 {{{#green '''초록색 볼드체'''}}}로 표기.\n{{{#!wiki style="word-break: keep-all"\n||<tablealign=center><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff><width=8%> '''[[SoC|{{{#fff 프로세서}}}]]''' ||<width=92%>[[퀄컴 스냅드래곤/8 시리즈/8 Elite#8 Elite (1세대)|퀄컴 스냅드래곤 8 Elite for Galaxy Mobile Platform {{{-3 (SM8750-AB)}}}]][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 구성 내용 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> [[CPU|{{{#fff CPU}}}]] ||2 × [[퀄컴/마이크로아키텍처#Oryon-L (2세대)|Oryon-L (2세대)]] 4.47 GHz[br]6 × [[퀄컴/마이크로아키텍처#Oryon-M (2세대)|Oryon-M (2세대)]] 3.53 GHz ||\n|| [[GPU|{{{#fff GPU}}}]] ||[[퀄컴 Adreno GPU#Adreno 830|퀄컴 Adreno 830]] 1.2 GHz||\n|| [[NPU|{{{#fff NPU}}}]] ||[[퀄컴]] Hexagon V79 ||\n|| 통신 모뎀 ||[[퀄컴 스냅드래곤/통신 모뎀 솔루션#스냅드래곤 X80 5G 모뎀|퀄컴 스냅드래곤 X80 5G 모뎀]] ||\n|| 제조 공정 ||[[TSMC/공정 노드 추이#3nm|TSMC N3E]] ||}}}}}}}}} ||\n|| '''[[기억 장치|{{{#fff 메모리}}}]]''' ||12 GB [[DRAM#LPDDR5|LPDDR5X SDRAM]] 9,600 MT/s[br]256 / 512 GB [[유니버설 플래시 스토리지#버전별 특징(속도 및 대역폭, IOPS)|UFS 4.0]] 내장 메모리 ||\n|| '''[[디스플레이|{{{#fff 디스[br]플레이}}}]]''' ||6.7인치 {{{-2 (169.1 mm)}}}[* 인치 환산 시 6.66인치] 19.5:9 비율 [[해상도/목록#s-2.5.2|3120 × 1440]] Dynamic [[AMOLED]] 2X [[Infinity-O Display]] {{{-2 (516 ppi)}}}[br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 세부 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 공급사 ||[[삼성디스플레이]] ||\n|| 픽셀배열 ||다이아몬드 픽셀 {{{-2 ([[펜타일#RG-BG 펜타일 서브픽셀|RG-BG 서브픽셀]])}}} ||\n|| 패널정보 ||'''[[HOP]] 3.0''', [[AMOLED]] {{{-2 (M13 유기재료)}}} ||\n|| 색 영역 ||[[sRGB]], [[DCI-P3]] ||\n|| 명암비 ||5,000,000:1 ||\n|| 재생빈도 ||1-120 Hz 가변형 ||\n|| 부가정보 ||[[고릴라 글래스]] 세라믹 2, [[HDR10+]], [[HLG]] 지원 ||}}}}}}}}}[br]멀티터치 지원 정전식 [[터치 스크린]][br](최대 밝기 1,500 nits HBM / 2,600 nits HDR10+) ||\n|| '''[[이동통신|{{{#fff 이동통신}}}]]''' ||{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 5G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[NR]][*NM NSA & SA] 3GPP Rel.17 & 18 Sub-6 FDD & TDD ↓6[[캐리어 어그리게이션|CA]] ||\n|| 선택 지원 ||[[NR]][*NM NSA & SA] 3GPP Rel.17 & 18 Sub-6 FDD & TDD / [[mmWave]] TDD ↓8[[캐리어 어그리게이션|CA]] ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 4G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent>[[LTE]] FDD & [[LTE-TDD|TDD]] ↓?[[캐리어 어그리게이션|CA]] Cat.?? / ?CA Cat.??↑[br][[VoLTE]] 지원 ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 3G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[WCDMA|UMTS & HSDPA & HSUPA]] & [[HSPA+]] ↓42.2 Mbps / 5.76 Mbps↑[br][[Wideband Audio]] 음성통화·[[영상통화]] 지원 ||\n||<|2> 선택 지원 ||[[CDMA2000#EV-DO(=EV-DO Rel.0)|CDMA2000 1xEV-DO Rel.0 & Rev.A]] ↓3.1 Mbps / 1.8 Mbps↑[br][[영상통화]] 지원 ||\n||[[TD-SCDMA|TD-SCDMA & TD-HSDPA & TD-HSUPA]] ↓2.8 Mbps / 2.2 Mbps↑ ||}}}}}}}}} {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 2G ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 기본 지원 ||<bgcolor=#fff5a0,#5f5500>[[GSM|GSM & GPRS & EDGE]] ↓384 Kbps[br]음성통화 지원 ||\n|| 선택 지원 ||[[CDMA]] & [[CDMA2000#1XRTT|CDMA2000 1xRTT]] ↓144 Kbps[br]음성통화 지원 ||}}}}}}}}} ||\n|| '''근접통신''' ||[[Wi-Fi]] [[802.11b|1]]/[[802.11a|2]]/[[802.11g|3]]/[[Wi-Fi 4|4]]/[[Wi-Fi 5|5]]/[[Wi-Fi 6|6]]/[[Wi-Fi 6E|6E]]/[[Wi-Fi 7|7]], [[블루투스#5.4|블루투스 5.4]], [[NFC]][* 일부 지역에서 [[FeliCa]] 지원], [[마그네틱 스트라이프#MST/WMC|{{{#Green '''MST'''}}}]][* 한국 내수용만 지원], [[UWB]] ||\n|| '''[[GNSS|{{{#fff 위성항법}}}]]''' ||[[GPS|GPS & A-GPS]], [[GLONASS]], [[갈릴레오#GNSS|Galileo]], [[Beidou]], [[QZSS]] ||\n|| '''[[카메라|{{{#fff 카메라}}}]]''' ||전면 듀얼픽셀 [[PDAF]] 지원 1,200만 화소 (ƒ/2.2 & 80°)[br]후면 2렌즈 카메라 및 [[LED]] [[플래시(카메라)|플래시]][* 초광각 촬영 시 플래시 미지원] {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 후면 카메라 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 초광각 || 1200만 화소 || ƒ/2.2 || 120° || ||<|4> [[능동식 AF|레이저 AF]] || 듀얼픽셀 [[PDAF]] ||\n|| 광각[br]{{{-3 (기본)}}} || 2억 화소 || ƒ/1.7 || 85° ||<|3> [[OIS]] || 다방향 [[PDAF]] ||}}}}}}}}} ||\n|| '''[[배터리|{{{#fff 배터리}}}]]''' ||내장형 [[리튬 이온 배터리|Li-Ion]] 3,900 mAh[* 3.88 V - 3,900 mAh (19.02 Wh)][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 충전 기술 정보 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent><colbgcolor=#000><colcolor=#fff> 유선 ||[[삼성전자]] [[Super Fast Charging#2.0|Super Fast Charging]] - [[USB PD#USB PD rev.3.x / PPS|USB PD PPS]] (25 W)[br][[삼성전자]] [[Adaptive Fast Charging]] (15 W)[br][[USB PD#USB PD rev.2 / PDO|USB PD 1.0~2.0]] (10~15 W) ||\n|| 무선 ||[[삼성전자]] [[Fast Wireless Charging#2.0|Fast Wireless Charging 2.0]] (15 W)[br][[Qi#Qi2|Qi 2.1.0]][*Qi2-Ready 자석 부착 기능은 별도의 악세사리를 통해 사용해야 한다.] (15 W) ||}}}}}}}}} ||\n|| '''[[운영체제|{{{#fff 운영체제}}}]]''' ||[[Android]] [[Android 15|15]] ||\n|| '''[[사용자 경험|{{{#fff UX}}}]]''' ||[[One UI]] [[One UI 7|7.0]] ||\n|| '''규격''' ||75.5 × 158.2 × 5.8 mm, 163 g ||\n|| '''색상''' ||'''티타늄 아이시블루''', '''티타늄 실버''', '''티타늄 제트블랙'''[* 삼성닷컴 전용 컬러는 미출시] {{{#!wiki style="text-align: right; margin: calc(-1em / 4) -8px -5px 0"\n{{{#!wiki style="font: 0.6em/1 serif; font-family: revert"\n제품 공개 당시 같이 공개된 기본 색상에 '''볼드''' 처리}}}}}} ||\n|| '''단자 정보''' ||[[USB Type-C]] × 1 {{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 지원 프로토콜 확인 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent>[[USB 3.2 Gen 1x1]] (5 Gbps)[br][[DisplayPort]] 1.2 ||}}}}}}}}} ||\n|| '''[[삼성 갤럭시/생체 인식|{{{#fff 생체인식}}}]]''' ||[[지문인식]] - 초음파 방식 (디스플레이 내장)[br][[생체 인식#종류|얼굴인식]] - 전면 카메라 인식 방식 ||\n|| '''기타''' ||[[eSIM]] 연계 듀얼심 지원, [[IP등급|IP68]] 등급 [[방수]]·방진 지원, [[AKG]] 튜닝 및 [[Dolby Atmos]] 기술 탑재, [[FM방송|FM 라디오]] 지원[*R [[삼성 EO 시리즈#EO-IC100|FM라디오 모듈이 내장된 별도의 USB Type-C 이어폰]]을 연결해야 한다.][br]{{{#!wiki style="display: inline-block; vertical-align: top"\n{{{#!folding [ 탑재 센서 정보 ]\n{{{#!wiki style="margin: -5px 0"\n||<tablealign=left><tablebordercolor=#000,#666><tablebgcolor=transparent> 지문, 가속도, 기압, 자이로, 지자기, 조도, 근접, 홀 ||}}}}}}}}} ||}}}\n\n== 출시 ==\n=== 한국 시장 ===\n||<tablealign=center><tablebordercolor=#000,#666><tablebgcolor=#fff,#1c1d1f><rowbgcolor=#000><rowcolor=#000><bgcolor=#000><tablewidth=700><width=50%> '''{{{#white 256 GB}}}''' ||<bgcolor=#000> '''{{{#white 512 GB}}}''' ||\n||<rowbgcolor=#fff,#1c1d1f><rowcolor=#000,#fff> 1,496,000 원 || 1,639,000 원 ||\n\n[[대한민국]]에선 [[2025년]] [[5월 14일]]부터 [[5월 20일]]까지 사전예약[*공홈혜택 삼성닷컴 자급제 기준 더블 스토리지 제공, 3% 할인, 삼성카드 결제 한정 (3% 청구할인, 24개월 무이자)]을 진행한 후, [[5월 23일]]에 정식 출시한다.\n\n== [[갤럭시 S25/공개 전 루머#갤럭시 S25 Edge|공개 전 루머]] ==\n[include(틀:상세 내용, 문서명=갤럭시 S25/공개 전 루머)]\n\n== 기타 ==\n * 2016년 [[갤럭시 S7 엣지]] 이후 "엣지"라는 네임이 9년 만에 다시 사용되었다. 다만 엣지 디스플레이를 강조한 S7 엣지와는 다르게, 플랫 디스플레이를 탑재하였고 경량화와 두께 감소에 초점을 둔 모델인 것이 차이점이다.\n\n * 원래 4월 16일 공개 예정이었지만, 모종의 이유로 5월 13일로 밀렸다.\n\n * 간단하게 성능을 요약하자면 [[S25+]]와 같은 디스플레이 크기, [[S25]]와 거의 비슷한 무게, [[S25 울트라]]와 동일한 성능의 메인 카메라(대신 카메라 수는 2개), S25보다 적은 배터리 용량이다. 크고 가벼우며 카메라도 좋은 모델치고 140만원대의 가격도 꽤나 괜찮게 나왔다는 평가를 받고 있다. S25의 각 모델들의 최대 장점을 하나씩 가져와 합친 모델이지만 Z플립보다도 미세하게 적은 배터리 용량이 유일한 단점이다.[* 기존 [[갤럭시 Z 플립|Z 플립]]과 [[갤럭시 Z 플립3|Z 플립3]]에서 이런 특징이 좋지 못한 전성비와 더해져서 큰 단점으로 지적됐는데, 이번에는 칩셋의 효율이 부족한 용량을 커버해줄 수 있을지 주목된다. 당장 아이폰 16e도 칩셋은 아니지만 새로운 통신모뎀 덕에 배터리 타임을 늘릴 수 있었으니. ]	\N	문서 수정	2025-05-13 04:49:57.602	usr_mod_001
9f04e223-8834-4a2b-9df8-e72d473b5652	e0aa61d9-a093-4bb8-9e71-d1c9c516ac96	===마크다운이 될리가 없잖아===	\N	문서 생성	2025-05-13 05:09:39.621	usr_mod_001
\.


--
-- Data for Name: _DocumentToCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DocumentToCategory" ("A", "B") FROM stdin;
cat_basics	doc_basics
cat_sensors	doc_sensors
cat_programming	doc_programming
cat_hardware	doc_arm
cat_software	doc_navigation
cat_ros	doc_ros2
cat_programming	doc_ros2
cat_ai	doc_ai
cat_future	doc_ai
cat_ai	e0aa61d9-a093-4bb8-9e71-d1c9c516ac96
cat_applications	e0aa61d9-a093-4bb8-9e71-d1c9c516ac96
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ed69aef6-f1e3-47da-a674-d2a6fd57e090	107c91d824bffb158f5c014822b922fa1776e0e58190e703a40fc1ef4e8f1a03	2025-05-12 16:28:02.338543+09	20250512071718_init	\N	\N	2025-05-12 16:28:02.277679+09	1
cfb374d2-4d87-474c-bac6-cf92adafc0cb	e32591f186377b79e8f270ff3e1a3cc032d1534acd9da4e431ddbf0eed0fa09e	2025-05-12 16:28:05.714222+09	20250512072803_init	\N	\N	2025-05-12 16:28:05.472449+09	1
5f92d74f-14a0-4f98-ab4b-81065b6a43a1	305088599db9ca70384e3ce4af7351aa7543b4227f559a2612f58c28f8b131a5	2025-05-13 11:20:58.867658+09	20250513022058_add_wiki_models	\N	\N	2025-05-13 11:20:58.82864+09	1
15f8ee08-aada-4740-901d-5092eb60b0c9	72b547bb2ef3bd48c33139c9131b87cdb34fe246f704f7bc3e1c6613ffd17ebf	2025-05-13 15:57:24.794905+09	20250513065724_add_docs_models	\N	\N	2025-05-13 15:57:24.768413+09	1
\.


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Contribution Contribution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contribution"
    ADD CONSTRAINT "Contribution_pkey" PRIMARY KEY (id);


--
-- Name: DocumentChangeRequest DocumentChangeRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_pkey" PRIMARY KEY (id);


--
-- Name: DocumentHistory DocumentHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: UserBadge UserBadge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_pkey" PRIMARY KEY (id);


--
-- Name: UserContribution UserContribution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WikiCategory WikiCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiCategory"
    ADD CONSTRAINT "WikiCategory_pkey" PRIMARY KEY (id);


--
-- Name: WikiComment WikiComment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiComment"
    ADD CONSTRAINT "WikiComment_pkey" PRIMARY KEY (id);


--
-- Name: WikiDiscussion WikiDiscussion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDiscussion"
    ADD CONSTRAINT "WikiDiscussion_pkey" PRIMARY KEY (id);


--
-- Name: WikiDocument WikiDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_pkey" PRIMARY KEY (id);


--
-- Name: WikiRevision WikiRevision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_pkey" PRIMARY KEY (id);


--
-- Name: _DocumentToCategory _DocumentToCategory_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Badge_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Badge_name_key" ON public."Badge" USING btree (name);


--
-- Name: Category_path_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_path_key" ON public."Category" USING btree (path);


--
-- Name: Document_path_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Document_path_key" ON public."Document" USING btree (path);


--
-- Name: UserBadge_userId_badgeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON public."UserBadge" USING btree ("userId", "badgeId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WikiCategory_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WikiCategory_slug_key" ON public."WikiCategory" USING btree (slug);


--
-- Name: WikiDocument_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WikiDocument_slug_key" ON public."WikiDocument" USING btree (slug);


--
-- Name: _DocumentToCategory_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DocumentToCategory_B_index" ON public."_DocumentToCategory" USING btree ("B");


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Contribution Contribution_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contribution"
    ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DocumentChangeRequest DocumentChangeRequest_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentChangeRequest DocumentChangeRequest_proposedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DocumentChangeRequest DocumentChangeRequest_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DocumentHistory DocumentHistory_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DocumentHistory DocumentHistory_editedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_lastModifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserBadge UserBadge_badgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public."Badge"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserBadge UserBadge_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserContribution UserContribution_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserContribution UserContribution_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiCategory WikiCategory_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiCategory"
    ADD CONSTRAINT "WikiCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."WikiCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WikiComment WikiComment_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiComment"
    ADD CONSTRAINT "WikiComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiComment WikiComment_discussionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiComment"
    ADD CONSTRAINT "WikiComment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES public."WikiDiscussion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiDiscussion WikiDiscussion_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDiscussion"
    ADD CONSTRAINT "WikiDiscussion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiDiscussion WikiDiscussion_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDiscussion"
    ADD CONSTRAINT "WikiDiscussion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiDocument WikiDocument_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiDocument WikiDocument_lastModifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiRevision WikiRevision_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WikiRevision WikiRevision_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _DocumentToCategory _DocumentToCategory_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES public."WikiCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DocumentToCategory _DocumentToCategory_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

