import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Kiểm tra đăng nhập khi load app
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/checklogin');
        setUser({ username: res.username }); // Sửa lại để lấy đúng username từ API
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}; 