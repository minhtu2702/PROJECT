import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { tenantAPI, roomAPI } from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([tenantAPI.getTenants(), roomAPI.getRooms()]);
      setTenants(tRes.data);
      setFiltered(tRes.data);
      setRooms(rRes.data);
    } catch {
      setError('Không thể tải danh sách người thuê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (val) => {
    if (!val) { setFiltered(tenants); return; }
    const q = val.toLowerCase();
    setFiltered(tenants.filter((t) =>
      t.fullName.toLowerCase().includes(q) || t.phone.includes(q)
    ));
  };

  const handleDelete = async () => {
    try {
      await tenantAPI.deleteTenant(deleteId);
      setDeleteId(null);
      fetchData();
    } catch {
      alert('Xóa thất bại!');
    }
  };

  const getRoomNumber = (roomId) => rooms.find((r) => String(r.id) === String(roomId))?.roomNumber || '—';

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Danh Sách Người Thuê</h4>
        <Button variant="primary" onClick={() => navigate('/tenants/new')}>+ Thêm Người Thuê</Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col xs="auto"><SearchBar onSearch={handleSearch} placeholder="Tìm tên hoặc SĐT..." /></Col>
          </Row>
          <Table hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Họ Tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>CCCD</th>
                <th>Phòng</th>
                <th>Nghề Nghiệp</th>
                <th className="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">Không có dữ liệu</td></tr>
              ) : filtered.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{t.fullName}</strong></td>
                  <td>{t.phone}</td>
                  <td>{t.email}</td>
                  <td>{t.idCard}</td>
                  <td>{t.roomId ? getRoomNumber(t.roomId) : <span className="text-muted">Chưa có phòng</span>}</td>
                  <td>{t.occupation}</td>
                  <td className="text-center">
                    <Button size="sm" variant="info" className="me-1" as={Link} to={`/tenants/${t.id}`}>Xem</Button>
                    <Button size="sm" variant="warning" className="me-1" onClick={() => navigate(`/tenants/${t.id}/edit`)}>Sửa</Button>
                    {isAdmin && (
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(t.id)}>Xóa</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa người thuê này không?"
      />
    </div>
  );
}

export default TenantList;
