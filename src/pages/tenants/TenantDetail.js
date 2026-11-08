import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, ListGroup, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { tenantAPI, roomAPI, contractAPI, invoiceAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [room, setRoom] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const tRes = await tenantAPI.getTenantById(id);
        setTenant(tRes.data);
        const tid = tRes.data.id;
        const rid = tRes.data.roomId;

        const promises = [
          contractAPI.getContracts({ tenantId: tid }),
          invoiceAPI.getInvoices({ tenantId: tid }),
        ];
        if (rid) promises.push(roomAPI.getRoomById(rid));

        const [cRes, iRes, rRes] = await Promise.all(promises);
        setContracts(cRes.data);
        setInvoices(iRes.data);
        if (rRes) setRoom(rRes.data);
      } catch {
        setError('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!tenant) return <Alert variant="warning">Không tìm thấy người thuê.</Alert>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/tenants')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">{tenant.fullName}</h4>
        <Button variant="warning" size="sm" onClick={() => navigate(`/tenants/${id}/edit`)}>Sửa</Button>
      </div>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white fw-semibold">Thông tin cá nhân</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Họ tên:</strong> {tenant.fullName}</ListGroup.Item>
                <ListGroup.Item><strong>SĐT:</strong> {tenant.phone}</ListGroup.Item>
                <ListGroup.Item><strong>Email:</strong> {tenant.email}</ListGroup.Item>
                <ListGroup.Item><strong>CCCD:</strong> {tenant.idCard}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày sinh:</strong> {tenant.dob}</ListGroup.Item>
                <ListGroup.Item><strong>Địa chỉ:</strong> {tenant.address}</ListGroup.Item>
                <ListGroup.Item><strong>Nghề nghiệp:</strong> {tenant.occupation}</ListGroup.Item>
                <ListGroup.Item><strong>Liên hệ khẩn cấp:</strong> {tenant.emergencyContact}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white fw-semibold">Thông tin thuê phòng</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Phòng:</strong>{' '}
                  {room ? <Link to={`/rooms/${room.id}`}>Phòng {room.roomNumber}</Link> : 'Chưa có phòng'}
                </ListGroup.Item>
                <ListGroup.Item><strong>Ngày vào:</strong> {tenant.checkInDate || '—'}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {contracts.length > 0 && (
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-warning fw-semibold">📋 Hợp đồng</Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr><th>Phòng</th><th>Từ</th><th>Đến</th><th>Tiền thuê</th><th>Tiền cọc</th><th>TT</th></tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.id}>
                        <td>{c.roomId}</td>
                        <td>{c.startDate}</td>
                        <td>{c.endDate}</td>
                        <td>{c.monthlyRent.toLocaleString('vi-VN')}</td>
                        <td>{c.deposit.toLocaleString('vi-VN')}</td>
                        <td><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}

        {invoices.length > 0 && (
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-secondary text-white fw-semibold">💰 Lịch sử hóa đơn</Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr><th>Tháng</th><th>Điện</th><th>Nước</th><th>Tổng</th><th>TT</th></tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.month}</td>
                        <td>{inv.electricityUsage} kWh</td>
                        <td>{inv.waterUsage} m³</td>
                        <td>{inv.totalAmount.toLocaleString('vi-VN')}</td>
                        <td><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default TenantDetail;
