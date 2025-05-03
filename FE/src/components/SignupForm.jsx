import React, { useState } from 'react';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = setState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const result = await signupUser(formData);
      console.log('회원가입 성공:',result);
      setMessage('회원가입에 성공했습니다.');
    } catch (error) {
      setMessage('회원가입에 실패했습니다: ' + (error.response?.data || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>사용자명</label>
        <input
          type="text"
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
