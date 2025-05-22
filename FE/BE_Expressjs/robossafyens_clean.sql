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

--
-- Name: ContributionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContributionType" AS ENUM (
    'WIKI_EDIT',
    'WIKI_CREATE',
    'DOC_EDIT',
    'DOC_CREATE',
    'FORUM_POST',
    'FORUM_COMMENT',
    'CODE_COMMIT',
    'BUG_REPORT',
    'OTHER'
);


ALTER TYPE public."ContributionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    username text UNIQUE,
    "levelId" text
);

ALTER TABLE public."User" OWNER TO postgres;

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
    "lastModifiedById" text NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[]
);

ALTER TABLE public."Document" OWNER TO postgres;

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
    "reviewedById" text,
    reason text
);

ALTER TABLE public."DocumentChangeRequest" OWNER TO postgres;

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
-- Name: Contribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contribution" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "contributionType" public."ContributionType",
    "targetId" text,
    "targetUrl" text
);

ALTER TABLE public."Contribution" OWNER TO postgres;

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
-- Primary Keys and Constraints
--

-- User
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);

-- Badge
ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_name_key" UNIQUE (name);

-- UserBadge
ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_userId_badgeId_key" UNIQUE ("userId", "badgeId");

-- Message
ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);

-- Category
ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_path_key" UNIQUE (path);

-- Document
ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_path_key" UNIQUE (path);

-- DocumentHistory
ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_pkey" PRIMARY KEY (id);

-- DocumentChangeRequest
ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_pkey" PRIMARY KEY (id);

-- WikiCategory
ALTER TABLE ONLY public."WikiCategory"
    ADD CONSTRAINT "WikiCategory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."WikiCategory"
    ADD CONSTRAINT "WikiCategory_slug_key" UNIQUE (slug);

-- WikiDocument
ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_slug_key" UNIQUE (slug);

-- WikiRevision
ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_pkey" PRIMARY KEY (id);

-- _DocumentToCategory
ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_AB_pkey" PRIMARY KEY ("A", "B");
CREATE INDEX "_DocumentToCategory_B_index" ON public."_DocumentToCategory" USING btree ("B");

-- Contribution
ALTER TABLE ONLY public."Contribution"
    ADD CONSTRAINT "Contribution_pkey" PRIMARY KEY (id);

-- UserContribution
ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_pkey" PRIMARY KEY (id);

--
-- Foreign Keys
--

-- Category
ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Document
ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- DocumentHistory
ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."DocumentHistory"
    ADD CONSTRAINT "DocumentHistory_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- DocumentChangeRequest
ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."DocumentChangeRequest"
    ADD CONSTRAINT "DocumentChangeRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- WikiCategory
ALTER TABLE ONLY public."WikiCategory"
    ADD CONSTRAINT "WikiCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."WikiCategory"(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- WikiDocument
ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."WikiDocument"
    ADD CONSTRAINT "WikiDocument_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- WikiRevision
ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."WikiRevision"
    ADD CONSTRAINT "WikiRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- _DocumentToCategory
ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES public."WikiCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public."_DocumentToCategory"
    ADD CONSTRAINT "_DocumentToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Contribution
ALTER TABLE ONLY public."Contribution"
    ADD CONSTRAINT "Contribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- UserContribution
ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY public."UserContribution"
    ADD CONSTRAINT "UserContribution_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."WikiDocument"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- User Table Data
--

-- 비밀번호 해시: $2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba (12341234)
-- ID는 고정 문자열 사용

INSERT INTO public."User" (
    id, 
    email, 
    name, 
    password, 
    role, 
    title, 
    image, 
    contribution, 
    "lastLoginAt", 
    "createdAt", 
    "updatedAt"
) VALUES
('usr_admin_001', 'admin@robossafyens.com', '관리자', '$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba', 'ADMIN', 'RoboSSAFYens', 'https://api.dicebear.com/7.x/lorelei/svg?seed=admin123', 100, NOW(), NOW(), NOW()),
('usr_mod_001', 'mod@robossafyens.com', '모더레이터', '$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba', 'MODERATOR', '로봇 전문가', 'https://api.dicebear.com/7.x/lorelei/svg?seed=mod123', 50, NOW(), NOW(), NOW()),
('usr_test_001', 'user@robossafyens.com', '테스트유저', '$2b$10$6BomKFz6CDph6VbKm/dghO0s79bws1Xc4nioJa7.q83b8mnibpiba', 'USER', '로봇 애호가', 'https://api.dicebear.com/7.x/lorelei/svg?seed=user123', 10, NOW(), NOW(), NOW());

--
-- Badge Table Data
--

