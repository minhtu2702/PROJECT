import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ConfirmModal({ show, onHide, onConfirm, title = 'Xác nhận xóa', message = 'Bạn có chắc chắn muốn xóa không?' }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Hủy</Button>
        <Button variant="danger" onClick={onConfirm}>Xóa</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
