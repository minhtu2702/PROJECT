import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const adminManagerMenu = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/rooms', label: 'Phòng Trọ' },
  { to: '/tenants', label: 'Người Thuê' },
  { to: '/contracts', label: 'Hợp Đồng' },
  { to: '/invoices', label: 'Hóa Đơn' },
  { to: '/services', label: 'Dịch Vụ' },
];

const tenantMenu = [
  { to: '/my-room', label: 'Phòng Của Tôi', end: true },
  { to: '/services', label: 'Bảng Giá Dịch Vụ' },
];

const roleBadgeColor = {
  admin: 'danger',
  manager: 'primary',
  tenant: 'success',
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menu = user?.role === 'tenant' ? tenantMenu : adminManagerMenu;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="d-flex flex-column bg-dark text-white vh-100"
      style={{ width: '220px', minWidth: '220px', position: 'sticky', top: 0 }}
    >
      <div className="p-3 border-bottom border-secondary text-center">
        <div className="fw-bold fs-6">Quản Lý Phòng</div>
        {user && (
          <div className="mt-2 text-start bg-secondary bg-opacity-25 p-2 rounded small">
            <div className="text-truncate fw-semibold">
              {user.fullName}
            </div>
            <div className="mt-1 d-flex justify-content-between align-items-center">
              <Badge bg={roleBadgeColor[user.role] || 'info'} className="text-uppercase" style={{ fontSize: '10px' }}>
                {user.role}
              </Badge>
              <span className="text-white-50 font-monospace" style={{ fontSize: '10px' }}>
                @{user.username}
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-grow-1 py-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `d-block px-3 py-2 text-decoration-none fs-6 ${
                isActive
                  ? 'bg-primary text-white fw-semibold'
                  : 'text-white-50 sidebar-link'
              }`
            }
            style={{ transition: 'background 0.2s' }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary">
        <Button
          variant="outline-danger"
          size="sm"
          className="w-100"
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
