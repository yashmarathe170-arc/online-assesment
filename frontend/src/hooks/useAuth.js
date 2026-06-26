import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, registerUser, fetchUserProfile, clearError } from '../store/authSlice.js';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  const register = useCallback((formData) => {
    return dispatch(registerUser(formData));
  }, [dispatch]);

  const fetchProfile = useCallback(() => {
    return dispatch(fetchUserProfile());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    fetchProfile,
    clearAuthError,
  };
};

export default useAuth;
