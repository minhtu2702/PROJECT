import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { contractAPI, roomAPI, tenantAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, rRes, tRes] = await Promise.all([
        contractAPI.getContracts(),
        roomAPI.getRooms(),
        tenantAPI.getTenants(),
      ]);
      setContracts(cRes.data);
      setRooms(rRes.data);
      setTenants(tRes.data);
    } catch {
      setError('Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    try {
      await contractAPI.deleteContract(deleteId);
      setDeleteId(null);
      fetchData();
    } catch {
      alert('Xóa thất bại!');
    }
  };

  const getRoom = (id) => rooms.find((r) => String(r.id) === String(id));
  const getTenant = (id) => tenants.find((t) => String(t.id) === String(id));

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Danh Sách Hợp Đồng</h4>
        {isAdmin && (
          <Button variant="primary" onClick={() => navigate('/contracts/new')}>+ Thêm Hợp Đồng</Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Phòng</th>
                <th>Người Thuê</th>
                <th>Ngày Bắt Đầu</th>
                <th>Ngày Kết Thúc</th>
                <th>Tiền Thuê</th>
                <th>Tiền Cọc</th>
                <th>Trạng Thái</th>
                <th className="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">Không có hợp đồng nào</td></tr>
              ) : contracts.map((c, idx) => {
                const room = getRoom(c.roomId);
                const tenant = getTenant(c.tenantId);
                return (
                  <tr key={c.id}>
                    <td>{idx + 1}</td>
                    <td>{room ? `Phòng ${room.roomNumber}` : '—'}</td>
                    <td>{tenant ? tenant.fullName : '—'}</td>
                    <td>{c.startDate}</td>
                    <td>{c.endDate}</td>
                    <td>{c.monthlyRent.toLocaleString('vi-VN')}</td>
                    <td>{c.deposit.toLocaleString('vi-VN')}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-center">
                      <Button size="sm" variant="warning" className="me-1" onClick={() => navigate(`/contracts/${c.id}/edit`)}>Sửa</Button>
                      {isAdmin && (
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(c.id)}>Xóa</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa hợp đồng này không?"
      />
    </div>
  );
}

export default ContractList;
