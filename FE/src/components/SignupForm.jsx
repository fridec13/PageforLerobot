import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';   // ⬅️ 추가
import { signupUser } from '../api/userApi';

const SignupForm = () => {
  const navigate = useNavigate();                // ⬅️ 훅 호출

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(formData);
      // 성공 알림 → 메인 페이지 이동
      setMessage('회원가입에 성공했습니다!');
      navigate('/');                             // 메인
    } catch (error) {
      setMessage(
        '회원가입에 실패했습니다: ' +
        (error.response?.data || error.message)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>사용자명</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>이메일</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>비밀번호</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">회원가입</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignupForm;
