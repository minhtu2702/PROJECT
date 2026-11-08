import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner, Table } from 'react-bootstrap';
import { invoiceAPI, roomAPI, tenantAPI, serviceAPI } from '../../services/api';

const defaultForm = {
  roomId: '',
  tenantId: '',
  month: '',
  electricityUsage: '',
  electricityPrice: 3500,
  waterUsage: '',
  waterPrice: 15000,
  rent: 0,
  otherFees: 50000,
  totalAmount: 0,
  status: 'unpaid',
  dueDate: '',
  paidDate: null,
};

function InvoiceForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [rRes, tRes, sRes] = await Promise.all([
          roomAPI.getRooms(),
          tenantAPI.getTenants(),
          serviceAPI.getServices(),
        ]);
        setRooms(rRes.data);
        setTenants(tRes.data);
        setServices(sRes.data);
      } catch {
        setError('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const calcTotal = useCallback((f) => {
    const elec = Number(f.electricityUsage || 0) * Number(f.electricityPrice || 0);
    const water = Number(f.waterUsage || 0) * Number(f.waterPrice || 0);
    return Number(f.rent || 0) + elec + water + Number(f.otherFees || 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'roomId') {
        const room = rooms.find((r) => String(r.id) === String(value));
        updated.rent = room ? room.price : 0;
        // Auto-fill tenant if occupied
        if (room && room.status === 'occupied') {
          const tenant = tenants.find((t) => String(t.roomId) === String(room.id));
          updated.tenantId = tenant ? String(tenant.id) : '';
        }
      }
      updated.totalAmount = calcTotal(updated);
      return updated;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const validate = () => {
    if (!form.roomId) return 'Vui lòng chọn phòng.';
    if (!form.month) return 'Vui lòng chọn tháng.';
    if (!form.dueDate) return 'Vui lòng nhập ngày đến hạn.';
    if (form.dueDate < todayStr) return 'Ngày đến hạn thanh toán không được sớm hơn thời gian hiện tại.';
    if (!form.electricityUsage || isNaN(form.electricityUsage)) return 'Vui lòng nhập số kWh điện.';
    if (!form.waterUsage || isNaN(form.waterUsage)) return 'Vui lòng nhập số m³ nước.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        roomId: Number(form.roomId),
        tenantId: form.tenantId ? Number(form.tenantId) : null,
        electricityUsage: Number(form.electricityUsage),
        electricityPrice: Number(form.electricityPrice),
        waterUsage: Number(form.waterUsage),
        waterPrice: Number(form.waterPrice),
        rent: Number(form.rent),
        otherFees: Number(form.otherFees),
        totalAmount: calcTotal(form),
      };
      await invoiceAPI.createInvoice(payload);
      navigate('/invoices');
    } catch {
      setError('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const elecAmount = Number(form.electricityUsage || 0) * Number(form.electricityPrice || 0);
  const waterAmount = Number(form.waterUsage || 0) * Number(form.waterPrice || 0);
  const total = calcTotal(form);

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/invoices')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">Tạo Hóa Đơn</h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="g-3">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="fw-semibold">Thông tin hóa đơn</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phòng <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="roomId" value={form.roomId} onChange={handleChange} required>
                        <option value="">-- Chọn phòng --</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Phòng {r.roomNumber} ({r.status === 'occupied' ? 'Đang thuê' : 'Trống'})
                          </option>
                        ))}
                      </Form.Select>
                      {form.roomId && rooms.find((r) => String(r.id) === String(form.roomId))?.status === 'available' && (
                        <div className="text-warning small mt-1">
                          Thông báo: Phòng này hiện đang trống, chưa có người thuê.
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Người Thuê</Form.Label>
                      <Form.Select name="tenantId" value={form.tenantId} onChange={handleChange}>
                        <option value="">-- Chọn người thuê --</option>
                        {tenants.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Tháng <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="month" name="month" value={form.month} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Ngày Đến Hạn <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="date" name="dueDate" value={form.dueDate} onChange={handleChange} min={todayStr} required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Tiền Thuê (VNĐ)</Form.Label>
                      <Form.Control type="number" name="rent" value={form.rent} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Số kWh Điện <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" name="electricityUsage" value={form.electricityUsage} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Giá Điện/kWh</Form.Label>
                      <Form.Control type="number" name="electricityPrice" value={form.electricityPrice} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Số m³ Nước <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" name="waterUsage" value={form.waterUsage} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Giá Nước/m³</Form.Label>
                      <Form.Control type="number" name="waterPrice" value={form.waterPrice} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phí Khác (VNĐ)</Form.Label>
                      <Form.Control type="number" name="otherFees" value={form.otherFees} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Trạng Thái</Form.Label>
                      <Form.Select name="status" value={form.status} onChange={handleChange}>
                        <option value="unpaid">Chưa thanh toán</option>
                        <option value="paid">Đã thanh toán</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-4 d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" /> : 'Tạo hóa đơn'}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/invoices')}>Hủy</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm bg-light">
            <Card.Header className="fw-semibold">📊 Chi Tiết Tính Toán</Card.Header>
            <Card.Body>
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr><td>Tiền thuê</td><td className="text-end">{Number(form.rent || 0).toLocaleString('vi-VN')}</td></tr>
                  <tr><td>Tiền điện</td><td className="text-end">{elecAmount.toLocaleString('vi-VN')}</td></tr>
                  <tr><td>Tiền nước</td><td className="text-end">{waterAmount.toLocaleString('vi-VN')}</td></tr>
                  <tr><td>Phí khác</td><td className="text-end">{Number(form.otherFees || 0).toLocaleString('vi-VN')}</td></tr>
                  <tr className="table-primary fw-bold">
                    <td>TỔNG CỘNG</td>
                    <td className="text-end">{total.toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Header className="fw-semibold">⚙️ Giá Dịch Vụ</Card.Header>
            <Card.Body className="p-0">
              <Table size="sm" className="mb-0">
                <thead className="table-light"><tr><th>Dịch vụ</th><th>Đơn giá</th></tr></thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}><td>{s.name}</td><td>{s.price.toLocaleString('vi-VN')}/{s.unit}</td></tr>
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

export default InvoiceForm;
