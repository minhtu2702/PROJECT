import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, roomAPI, tenantAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [iRes, rRes, tRes] = await Promise.all([
        invoiceAPI.getInvoices(),
        roomAPI.getRooms(),
        tenantAPI.getTenants(),
      ]);
      setInvoices(iRes.data);
      setFiltered(iRes.data);
      setRooms(rRes.data);
      setTenants(tRes.data);
    } catch {
      setError('Không thể tải danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const applyFilter = (month, status) => {
    let result = invoices;
    if (month) result = result.filter((i) => i.month === month);
    if (status) result = result.filter((i) => i.status === status);
    setFiltered(result);
  };

  const handleMonthChange = (e) => { setMonthFilter(e.target.value); applyFilter(e.target.value, statusFilter); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); applyFilter(monthFilter, e.target.value); };

  const handleMarkPaid = async (inv) => {
    try {
      await invoiceAPI.updateInvoice(inv.id, { ...inv, status: 'paid', paidDate: new Date().toISOString().slice(0, 10) });
      fetchData();
    } catch {
      alert('Cập nhật thất bại!');
    }
  };

  const handleDelete = async () => {
    try {
      await invoiceAPI.deleteInvoice(deleteId);
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
        <h4 className="fw-bold mb-0">Danh Sách Hóa Đơn</h4>
        <Button variant="primary" onClick={() => navigate('/invoices/new')}>+ Tạo Hóa Đơn</Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs="auto">
              <Form.Control type="month" value={monthFilter} onChange={handleMonthChange} />
            </Col>
            <Col xs="auto">
              <Form.Select value={statusFilter} onChange={handleStatusChange}>
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
              </Form.Select>
            </Col>
          </Row>

          <Table hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Phòng</th>
                <th>Người Thuê</th>
                <th>Tháng</th>
                <th>Điện (kWh)</th>
                <th>Nước (m³)</th>
                <th>Tiền Thuê</th>
                <th>Tổng (VNĐ)</th>
                <th>Trạng Thái</th>
                <th>Hạn TT</th>
                <th className="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-muted py-4">Không có hóa đơn nào</td></tr>
              ) : filtered.map((inv, idx) => {
                const room = getRoom(inv.roomId);
                const tenant = getTenant(inv.tenantId);
                return (
                  <tr key={inv.id}>
                    <td>{idx + 1}</td>
                    <td>{room ? `Phòng ${room.roomNumber}` : '—'}</td>
                    <td>{tenant ? tenant.fullName : '—'}</td>
                    <td>{inv.month}</td>
                    <td>{inv.electricityUsage}</td>
                    <td>{inv.waterUsage}</td>
                    <td>{inv.rent.toLocaleString('vi-VN')}</td>
                    <td><strong>{inv.totalAmount.toLocaleString('vi-VN')}</strong></td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td>{inv.dueDate}</td>
                    <td className="text-center">
                      {inv.status === 'unpaid' && (
                        <Button size="sm" variant="success" className="me-1" onClick={() => handleMarkPaid(inv)}>Đã TT</Button>
                      )}
                      {isAdmin && (
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(inv.id)}>Xóa</Button>
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
        message="Bạn có chắc chắn muốn xóa hóa đơn này không?"
      />
    </div>
  );
}

export default InvoiceList;
