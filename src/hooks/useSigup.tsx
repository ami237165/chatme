// hooks/useSignup.ts
import { useRegisterMutation } from '@/store/authApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const useSignup = () => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await register(formData).unwrap();

      if (res?.data === 'success') {
        setSuccessMessage('✅ Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErrorMessage(res?.data);
      }
    } catch (err: any) {
      setErrorMessage('❌ Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    errorMessage,
    successMessage,
  };
};
