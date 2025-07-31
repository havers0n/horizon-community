import React from 'react';

interface LoginFormProps {
  onSubmit?: (data: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  return (
    <div>
      <h2>Login Form</h2>
      <p>Login form placeholder</p>
    </div>
  );
}; 