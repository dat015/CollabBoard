import useImage from 'use-image';
import { Image as KonvaImage } from 'react-konva';

interface UrlImageProps {
  shape: any;
  commonProps: any; 
}

const UrlImage = ({ shape, commonProps }: UrlImageProps) => {
  const [img] = useImage(shape.src);
  
  return (
    <KonvaImage
      image={img}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      rotation={shape.rotation}
      scaleX={shape.scaleX}
      scaleY={shape.scaleY}
      {...commonProps}
    />
  );
};

export default UrlImage;