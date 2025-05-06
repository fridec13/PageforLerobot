import { useEffect, useState } from 'react';
import { fetchMyProfile } from '../api/userApi';

const ProfilePage = () => {
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetchMyProfile();
        setUser(me);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoad(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-center mt-8">로딩 중...</p>;
  if (error)   return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">내 프로필</h2>

      <div className="space-y-2">
        <div>
          <span className="font-semibold">아이디:</span> {user.id}
        </div>
        <div>
          <span className="font-semibold">사용자명:</span> {user.username}
        </div>
        <div>
          <span className="font-semibold">이메일:</span> {user.email}
        </div>
        {/* 필요하면 추가 필드 */}
      </div>

      <button
        className="mt-6 bg-gray-300 px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem('jwt');  // 로그아웃
          window.location.href = '/login';
        }}
      >
        로그아웃
      </button>
    </div>
  );
};

export default ProfilePage;
