import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { roomAPI, tenantAPI, invoiceAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, tRes, iRes] = await Promise.all([
          roomAPI.getRooms(),
          tenantAPI.getTenants(),
          invoiceAPI.getInvoices(),
        ]);
        setRooms(rRes.data);
        setTenants(tRes.data);
        setInvoices(iRes.data);
      } catch (err) {
        setError('Không thể tải dữ liệu. Hãy chắc chắn json-server đang chạy.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid').length;
  const totalTenants = tenants.length;

  const stats = [
    { label: 'Tổng Số Phòng', value: totalRooms, color: 'primary' },
    { label: 'Phòng Trống', value: availableRooms, color: 'success' },
    { label: 'Người Thuê', value: totalTenants, color: 'info' },
    { label: 'Hóa Đơn Chưa TT', value: unpaidInvoices, color: 'danger' },
  ];

  return (
    <div>
      <h4 className="mb-4 fw-bold">Tổng Quan Hệ Thống</h4>

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        {stats.map((s) => (
          <Col key={s.label} xs={12} sm={6} xl={3}>
            <Card className={`border-0 shadow-sm text-white bg-${s.color}`}>
              <Card.Body className="p-3">
                <div className="fs-2 fw-bold">{s.value}</div>
                <div className="small text-white-50">{s.label}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        {/* Room List */}
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-semibold d-flex justify-content-between align-items-center">
              <span>Danh Sách Phòng</span>
              <Link to="/rooms" className="btn btn-sm btn-outline-primary">Xem tất cả</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Phòng</th>
                    <th>Tầng</th>
                    <th>Giá (VNĐ)</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td><Link to={`/rooms/${r.id}`}>{r.roomNumber}</Link></td>
                      <td>{r.floor}</td>
                      <td>{r.price.toLocaleString('vi-VN')}</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Invoices */}
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-semibold d-flex justify-content-between align-items-center">
              <span>Hóa Đơn Gần Đây</span>
              <Link to="/invoices" className="btn btn-sm btn-outline-primary">Xem tất cả</Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tháng</th>
                    <th>Phòng</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const room = rooms.find((r) => String(r.id) === String(inv.roomId));
                    return (
                      <tr key={inv.id}>
                        <td>{inv.month}</td>
                        <td>{room ? `P.${room.roomNumber}` : inv.roomId}</td>
                        <td className="small">{inv.totalAmount.toLocaleString('vi-VN')}</td>
                        <td><StatusBadge status={inv.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
