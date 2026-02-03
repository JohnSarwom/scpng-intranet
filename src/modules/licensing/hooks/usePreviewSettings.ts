import { useState } from 'react';
import { PREVIEW_SIZES } from '../constants/index';

export const usePreviewSettings = () => {
  const [previewSizePreset, setPreviewSizePreset] = useState<string>('ORIGINAL_DESIGN');
  const [previewWidth, setPreviewWidth] = useState<number>(PREVIEW_SIZES.ORIGINAL_DESIGN.width);
  const [previewHeight, setPreviewHeight] = useState<number>(PREVIEW_SIZES.ORIGINAL_DESIGN.height);

  const handlePreviewSizeChange = (newPreset: string, customWidth?: number, customHeight?: number) => {
    setPreviewSizePreset(newPreset);
    if (newPreset === 'CUSTOM') {
      if (customWidth !== undefined) setPreviewWidth(customWidth);
      else if (previewSizePreset !== 'CUSTOM') setPreviewWidth(PREVIEW_SIZES.ORIGINAL_DESIGN.width);

      if (customHeight !== undefined) setPreviewHeight(customHeight);
      else if (previewSizePreset !== 'CUSTOM') setPreviewHeight(PREVIEW_SIZES.ORIGINAL_DESIGN.height);

    } else {
      const selected = PREVIEW_SIZES[newPreset as keyof typeof PREVIEW_SIZES];
      if (selected) {
        setPreviewWidth(selected.width);
        setPreviewHeight(selected.height);
      }
    }
  };

  return {
    previewSizePreset,
    previewWidth,
    previewHeight,
    handlePreviewSizeChange,
    setPreviewWidth, // Expose setters if direct manipulation is needed from parent
    setPreviewHeight,
    setPreviewSizePreset
  };
}; 