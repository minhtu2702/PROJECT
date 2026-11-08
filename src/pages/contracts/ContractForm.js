import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { contractAPI, roomAPI, tenantAPI } from '../../services/api';

const defaultForm = {
  roomId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  deposit: '',
  status: 'active',
  terms: '',
};

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const todayStr = getTodayStr();

  useEffect(() => {
    const init = async () => {
      try {
        const [rRes, tRes, cRes] = await Promise.all([
          roomAPI.getRooms(),
          tenantAPI.getTenants(),
          contractAPI.getContracts(),
        ]);
        setRooms(rRes.data);
        setTenants(tRes.data);
        setContracts(cRes.data);

        if (isEdit) {
          const res = await contractAPI.getContractById(id);
          setForm(res.data);
        }
      } catch {
        setError('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  // Check if chosen room already has someone renting it
  const selectedRoom = rooms.find((r) => String(r.id) === String(form.roomId));

  const existingTenant = tenants.find(
    (t) => String(t.roomId) === String(form.roomId) && (!isEdit || String(t.id) !== String(form.tenantId))
  );

  const existingContract = contracts.find(
    (c) =>
      String(c.roomId) === String(form.roomId) &&
      c.status === 'active' &&
      (!isEdit || String(c.id) !== String(id))
  );

  const isRoomOccupied = Boolean(
    (selectedRoom && selectedRoom.status === 'occupied') ||
    existingTenant ||
    existingContract
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-suggest rent and deposit when picking a room
      if (name === 'roomId') {
        const room = rooms.find((r) => String(r.id) === String(value));
        if (room && room.price) {
          if (!prev.monthlyRent) updated.monthlyRent = room.price;
          if (!prev.deposit) updated.deposit = room.price * 2;
        }
      }
      return updated;
    });
    setError('');
  };

  const validate = () => {
    if (!form.roomId) return 'Vui lòng chọn phòng.';

    // Validation: Kiểm tra phòng đã có người thuê
    if (!isEdit && isRoomOccupied) {
      const tenantInfo = existingTenant ? ` (Khách thuê: ${existingTenant.fullName})` : '';
      return `Phòng ${selectedRoom?.roomNumber || form.roomId} hiện đã có người thuê${tenantInfo}! Không thể tạo thêm hợp đồng cho phòng này.`;
    }

    if (!form.startDate) return 'Vui lòng nhập ngày bắt đầu.';

    // Validation: Ngày tạo/bắt đầu không được sớm hơn thời gian hiện tại
    if (!isEdit && form.startDate < todayStr) {
      return `Ngày tạo/bắt đầu hợp đồng (${form.startDate}) không được sớm hơn so với thời gian hiện tại (${todayStr}).`;
    }

    if (!form.endDate) return 'Vui lòng nhập ngày kết thúc.';
    if (form.endDate <= form.startDate) {
      return 'Ngày kết thúc hợp đồng phải sau ngày bắt đầu.';
    }

    // Validation: Thời hạn thuê tối thiểu phải từ 6 tháng trở lên
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (diffMonths < 6 || (diffMonths === 6 && end.getDate() < start.getDate())) {
      return 'Thời hạn hợp đồng thuê phải ít nhất là 6 tháng.';
    }

    if (!form.monthlyRent || isNaN(form.monthlyRent) || Number(form.monthlyRent) <= 0) {
      return 'Vui lòng nhập tiền thuê hợp lệ.';
    }
    if (!form.deposit || isNaN(form.deposit) || Number(form.deposit) < 0) {
      return 'Vui lòng nhập tiền cọc hợp lệ.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        roomId: Number(form.roomId),
        tenantId: form.tenantId ? Number(form.tenantId) : null,
        monthlyRent: Number(form.monthlyRent),
        deposit: Number(form.deposit),
      };

      if (isEdit) {
        await contractAPI.updateContract(id, payload);
      } else {
        await contractAPI.createContract(payload);

        // Auto update room status to occupied if room is not occupied
        if (selectedRoom && selectedRoom.status !== 'occupied') {
          await roomAPI.updateRoom(selectedRoom.id, {
            ...selectedRoom,
            status: 'occupied',
          });
        }

        // Auto link tenant to this room if tenant is selected
        if (form.tenantId) {
          const tenant = tenants.find((t) => String(t.id) === String(form.tenantId));
          if (tenant && !tenant.roomId) {
            await tenantAPI.updateTenant(tenant.id, {
              ...tenant,
              roomId: Number(form.roomId),
              checkInDate: form.startDate,
            });
          }
        }
      }

      navigate('/contracts');
    } catch {
      setError('Lưu thất bại. Vui lòng kiểm tra lại kết nối json-server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/contracts')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">{isEdit ? 'Sửa Hợp Đồng' : 'Thêm Hợp Đồng'}</h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Room select with live occupancy check */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="roomId" value={form.roomId} onChange={handleChange} required>
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((r) => {
                      const occupied = r.status === 'occupied' || contracts.some(
                        (c) => String(c.roomId) === String(r.id) && c.status === 'active' && (!isEdit || String(c.id) !== String(id))
                      );
                      return (
                        <option key={r.id} value={r.id}>
                          Phòng {r.roomNumber} ({occupied ? 'Đã có người thuê' : 'Còn trống'})
                        </option>
                      );
                    })}
                  </Form.Select>

                  {/* Warning notification if selected room is occupied */}
                  {form.roomId && isRoomOccupied && (
                    <Alert variant="warning" className="mt-2 py-2 small mb-0">
                      <strong>Thông báo:</strong> Phòng {selectedRoom?.roomNumber} hiện đã có người thuê
                      {existingTenant ? ` (${existingTenant.fullName})` : ''}. Vui lòng chọn phòng khác!
                    </Alert>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Người Thuê</Form.Label>
                  <Form.Select name="tenantId" value={form.tenantId || ''} onChange={handleChange}>
                    <option value="">-- Chọn người thuê --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.phone})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Start date with past date disabled */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày Bắt Đầu <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    min={!isEdit ? todayStr : undefined}
                    required
                  />
                  <Form.Text className="text-muted">
                    Không được sớm hơn thời gian hiện tại ({todayStr})
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* End date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày Kết Thúc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate || todayStr}
                    required
                  />
                  <Form.Text className="text-muted">
                    Phải sau ngày bắt đầu hợp đồng ít nhất 6 tháng
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tiền Thuê/Tháng (VNĐ) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="monthlyRent"
                    value={form.monthlyRent}
                    onChange={handleChange}
                    placeholder="VD: 2500000"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tiền Cọc (VNĐ) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="deposit"
                    value={form.deposit}
                    onChange={handleChange}
                    placeholder="VD: 5000000"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Trạng Thái</Form.Label>
                  <Form.Select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Hiệu lực</option>
                    <option value="expired">Hết hạn</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Điều Khoản Hợp Đồng</Form.Label>
                  <Form.Control as="textarea" rows={3} name="terms" value={form.terms} onChange={handleChange} placeholder="Điều khoản thanh toán, quy định nhà trọ..." />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={saving || (!isEdit && isRoomOccupied)}
              >
                {saving ? <Spinner size="sm" animation="border" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/contracts')}>Hủy</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ContractForm;