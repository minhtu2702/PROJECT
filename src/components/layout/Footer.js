import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white-50 text-center py-2 small mt-auto">
      © {new Date().getFullYear()} Hệ Thống Quản Lý Phòng Trọ — FER202
    </footer>
  );
}

export default Footer;
