import { Link } from 'react-router-dom';

const HomePage = () => (
  <div className="max-w-2xl mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">재민's Portfolio 🚀</h1>
    <p className="mb-8">
      Lerobot 메인페이지 인데요?
    </p>

    <nav className="flex flex-col gap-4 items-center">
      <Link to="/signup" className="text-blue-600 hover:underline">
        회원가입
      </Link>
      <Link to="/login" className="text-blue-600 hover:underline">
        로그인
      </Link>
      <Link to="/profile" className="text-blue-600 hover:underline">
        프로필(보호된 페이지)
      </Link>
    </nav>
  </div>
);

export default HomePage;
