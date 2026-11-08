import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { roomAPI, contractAPI, invoiceAPI, serviceAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

function TenantPortal() {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [contract, setContract] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roomId = user?.roomId || 1;
  const tenantId = user?.tenantId || 1;

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);
        const [rRes, cRes, iRes, sRes] = await Promise.all([
          roomAPI.getRoomById(roomId),
          contractAPI.getContracts({ tenantId }),
          invoiceAPI.getInvoices({ tenantId }),
          serviceAPI.getServices(),
        ]);

        setRoom(rRes.data);
        setContract(cRes.data[0] || null);
        setInvoices(iRes.data);
        setServices(sRes.data);
      } catch (err) {
        setError('Không thể tải thông tin phòng của bạn. Vui lòng kiểm tra json-server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [roomId, tenantId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Đang tải thông tin phòng của bạn...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            Xin chào, {user?.fullName}!
          </h4>
          <p className="text-muted small mb-0">
            Cổng thông tin dành cho Khách thuê phòng (Vai trò: <strong>Tenant</strong>)
          </p>
        </div>
        <Badge bg="success" className="fs-6 px-3 py-2">
          Phòng đang ở: {room?.roomNumber || '101'}
        </Badge>
      </div>

      <Row className="g-4 mb-4">
        {/* Room Info */}
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-primary text-white fw-semibold">
              Thông Tin Phòng Của Bạn
            </Card.Header>
            <Card.Body>
              <Table borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>Số phòng:</td>
                    <td className="fw-bold fs-5 text-primary">Phòng {room?.roomNumber}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Tầng:</td>
                    <td>Tầng {room?.floor}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Diện tích:</td>
                    <td>{room?.area} m²</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Giá thuê cơ bản:</td>
                    <td className="fw-bold text-danger">
                      {Number(room?.price || 0).toLocaleString('vi-VN')} đ/tháng
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Trạng thái:</td>
                    <td><StatusBadge status={room?.status} /></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Mô tả:</td>
                    <td>{room?.description || 'Phòng thoáng mát'}</td>
                  </tr>
                </tbody>
              </Table>

              <hr />
              <div className="small fw-semibold mb-2 text-secondary">Tiện nghi trong phòng:</div>
              <div className="d-flex flex-wrap gap-1">
                {room?.amenities && room.amenities.length > 0 ? (
                  room.amenities.map((item, idx) => (
                    <Badge key={idx} bg="secondary" className="fw-normal">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted small">Cơ bản</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Contract Info */}
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-dark text-white fw-semibold">
              Hợp Đồng Thuê Nhà
            </Card.Header>
            <Card.Body>
              {contract ? (
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '40%' }}>Mã hợp đồng:</td>
                      <td className="fw-bold">#HD-{contract.id}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Ngày bắt đầu:</td>
                      <td>{contract.startDate}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Ngày kết thúc:</td>
                      <td>{contract.endDate}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Tiền thuê hàng tháng:</td>
                      <td className="fw-bold text-primary">
                        {Number(contract.monthlyRent || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Tiền đặt cọc:</td>
                      <td className="fw-bold text-success">
                        {Number(contract.deposit || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Trạng thái:</td>
                      <td><StatusBadge status={contract.status} /></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Điều khoản:</td>
                      <td className="small text-muted">{contract.terms || 'Theo quy định nhà trọ.'}</td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">Chưa có hợp đồng chính thức trong hệ thống.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invoices List */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
          <span>Lịch Sử Hóa Đơn Điện Nước & Tiền Phòng</span>
          <span className="small text-muted font-monospace">{invoices.length} hóa đơn</span>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Tháng</th>
                <th>Điện (kWh)</th>
                <th>Nước (m³)</th>
                <th>Tiền phòng</th>
                <th>Phí dịch vụ</th>
                <th>Tổng cộng</th>
                <th>Hạn thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="fw-semibold">{inv.month}</td>
                    <td>{inv.electricityUsage} kWh ({Number(inv.electricityPrice).toLocaleString('vi-VN')} đ)</td>
                    <td>{inv.waterUsage} m³ ({Number(inv.waterPrice).toLocaleString('vi-VN')} đ)</td>
                    <td>{Number(inv.rent).toLocaleString('vi-VN')} đ</td>
                    <td>{Number(inv.otherFees || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="fw-bold text-danger fs-6">
                      {Number(inv.totalAmount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="small">{inv.dueDate}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-3 text-muted">
                    Chưa có hóa đơn nào phát sinh.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Services Price Reference */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold">
          Bảng Giá Dịch Vụ Quy Định
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Dịch vụ</th>
                <th>Đơn vị tính</th>
                <th>Đơn giá</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id}>
                  <td className="fw-semibold">{svc.name}</td>
                  <td>{svc.unit}</td>
                  <td className="fw-bold text-success">
                    {Number(svc.price).toLocaleString('vi-VN')} đ / {svc.unit}
                  </td>
                  <td className="small text-muted">{svc.description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default TenantPortal;
