import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Spinner, Alert, ListGroup, Table } from 'react-bootstrap';
import { roomAPI, tenantAPI, contractAPI, invoiceAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const typeLabel = { single: 'Đơn', double: 'Đôi', studio: 'Studio' };

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const rRes = await roomAPI.getRoomById(id);
        setRoom(rRes.data);

        const [tRes, cRes, iRes] = await Promise.all([
          tenantAPI.getTenants({ roomId: rRes.data.id }),
          contractAPI.getContracts({ roomId: rRes.data.id }),
          invoiceAPI.getInvoices({ roomId: rRes.data.id }),
        ]);
        setTenant(tRes.data[0] || null);
        setContracts(cRes.data);
        setInvoices(iRes.data);
      } catch {
        setError('Không thể tải dữ liệu phòng.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!room) return <Alert variant="warning">Không tìm thấy phòng.</Alert>;

  return (
    <div>
      <div className="d-flex align-items-center mb-3 gap-2">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/rooms')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">Phòng {room.roomNumber}</h4>
        <Button variant="warning" size="sm" onClick={() => navigate(`/rooms/${id}/edit`)}>Chỉnh sửa</Button>
      </div>

      <Row className="g-3">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold bg-primary text-white">Thông tin phòng</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>Số phòng:</strong> {room.roomNumber}</ListGroup.Item>
                <ListGroup.Item><strong>Tầng:</strong> {room.floor}</ListGroup.Item>
                <ListGroup.Item><strong>Diện tích:</strong> {room.area} m²</ListGroup.Item>
                <ListGroup.Item><strong>Loại phòng:</strong> {typeLabel[room.type] || room.type}</ListGroup.Item>
                <ListGroup.Item><strong>Giá thuê:</strong> {room.price.toLocaleString('vi-VN')} VNĐ/tháng</ListGroup.Item>
                <ListGroup.Item><strong>Trạng thái:</strong> <StatusBadge status={room.status} /></ListGroup.Item>
                <ListGroup.Item><strong>Mô tả:</strong> {room.description}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="fw-semibold bg-success text-white">Tiện nghi</Card.Header>
            <Card.Body>
              {room.amenities && room.amenities.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {room.amenities.map((a) => <Badge key={a} bg="light" text="dark" className="border p-2">{a}</Badge>)}
                </div>
              ) : <p className="text-muted">Không có tiện nghi</p>}
            </Card.Body>
          </Card>
        </Col>

        {tenant && (
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold bg-info text-white">👤 Người đang thuê</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item><strong>Họ tên:</strong> <Link to={`/tenants/${tenant.id}`}>{tenant.fullName}</Link></ListGroup.Item>
                  <ListGroup.Item><strong>SĐT:</strong> {tenant.phone}</ListGroup.Item>
                  <ListGroup.Item><strong>Email:</strong> {tenant.email}</ListGroup.Item>
                  <ListGroup.Item><strong>Ngày vào:</strong> {tenant.checkInDate}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}

        {contracts.length > 0 && (
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Header className="fw-semibold bg-warning">📋 Hợp đồng</Card.Header>
              <Card.Body>
                {contracts.map((c) => (
                  <ListGroup key={c.id} variant="flush">
                    <ListGroup.Item><strong>Từ:</strong> {c.startDate} → {c.endDate}</ListGroup.Item>
                    <ListGroup.Item><strong>Tiền thuê:</strong> {c.monthlyRent.toLocaleString('vi-VN')} VNĐ</ListGroup.Item>
                    <ListGroup.Item><strong>Tiền cọc:</strong> {c.deposit.toLocaleString('vi-VN')} VNĐ</ListGroup.Item>
                    <ListGroup.Item><strong>Trạng thái:</strong> <StatusBadge status={c.status} /></ListGroup.Item>
                  </ListGroup>
                ))}
              </Card.Body>
            </Card>
          </Col>
        )}

        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold bg-secondary text-white">💰 Lịch sử hóa đơn</Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tháng</th>
                    <th>Điện (kWh)</th>
                    <th>Nước (m³)</th>
                    <th>Tiền thuê</th>
                    <th>Tổng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-3">Không có hóa đơn</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.month}</td>
                      <td>{inv.electricityUsage}</td>
                      <td>{inv.waterUsage}</td>
                      <td>{inv.rent.toLocaleString('vi-VN')}</td>
                      <td><strong>{inv.totalAmount.toLocaleString('vi-VN')}</strong></td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default RoomDetail;