INSERT INTO public."Badge" (
    id,
    name,
    description,
    image,
    "createdAt",
    "updatedAt"
) VALUES
('badge_001', '첫 기여', '첫 번째 기여를 완료했습니다!', 'https://api.dicebear.com/7.x/shapes/svg?seed=badge1', NOW(), NOW()),
('badge_002', '전문가', '10개 이상의 문서를 작성했습니다!', 'https://api.dicebear.com/7.x/shapes/svg?seed=badge2', NOW(), NOW()),
('badge_003', 'RoboSSAFYens', 'SSAFY 교육생으로 인증되었습니다!', 'https://api.dicebear.com/7.x/shapes/svg?seed=badge3', NOW(), NOW());

--
-- UserBadge Table Data
--

INSERT INTO public."UserBadge" (
    id,
    "userId",
    "badgeId",
    "createdAt"
) VALUES
('ub_001', 'usr_admin_001', 'badge_001', NOW()),
('ub_002', 'usr_admin_001', 'badge_002', NOW()),
('ub_003', 'usr_admin_001', 'badge_003', NOW()),
('ub_004', 'usr_mod_001', 'badge_001', NOW()),
('ub_005', 'usr_mod_001', 'badge_003', NOW()),
('ub_006', 'usr_test_001', 'badge_001', NOW());

--
-- Message Table Data
--

INSERT INTO public."Message" (
    id,
    "senderId",
    "receiverId",
    content,
    read,
    "createdAt",
    "readAt"
) VALUES
('msg_welcome_001', 'usr_admin_001', 'usr_test_001', '프로필 페이지에 오신 것을 환영합니다! 이곳에서 기여 내역과 메시지를 확인할 수 있습니다.', false, NOW(), NULL);

--
-- Category Table Data (for docs)
--

INSERT INTO public."Category" (
    id,
    name,
    path,
    description,
    "parentId",
    "createdAt",
    "updatedAt"
) VALUES
('cat_docs_001', '시작하기', 'getting-started', '문서화 시작하기 안내', NULL, NOW(), NOW()),
('cat_docs_002', '튜토리얼', 'tutorials', '튜토리얼 모음', NULL, NOW(), NOW()),
('cat_docs_003', 'API 문서', 'api', 'API 문서', NULL, NOW(), NOW());

--
-- Document Table Data
--

INSERT INTO public."Document" (
    id,
    title,
    content,
    path,
    "isPublished",
    version,
    views,
    "createdAt",
    "updatedAt",
    "categoryId",
    "createdById",
    "lastModifiedById",
    tags
) VALUES
('doc_intro_001', '문서화 시작하기', '# 문서화 시작하기\n\n이 문서는 RoboSSAFYens 기술 문서 플랫폼의 기본 사용법을 안내합니다.\n\n## 문서 작성 방법\n\n1. 마크다운 문법을 사용하여 작성합니다.\n2. 코드 블록과 이미지를 추가할 수 있습니다.\n3. 문서는 카테고리별로 분류됩니다.', 
'getting-started/intro', true, 1, 120, NOW(), NOW(), 'cat_docs_001', 'usr_admin_001', 'usr_admin_001', '{"문서화", "시작하기", "마크다운"}'),
('doc_api_001', 'API 개요', '# API 개요\n\n이 문서는 RoboSSAFYens API의 기본 사용법을 설명합니다.\n\n## 인증\n\nAPI 사용을 위해서는 JWT 토큰이 필요합니다.\n\n## 엔드포인트\n\n- `/api/v1/docs` - 문서 관련 API\n- `/api/v1/users` - 사용자 관련 API', 
'api/overview', true, 1, 85, NOW(), NOW(), 'cat_docs_003', 'usr_mod_001', 'usr_admin_001', '{"API", "개발자", "문서"}');

--
-- DocumentHistory Table Data
--

INSERT INTO public."DocumentHistory" (
    id,
    content,
    version,
    "changeDescription",
    "createdAt",
    "documentId",
    "editedById"
) VALUES
('doc_hist_001', '# 문서화 시작하기\n\n이 문서는 RoboSSAFYens 기술 문서 플랫폼의 기본 사용법을 안내합니다.\n\n## 문서 작성 방법\n\n1. 마크다운 문법을 사용하여 작성합니다.\n2. 코드 블록과 이미지를 추가할 수 있습니다.', 
1, '초기 문서 생성', NOW(), 'doc_intro_001', 'usr_admin_001');

--
-- DocumentChangeRequest Table Data
--

