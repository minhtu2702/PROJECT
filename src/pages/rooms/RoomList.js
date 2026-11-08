import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const typeLabel = { single: 'Đơn', double: 'Đôi', studio: 'Studio' };

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getRooms();
      setRooms(res.data);
      setFiltered(res.data);
    } catch {
      setError('Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const applyFilter = (search, status) => {
    let result = rooms;
    if (search) result = result.filter((r) => r.roomNumber.toLowerCase().includes(search.toLowerCase()));
    if (status) result = result.filter((r) => r.status === status);
    setFiltered(result);
  };

  const handleSearch = (val) => applyFilter(val, statusFilter);
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    applyFilter('', e.target.value);
  };

  const handleDelete = async () => {
    try {
      await roomAPI.deleteRoom(deleteId);
      setDeleteId(null);
      fetchRooms();
    } catch {
      alert('Xóa thất bại!');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Danh Sách Phòng Trọ</h4>
        <Button variant="primary" onClick={() => navigate('/rooms/new')}>+ Thêm Phòng</Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs="auto"><SearchBar onSearch={handleSearch} placeholder="Tìm số phòng..." /></Col>
            <Col xs="auto">
              <Form.Select value={statusFilter} onChange={handleStatusChange}>
                <option value="">Tất cả trạng thái</option>
                <option value="available">Trống</option>
                <option value="occupied">Đang thuê</option>
                <option value="maintenance">Bảo trì</option>
              </Form.Select>
            </Col>
          </Row>

          <Table hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Số Phòng</th>
                <th>Tầng</th>
                <th>Diện Tích</th>
                <th>Giá (VNĐ)</th>
                <th>Loại</th>
                <th>Trạng Thái</th>
                <th className="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">Không có phòng nào</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{r.roomNumber}</strong></td>
                  <td>{r.floor}</td>
                  <td>{r.area} m²</td>
                  <td>{r.price.toLocaleString('vi-VN')}</td>
                  <td>{typeLabel[r.type] || r.type}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-center">
                    <Button size="sm" variant="info" className="me-1" as={Link} to={`/rooms/${r.id}`}>Chi tiết</Button>
                    <Button size="sm" variant="warning" className="me-1" onClick={() => navigate(`/rooms/${r.id}/edit`)}>Sửa</Button>
                    {isAdmin && (
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)}>Xóa</Button>
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
        message="Bạn có chắc chắn muốn xóa phòng này không?"
      />
    </div>
  );
}

export default RoomList;
