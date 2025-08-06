// hooks/useForm.ts
import { useState } from 'react';

export const useFormData = <T extends Record<string, any>>(initialValues: T) => {
   
    
  const [formData, setFormData] = useState<T>(initialValues);
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   console.log("call;");
   
    const { name, value } = e.target;
     console.log("inside useForm ,",name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
  };
};
