import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Container, Button } from 'react-bootstrap';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 600 }}>
        <Alert variant="danger">
          <Alert.Heading className="fw-bold">⛔ Truy cập bị từ chối (403 Forbidden)</Alert.Heading>
          <p>
            Tài khoản của bạn với vai trò <strong>{user.role.toUpperCase()}</strong> không có quyền truy cập vào chức năng này.
          </p>
          <hr />
          <div className="d-flex justify-content-center gap-2">
            {user.role === 'tenant' ? (
              <Button variant="outline-primary" href="/my-room">
                🏠 Về trang Phòng của tôi
              </Button>
            ) : (
              <Button variant="outline-primary" href="/">
                📊 Về Trang Chủ
              </Button>
            )}
          </div>
        </Alert>
      </Container>
    );
  }

  return children;
}

export default ProtectedRoute;
