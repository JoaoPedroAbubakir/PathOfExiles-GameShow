import React from 'react';

interface ImageGridProps {
  imageUrl: string;
  gridSize: { rows: number; cols: number };
  revealedPanels: boolean[];
  onPanelClick: (index: number) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  imageUrl,
  gridSize,
  revealedPanels,
  onPanelClick,
}) => {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, index) => (
        <div
          key={index}
          className={`aspect-square relative cursor-pointer transition-all duration-300 ${
            revealedPanels[index] ? 'opacity-0' : 'bg-gray-800'
          }`}
          onClick={() => onPanelClick(index)}
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${gridSize.cols * 100}% ${gridSize.rows * 100}%`,
            backgroundPosition: `${(index % gridSize.cols) * (100 / (gridSize.cols - 1))}% ${
              Math.floor(index / gridSize.cols) * (100 / (gridSize.rows - 1))
            }%`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      ))}
    </div>
  );
};
