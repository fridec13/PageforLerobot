import React, { useState } from 'react';
import { signupUser } from '../api/userApi';

const SignupForm = () => {
  /*  입력값 상태 */
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  /* 메시지 상태  →  useState 로 받기! */
  const [message, setMessage] = useState('');

  /* 필드 변경 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* 전송 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signupUser(formData);
      console.log('회원가입 성공:', result);
      setMessage('회원가입에 성공했습니다!');
    } catch (error) {
      setMessage('회원가입에 실패했습니다: ' +
                 (error.response?.data || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 입력 필드들 */}
      <div>
        <label>사용자명</label>
        <input name="username" value={formData.username}
               onChange={handleChange} required />
      </div>

      <div>
        <label>이메일</label>
        <input type="email" name="email" value={formData.email}
               onChange={handleChange} required />
      </div>

      <div>
        <label>비밀번호</label>
        <input type="password" name="password" value={formData.password}
               onChange={handleChange} required />
      </div>

      <button type="submit">회원가입</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignupForm;
