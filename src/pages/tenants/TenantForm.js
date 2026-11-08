import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { tenantAPI, roomAPI } from '../../services/api';

const defaultForm = {
  fullName: '',
  phone: '',
  email: '',
  idCard: '',
  dob: '',
  address: '',
  occupation: '',
  emergencyContact: '',
  roomId: '',
  checkInDate: '',
};

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function TenantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [rooms, setRooms] = useState([]);
  const [otherTenants, setOtherTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const todayStr = getTodayStr();

  useEffect(() => {
    const init = async () => {
      try {
        const [rRes, tRes] = await Promise.all([roomAPI.getRooms(), tenantAPI.getTenants()]);
        setRooms(rRes.data);
        setOtherTenants(tRes.data);

        if (isEdit) {
          const res = await tenantAPI.getTenantById(id);
          setForm({
            ...defaultForm,
            ...res.data,
            roomId: res.data.roomId ? String(res.data.roomId) : '',
            checkInDate: res.data.checkInDate || '',
          });
        }
      } catch {
        setError('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  // Check if chosen room is occupied by someone else
  const selectedRoom = rooms.find((r) => String(r.id) === String(form.roomId));
  const existingTenant = otherTenants.find(
    (t) => String(t.roomId) === String(form.roomId) && (!isEdit || String(t.id) !== String(id))
  );
  const isRoomOccupied = Boolean(
    form.roomId && ((selectedRoom && selectedRoom.status === 'occupied' && (!isEdit || String(selectedRoom.id) !== String(form.roomId))) || existingTenant)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Vui lòng nhập họ tên.';
    if (!form.phone.trim()) return 'Vui lòng nhập số điện thoại.';
    if (!form.idCard.trim()) return 'Vui lòng nhập số CCCD.';

    // Validation: Kiểm tra phòng đã có người thuê
    if (form.roomId && isRoomOccupied) {
      const tenantInfo = existingTenant ? ` (${existingTenant.fullName})` : '';
      return `Phòng ${selectedRoom?.roomNumber || form.roomId} hiện đã có người thuê${tenantInfo}! Vui lòng chọn phòng khác.`;
    }

    // Validation: Ngày vào ở không được sớm hơn hiện tại
    if (!isEdit && form.checkInDate && form.checkInDate < todayStr) {
      return `Ngày nhận phòng (${form.checkInDate}) không được sớm hơn so với thời gian hiện tại (${todayStr}).`;
    }

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
        roomId: form.roomId ? Number(form.roomId) : null,
        checkInDate: form.checkInDate || null,
      };

      if (isEdit) {
        await tenantAPI.updateTenant(id, payload);
      } else {
        await tenantAPI.createTenant(payload);
        // If room is selected, update room status to occupied
        if (selectedRoom && selectedRoom.status === 'available') {
          await roomAPI.updateRoom(selectedRoom.id, {
            ...selectedRoom,
            status: 'occupied',
          });
        }
      }
      navigate('/tenants');
    } catch {
      setError('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/tenants')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">{isEdit ? 'Sửa Người Thuê' : 'Thêm Người Thuê'}</h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Họ Tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số Điện Thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} placeholder="09xxxxxxxx" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số CCCD <span className="text-danger">*</span></Form.Label>
                  <Form.Control name="idCard" value={form.idCard} onChange={handleChange} placeholder="12 chữ số" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày Sinh</Form.Label>
                  <Form.Control type="date" name="dob" value={form.dob || ''} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nghề Nghiệp</Form.Label>
                  <Form.Control name="occupation" value={form.occupation} onChange={handleChange} placeholder="Sinh viên, Nhân viên..." />
                </Form.Group>
              </Col>

              {/* Room assignment with occupied validation */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phòng Đang Thuê</Form.Label>
                  <Form.Select name="roomId" value={form.roomId || ''} onChange={handleChange}>
                    <option value="">-- Chưa gán phòng --</option>
                    {rooms.map((r) => {
                      const occupied = r.status === 'occupied' && (!isEdit || String(r.id) !== String(form.roomId));
                      return (
                        <option key={r.id} value={r.id}>
                          Phòng {r.roomNumber} ({occupied ? 'Đã có người thuê' : 'Còn trống'})
                        </option>
                      );
                    })}
                  </Form.Select>
                  {form.roomId && isRoomOccupied && (
                    <Alert variant="warning" className="mt-2 py-2 small mb-0">
                      <strong>Thông báo:</strong> Phòng {selectedRoom?.roomNumber} hiện đã có người thuê
                      {existingTenant ? ` (${existingTenant.fullName})` : ''}! Vui lòng chọn phòng khác.
                    </Alert>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày Nhận Phòng</Form.Label>
                  <Form.Control
                    type="date"
                    name="checkInDate"
                    value={form.checkInDate || ''}
                    onChange={handleChange}
                    min={!isEdit ? todayStr : undefined}
                  />
                  <Form.Text className="text-muted">
                    Không được sớm hơn thời gian hiện tại ({todayStr})
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Địa Chỉ</Form.Label>
                  <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Liên Hệ Khẩn Cấp</Form.Label>
                  <Form.Control name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Họ tên - SĐT" />
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-4 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={saving || (form.roomId && isRoomOccupied)}>
                {saving ? <Spinner size="sm" animation="border" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/tenants')}>Hủy</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default TenantForm;
