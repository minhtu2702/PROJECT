import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const roleBadgeColor = {
  admin: 'danger',
  manager: 'primary',
  tenant: 'success',
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm border-bottom border-secondary">
      <Container fluid>
        <BSNavbar.Brand as={NavLink} to={user?.role === 'tenant' ? '/my-room' : '/'} className="fw-bold fs-5">
          Quản Lý Phòng Trọ
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar" />
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {user?.role === 'tenant' ? (
              <>
                <Nav.Link as={NavLink} to="/my-room">Phòng Của Tôi</Nav.Link>
                <Nav.Link as={NavLink} to="/services">Bảng Giá Dịch Vụ</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/" end>Trang Chủ</Nav.Link>
                <Nav.Link as={NavLink} to="/rooms">Phòng Trọ</Nav.Link>
                <Nav.Link as={NavLink} to="/tenants">Người Thuê</Nav.Link>
                <Nav.Link as={NavLink} to="/contracts">Hợp Đồng</Nav.Link>
                <Nav.Link as={NavLink} to="/invoices">Hóa Đơn</Nav.Link>
                <Nav.Link as={NavLink} to="/services">Dịch Vụ</Nav.Link>
              </>
            )}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="text-white text-end small">
                  <div>
                    <strong>{user.fullName}</strong>
                  </div>
                  <div>
                    <Badge bg={roleBadgeColor[user.role] || 'secondary'} className="text-uppercase" style={{ fontSize: '10px' }}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button as={NavLink} to="/login" variant="primary" size="sm">
                Đăng nhập
              </Button>
            )}
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
