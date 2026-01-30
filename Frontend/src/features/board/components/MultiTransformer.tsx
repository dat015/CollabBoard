import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";

interface MultiTransformerProps {
  selectedIds: Set<string>;
  layerRef: React.RefObject<any>;
}

const MultiTransformer = ({ selectedIds, layerRef }: MultiTransformerProps) => {
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (!trRef.current || !layerRef.current) return;

    const nodes = Array.from(selectedIds)
      .map((id) => layerRef.current.findOne(`#${id}`))
      .filter((node) => node !== undefined);

    if (nodes.length > 0) {
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedIds, layerRef]);

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
    />
  );
};

export default MultiTransformer;