INSERT INTO public."DocumentChangeRequest" (
    id,
    "proposedContent",
    status,
    "reviewComment",
    reason,
    "createdAt",
    "reviewedAt",
    "documentId",
    "proposedById",
    "reviewedById"
) VALUES
('doc_req_001', '# API 개요\n\n이 문서는 RoboSSAFYens API의 기본 사용법을 설명합니다.\n\n## 인증\n\nAPI 사용을 위해서는 JWT 토큰이 필요합니다.\n\n## 엔드포인트\n\n- `/api/v1/docs` - 문서 관련 API\n- `/api/v1/users` - 사용자 관련 API\n- `/api/v1/auth` - 인증 관련 API', 
'pending', NULL, '인증 관련 API 엔드포인트 추가', NOW(), NULL, 'doc_api_001', 'usr_test_001', NULL);

--
-- WikiCategory Table Data
--

INSERT INTO public."WikiCategory" (
    id,
    name,
    slug,
    description,
    "parentId",
    "createdAt",
    "updatedAt"
) VALUES
('wiki_cat_001', '기초 지식', 'basics', '로봇 공학의 기초 개념', NULL, NOW(), NOW()),
('wiki_cat_002', '하드웨어', 'hardware', '로봇 하드웨어 관련', NULL, NOW(), NOW()),
('wiki_cat_003', '소프트웨어', 'software', '로봇 소프트웨어 관련', NULL, NOW(), NOW());

--
-- WikiDocument Table Data
--

INSERT INTO public."WikiDocument" (
    id,
    slug,
    title,
    content,
    "isPublished",
    "viewCount",
    "createdAt",
    "updatedAt",
    "createdById",
    "lastModifiedById"
) VALUES
('wiki_doc_001', 'robot-basics', '로봇 공학 기초', '# 로봇 공학 기초\n\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문으로, 로봇의 설계, 제작, 운용에 관한 기술을 연구합니다.\n\n## 로봇의 정의\n\n로봇은 프로그래밍 가능한 기계 장치로, 다양한 작업을 자동으로 수행할 수 있습니다.', 
true, 150, NOW(), NOW(), 'usr_admin_001', 'usr_admin_001'),
('wiki_doc_002', 'robot-sensors', '로봇 센서의 종류와 활용', '# 로봇 센서의 종류와 활용\n\n로봇이 주변 환경을 인식하고 상호작용하기 위해서는 다양한 센서가 필요합니다.\n\n## 센서의 종류\n\n### 1. 시각 센서\n- 카메라: RGB, 스테레오, 열화상 등\n- 라이다(LiDAR): 레이저를 이용한 거리 측정\n- 초음파 센서: 음파를 이용한 장애물 감지', 
true, 80, NOW(), NOW(), 'usr_mod_001', 'usr_mod_001');

--
-- Connect WikiDocuments to WikiCategories
--

INSERT INTO public."_DocumentToCategory" ("A", "B") VALUES
('wiki_cat_001', 'wiki_doc_001'),
('wiki_cat_002', 'wiki_doc_002');

--
-- WikiRevision Table Data
--

INSERT INTO public."WikiRevision" (
    id,
    "documentId",
    content,
    diff,
    comment,
    "createdAt",
    "createdById"
) VALUES
('wiki_rev_001', 'wiki_doc_001', '# 로봇 공학 기초\n\n로봇 공학은 기계공학, 전자공학, 컴퓨터 과학이 융합된 학문입니다.', 
NULL, '문서 생성', NOW(), 'usr_admin_001');

--
-- Contribution Table Data
--

INSERT INTO public."Contribution" (
    id,
    "userId",
    type,
    description,
    points,
    "createdAt",
    "updatedAt",
    "contributionType",
    "targetId",
    "targetUrl"
) VALUES
('contrib_001', 'usr_admin_001', 'document', '문서 작성: 문서화 시작하기', 3, NOW(), NOW(), 'DOC_CREATE', 'doc_intro_001', '/docs/getting-started/intro'),
('contrib_002', 'usr_mod_001', 'wiki', '위키 작성: 로봇 센서의 종류와 활용', 5, NOW(), NOW(), 'WIKI_CREATE', 'wiki_doc_002', '/wiki/robot-sensors');

--
-- UserContribution Table Data
--

INSERT INTO public."UserContribution" (
    id,
    "userId",
    type,
    title,
    "documentId",
    "createdAt"
) VALUES
('usr_contrib_001', 'usr_admin_001', 'DOCUMENT', '문서 작성: 문서화 시작하기', NULL, NOW()),
('usr_contrib_002', 'usr_mod_001', 'WIKI', '위키 작성: 로봇 센서의 종류와 활용', 'wiki_doc_002', NOW()); 