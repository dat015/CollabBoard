import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-konva';
import { Html } from 'react-konva-utils'; // Thần chú giúp render HTML trong Canvas

const EditableText = ({ shape, commonProps, onChange }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(shape.text);

  useEffect(() => {
    setTextValue(shape.text);
  }, [shape.text]);

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleFinish();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTextValue(shape.text); 
    }
  };

  const handleFinish = () => {
    setIsEditing(false);
    onChange({
      ...shape,
      text: textValue
    });
  };

  // --- TRƯỜNG HỢP 1: ĐANG SỬA (Render thẻ HTML đè lên) ---
  if (isEditing) {
    return (
      <Html groupProps={{ x: shape.x, y: shape.y }} divProps={{ style: { opacity: 1 } }}>
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={handleFinish} // Click ra ngoài thì tự lưu
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: shape.width || 'auto',
            height: shape.height || 'auto',
            fontSize: `${shape.fontSize}px`,
            border: 'none',
            padding: '0px',
            margin: '0px',
            background: 'none',
            outline: 'none',
            resize: 'none',
            color: shape.fill,
            fontFamily: 'sans-serif', // Phải khớp với font bên dưới
            lineHeight: 1, // Khớp line-height
            overflow: 'hidden'
          }}
        />
      </Html>
    );
  }

  // --- TRƯỜNG HỢP 2: ĐANG XEM (Render Text Konva bình thường) ---
  return (
    <Text
      {...shape}
      {...commonProps}
      text={textValue} // Hiển thị text hiện tại
      onDblClick={() => setIsEditing(true)} // Double click để kích hoạt sửa
      // Ẩn Text Konva đi nếu đang edit (để tránh bị chồng chữ)
      visible={!isEditing} 
    />
  );
};

export default EditableText;