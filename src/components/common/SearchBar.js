import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

function SearchBar({ onSearch, placeholder = 'Tìm kiếm...' }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <InputGroup style={{ maxWidth: 320 }}>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {value && (
        <Button variant="outline-secondary" size="sm" onClick={handleClear}>
          Xóa
        </Button>
      )}
    </InputGroup>
  );
}

export default SearchBar;
