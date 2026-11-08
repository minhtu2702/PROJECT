import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);

    if (res.success) {
      if (res.user.role === 'tenant') {
        navigate('/my-room');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: '100vh', padding: '20px' }}
    >
      <Container style={{ maxWidth: 420 }}>
        <Card className="shadow-sm border">
          <Card.Header className="bg-primary text-white text-center py-3">
            <h4 className="fw-bold mb-1">Quản Lý Phòng Trọ</h4>
            <div className="small text-white-50">Hệ thống quản lý nhà trọ & dịch vụ</div>
          </Card.Header>

          <Card.Body className="p-4">
            <h5 className="text-center mb-4 fw-semibold text-secondary">Đăng Nhập</h5>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2 fw-semibold"
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Đăng Nhập'}
              </Button>
            </Form>

            <div className="mt-4 pt-3 border-top text-center text-muted small">
              <div><strong>Gợi ý tài khoản demo:</strong></div>
              <div>admin (Chủ trọ) | manager (Quản lý) | tenant (Khách thuê)</div>
              <div>Mật khẩu chung: <code>123</code></div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
