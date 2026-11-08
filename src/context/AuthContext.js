import React, { createContext, useContext, useState } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers();
      const uTrim = String(username || '').trim().toLowerCase();
      const pTrim = String(password || '').trim();

      const foundUser = (res.data || []).find(
        (u) =>
          String(u.username || '').toLowerCase() === uTrim &&
          String(u.password || '').trim() === pTrim
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return { success: true, user: foundUser };
      } else {
        return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
      }
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ. Hãy chắc chắn json-server đang chạy cổng 9999!' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isTenant = user?.role === 'tenant';

  // Check role permission
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isTenant,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
