import React from 'react';
import { Badge } from 'react-bootstrap';

const statusMap = {
  occupied:    { variant: 'success',   label: 'Đang thuê' },
  available:   { variant: 'primary',   label: 'Trống' },
  maintenance: { variant: 'warning',   label: 'Bảo trì' },
  active:      { variant: 'success',   label: 'Hiệu lực' },
  expired:     { variant: 'danger',    label: 'Hết hạn' },
  paid:        { variant: 'success',   label: 'Đã thanh toán' },
  unpaid:      { variant: 'danger',    label: 'Chưa thanh toán' },
};

function StatusBadge({ status }) {
  const info = statusMap[status] || { variant: 'secondary', label: status };
  return <Badge bg={info.variant}>{info.label}</Badge>;
}

export default StatusBadge;
