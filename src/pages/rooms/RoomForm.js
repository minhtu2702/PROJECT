import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { roomAPI } from '../../services/api';

const ALL_AMENITIES = ['Máy lạnh', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt', 'Bếp', 'Sofa', 'TV'];

const defaultForm = {
  roomNumber: '',
  floor: '',
  area: '',
  price: '',
  type: 'single',
  status: 'available',
  description: '',
  amenities: [],
};

function RoomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    roomAPI.getRoomById(id)
      .then((res) => { setForm(res.data); setLoading(false); })
      .catch(() => { setError('Không thể tải dữ liệu phòng.'); setLoading(false); });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validate = () => {
    if (!form.roomNumber.trim()) return 'Vui lòng nhập số phòng.';
    if (!form.floor || isNaN(form.floor)) return 'Vui lòng nhập tầng hợp lệ.';
    if (!form.area || isNaN(form.area)) return 'Vui lòng nhập diện tích hợp lệ.';
    if (!form.price || isNaN(form.price)) return 'Vui lòng nhập giá hợp lệ.';
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
        floor: Number(form.floor),
        area: Number(form.area),
        price: Number(form.price),
      };
      if (isEdit) await roomAPI.updateRoom(id, payload);
      else await roomAPI.createRoom(payload);
      navigate('/rooms');
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
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/rooms')}>Quay lại</Button>
        <h4 className="fw-bold mb-0">{isEdit ? 'Sửa Phòng' : 'Thêm Phòng Mới'}</h4>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Số Phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Control name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="VD: 101" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tầng <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="VD: 1" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Diện Tích (m²) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="area" value={form.area} onChange={handleChange} placeholder="VD: 25" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Giá Thuê (VNĐ) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="price" value={form.price} onChange={handleChange} placeholder="VD: 2500000" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Loại Phòng</Form.Label>
                  <Form.Select name="type" value={form.type} onChange={handleChange}>
                    <option value="single">Đơn</option>
                    <option value="double">Đôi</option>
                    <option value="studio">Studio</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Trạng Thái</Form.Label>
                  <Form.Select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Trống</option>
                    <option value="occupied">Đang thuê</option>
                    <option value="maintenance">Bảo trì</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Mô Tả</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Label>Tiện Nghi</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {ALL_AMENITIES.map((a) => (
                    <Form.Check
                      key={a}
                      type="checkbox"
                      id={`amenity-${a}`}
                      label={a}
                      checked={(form.amenities || []).includes(a)}
                      onChange={() => handleAmenity(a)}
                      inline
                    />
                  ))}
                </div>
              </Col>
            </Row>
            <div className="mt-4 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner size="sm" animation="border" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/rooms')}>Hủy</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RoomForm;
