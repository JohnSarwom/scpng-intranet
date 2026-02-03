import { useState, useRef } from 'react';
import { AllElementStyles, ElementStyleProperties } from '../types';
import { initialElementStyles } from '../constants/index'; // Assuming initialElementStyles is also in constants

export const useElementStyles = () => {
  const [elementStyles, setElementStyles] = useState<AllElementStyles>(initialElementStyles);
  const [selectedElementKeysForPanel, setSelectedElementKeysForPanel] = useState<string[]>([]);
  const dragStartPositionsSnapshotRef = useRef<{ [key: string]: { x: number, y: number } } | null>(null);
  const activeDraggedElementKeyRef = useRef<string | null>(null);

  const handleElementStyleChange = (elementKey: string, newPartialStyles: Partial<ElementStyleProperties>) => {
    setElementStyles(prev => {
      const existingStyles = prev[elementKey] || { x: 0, y: 0 };
      const cleanedStyles: Partial<ElementStyleProperties> = {};
      const numericProps: (keyof ElementStyleProperties)[] = [
          'fontSize', 'width', 'height', 'letterSpacing', 'borderRadius',
          'zIndex', 'borderTopLeftRadius', 'borderTopRightRadius',
          'borderBottomLeftRadius', 'borderBottomRightRadius', 'opacity'
      ];
       const stringProps: (keyof ElementStyleProperties)[] = [
           'color', 'fontFamily', 'backgroundColor', 'fontWeight', 'content', 'fontStyle'
       ];

      for (const key in newPartialStyles) {
          const styleKey = key as keyof ElementStyleProperties;
          const value = newPartialStyles[styleKey];

          if (numericProps.includes(styleKey)) {
               const parsedValue = value === '' ? undefined : (typeof value === 'number' ? value : parseFloat(String(value)));
               if (parsedValue === undefined || parsedValue === null || isNaN(parsedValue as any)) {
                  (cleanedStyles as any)[styleKey] = undefined;
               } else {
                 (cleanedStyles as any)[styleKey] = parsedValue;
               }
          } else if (stringProps.includes(styleKey)) {
              (cleanedStyles as any)[styleKey] = value === null ? undefined : value;
          } else {
               (cleanedStyles as any)[styleKey] = value;
          }
      }
      return {
        ...prev,
        [elementKey]: {
            ...existingStyles,
            ...cleanedStyles
        } as ElementStyleProperties,
      };
    });
  };

  const handleBulkStyleChange = (updates: { [key: string]: Partial<ElementStyleProperties> }) => {
    setElementStyles(prev => {
      const newState = { ...prev };
       const numericProps: (keyof ElementStyleProperties)[] = [
           'fontSize', 'width', 'height', 'letterSpacing', 'borderRadius',
           'zIndex', 'borderTopLeftRadius', 'borderTopRightRadius',
           'borderBottomLeftRadius', 'borderBottomRightRadius', 'opacity'
       ];
      const stringProps: (keyof ElementStyleProperties)[] = [
           'color', 'fontFamily', 'backgroundColor', 'fontWeight', 'content', 'fontStyle'
      ];

      for (const key in updates) {
        if (newState[key]) {
           const currentStyles = newState[key];
           const updatesForKey = updates[key];
           const mergedStyles: Partial<ElementStyleProperties> = {};

           for (const prop in updatesForKey) {
               const styleProp = prop as keyof ElementStyleProperties;
               const value = updatesForKey[styleProp];
               const parsedValue = value === '' ? undefined : (typeof value === 'number' ? value : parseFloat(String(value)));

               if (numericProps.includes(styleProp) && (parsedValue === undefined || parsedValue === null || isNaN(parsedValue as any))) {
                   (mergedStyles as any)[styleProp] = undefined;
               } else if (stringProps.includes(styleProp)) {
                   (mergedStyles as any)[styleProp] = value === null ? undefined : value;
               }
               else {
                    (mergedStyles as any)[styleProp] = value;
               }
           }
          newState[key] = { ...currentStyles, ...mergedStyles } as ElementStyleProperties;
        }
      }
      return newState;
    });
  };

  const handleAlignment = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElementKeysForPanel.length < 2) return;
    const selectedStyles = selectedElementKeysForPanel.map(key => ({ key, style: elementStyles[key] })).filter(item => item.style);
    if (selectedStyles.length < 2) return;

    const target = selectedStyles[0];
    const updates: { [key: string]: Partial<ElementStyleProperties> } = {};

    selectedStyles.slice(1).forEach(({ key, style }) => {
      let newX = style.x;
      let newY = style.y;
      const targetWidth = target.style.width ?? 0;
      const targetHeight = target.style.height ?? 0;
      const styleWidth = style.width ?? 0;
      const styleHeight = style.height ?? 0;

      switch (type) {
        case 'left':    newX = target.style.x; break;
        case 'center':  newX = target.style.x + targetWidth / 2 - styleWidth / 2; break;
        case 'right':   newX = target.style.x + targetWidth - styleWidth; break;
        case 'top':     newY = target.style.y; break;
        case 'middle':  newY = target.style.y + targetHeight / 2 - styleHeight / 2; break;
        case 'bottom':  newY = target.style.y + targetHeight - styleHeight; break;
      }
      updates[key] = { x: Math.round(newX), y: Math.round(newY) };
    });
    handleBulkStyleChange(updates);
  };

  const handleDistribution = (direction: 'horizontal' | 'vertical') => {
     if (selectedElementKeysForPanel.length < 3) return;
    const selectedStyles = selectedElementKeysForPanel
        .map(key => ({ key, style: elementStyles[key] }))
        .filter(item => item.style);
    if (selectedStyles.length < 3) return;

    const sorted = [...selectedStyles].sort((a, b) => {
      return direction === 'horizontal'
        ? a.style.x - b.style.x
        : a.style.y - b.style.y;
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const getElementSize = (style: ElementStyleProperties, dim: 'width' | 'height') => style[dim] ?? 0;

    if (direction === 'vertical') {
         const totalHeightOfElements = sorted.reduce((acc, el) => acc + getElementSize(el.style, 'height'), 0);
         const totalVerticalDistance = last.style.y - first.style.y;
         const availableSpaceBetweenElements = totalVerticalDistance - totalHeightOfElements;
         const numberOfGaps = sorted.length - 1;
         const gap = numberOfGaps > 0 ? availableSpaceBetweenElements / numberOfGaps : 0;

         if (gap < -0.01) {
            console.warn("Cannot distribute elements vertically, overlap detected.");
             return;
         }
         const updates: { [key: string]: Partial<ElementStyleProperties> } = {};
         let currentY = first.style.y;
         sorted.forEach((item, i) => {
             if (i > 0) {
                 const prevItem = sorted[i - 1];
                 currentY += getElementSize(prevItem.style, 'height') + gap;
                 updates[item.key] = { y: Math.round(currentY) };
             } else {
                  updates[item.key] = { y: Math.round(item.style.y) };
             }
         });
         handleBulkStyleChange(updates);
    } else { // horizontal
         const totalWidthOfElements = sorted.reduce((acc, el) => acc + getElementSize(el.style, 'width'), 0);
         const totalHorizontalDistance = last.style.x - first.style.x;
         const availableSpaceBetweenElements = totalHorizontalDistance - totalWidthOfElements;
         const numberOfGaps = sorted.length - 1;
         const gap = numberOfGaps > 0 ? availableSpaceBetweenElements / numberOfGaps : 0;

         if (gap < -0.01) {
             console.warn("Cannot distribute elements horizontally, overlap detected.");
              return;
          }
         const updates: { [key: string]: Partial<ElementStyleProperties> } = {};
         let currentX = first.style.x;
         sorted.forEach((item, i) => {
           if (i > 0) {
                 const prevItem = sorted[i - 1];
                 currentX += getElementSize(prevItem.style, 'width') + gap;
                 updates[item.key] = { x: Math.round(currentX) };
           } else {
             updates[item.key] = { x: Math.round(item.style.x) };
           }
         });
          handleBulkStyleChange(updates);
    }
  };

  const handleElementSelectInPreview = (elementKey: string | null, isCtrlOrMetaPressed: boolean) => {
    if (elementKey === null) {
      setSelectedElementKeysForPanel([]);
      return;
    }
    setSelectedElementKeysForPanel(prevSelectedKeys => {
      if (isCtrlOrMetaPressed) {
        if (prevSelectedKeys.includes(elementKey)) {
          return prevSelectedKeys.filter(k => k !== elementKey);
        } else {
          return [...prevSelectedKeys, elementKey];
        }
      } else {
        if (prevSelectedKeys.includes(elementKey) && prevSelectedKeys.length === 1) {
            return [];
        }
        return [elementKey];
      }
    });
  };
  
  const handleElementDragStart = (draggedElementKey: string) => {
    if (selectedElementKeysForPanel.includes(draggedElementKey) && selectedElementKeysForPanel.length > 1) {
      activeDraggedElementKeyRef.current = draggedElementKey;
      const snapshot: { [key: string]: { x: number, y: number } } = {};
      selectedElementKeysForPanel.forEach(key => {
        if (elementStyles[key]) {
          snapshot[key] = { x: elementStyles[key].x, y: elementStyles[key].y };
        }
      });
      dragStartPositionsSnapshotRef.current = snapshot;
    } else {
      activeDraggedElementKeyRef.current = null;
      dragStartPositionsSnapshotRef.current = null;
    }
  };

  const handleElementDragStop = (draggedElementKey: string, data: { x: number, y: number }) => {
    const { x: finalX, y: finalY } = data;
    if (
      activeDraggedElementKeyRef.current === draggedElementKey &&
      dragStartPositionsSnapshotRef.current &&
      selectedElementKeysForPanel.includes(draggedElementKey) &&
      selectedElementKeysForPanel.length > 1
    ) {
      const initialPositions = dragStartPositionsSnapshotRef.current;
      const primaryElementInitialPos = initialPositions[draggedElementKey];

      if (!primaryElementInitialPos) {
        handleElementStyleChange(draggedElementKey, { x: finalX, y: finalY });
        activeDraggedElementKeyRef.current = null;
        dragStartPositionsSnapshotRef.current = null;
        return;
      }

      const deltaX = finalX - primaryElementInitialPos.x;
      const deltaY = finalY - primaryElementInitialPos.y;

      const updates: { [key: string]: Partial<ElementStyleProperties> } = {};
      selectedElementKeysForPanel.forEach(key => {
        const selectedElementInitialPos = initialPositions[key];
        if (selectedElementInitialPos) {
          updates[key] = {
            ...elementStyles[key],
            x: Math.round(selectedElementInitialPos.x + deltaX),
            y: Math.round(selectedElementInitialPos.y + deltaY)
          };
        }
      });
      handleBulkStyleChange(updates);
    } else {
      handleElementStyleChange(draggedElementKey, { x: finalX, y: finalY });
    }
    activeDraggedElementKeyRef.current = null;
    dragStartPositionsSnapshotRef.current = null;
  };

  return {
    elementStyles,
    setElementStyles,
    selectedElementKeysForPanel,
    setSelectedElementKeysForPanel,
    handleElementStyleChange,
    handleBulkStyleChange,
    handleAlignment,
    handleDistribution,
    handleElementSelectInPreview,
    handleElementDragStart,
    handleElementDragStop,
    configCardRefs: useRef<{[key: string]: HTMLDivElement | null}>({}) // Keep configCardRefs here if tightly coupled, or manage in parent
  };
}; 