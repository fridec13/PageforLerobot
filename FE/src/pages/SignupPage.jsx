import React from 'react';
import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>회원가입</h2>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
