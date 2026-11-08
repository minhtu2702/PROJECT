import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Spinner, Alert, Modal, Form, Row, Col } from 'react-bootstrap';
import { serviceAPI } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const defaultForm = { name: '', unit: '', price: '', description: '' };

function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { isAdmin } = useAuth();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceAPI.getServices();
      setServices(res.data);
    } catch {
      setError('Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (svc) => { setEditItem(svc); setForm(svc); setShowModal(true); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.unit || !form.price) { alert('Vui lòng điền đầy đủ thông tin.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editItem) await serviceAPI.updateService(editItem.id, payload);
      else await serviceAPI.createService(payload);
      setShowModal(false);
      fetchServices();
    } catch {
      alert('Lưu thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await serviceAPI.deleteService(deleteId);
      setDeleteId(null);
      fetchServices();
    } catch {
      alert('Xóa thất bại!');
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Quản Lý Dịch Vụ</h4>
        {isAdmin && (
          <Button variant="primary" onClick={openAdd}>+ Thêm Dịch Vụ</Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Tên Dịch Vụ</th>
                <th>Đơn Vị</th>
                <th>Đơn Giá (VNĐ)</th>
                <th>Mô Tả</th>
                {isAdmin && <th className="text-center">Hành Động</th>}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center text-muted py-4">Không có dịch vụ nào</td></tr>
              ) : services.map((svc, idx) => (
                <tr key={svc.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{svc.name}</strong></td>
                  <td>{svc.unit}</td>
                  <td>{svc.price.toLocaleString('vi-VN')}</td>
                  <td className="text-muted small">{svc.description}</td>
                  {isAdmin && (
                    <td className="text-center">
                      <Button size="sm" variant="warning" className="me-1" onClick={() => openEdit(svc)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(svc.id)}>Xóa</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Tên Dịch Vụ <span className="text-danger">*</span></Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} placeholder="VD: Điện, Nước..." />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Đơn Vị <span className="text-danger">*</span></Form.Label>
                <Form.Control name="unit" value={form.unit} onChange={handleChange} placeholder="kWh, m³, tháng" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Đơn Giá (VNĐ) <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" name="price" value={form.price} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Mô Tả</Form.Label>
                <Form.Control as="textarea" rows={2} name="description" value={form.description} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" animation="border" /> : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!deleteId}
        onHide={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa dịch vụ này không?"
      />
    </div>
  );
}

export default ServiceList;
