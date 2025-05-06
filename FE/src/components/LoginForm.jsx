import { useState } from 'react';
import { login } from '../api/authApi';   // 곧 만들 함수

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg,  setMsg]  = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      setMsg('로그인 성공!');
      window.location.href = '/profile';  // 예시 리디렉션
    } catch (err) {
      setMsg('로그인 실패: ' + (err.response?.data || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="email" type="email" onChange={handleChange} placeholder="이메일" required className="border p-2 w-full"/>
      <input name="password" type="password" onChange={handleChange} placeholder="비밀번호" required className="border p-2 w-full"/>
      <button className="bg-blue-600 text-white w-full py-2">로그인</button>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </form>
  );
}
