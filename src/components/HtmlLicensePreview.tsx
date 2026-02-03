import React, { useRef, MouseEvent as ReactMouseEvent, FocusEvent, useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import styles from './HtmlLicensePreview.module.css';
// Import ElementStyleProperties and AllElementStyles from the shared types file
import { ElementStyleProperties, AllElementStyles } from '../modules/licensing/types'; 

// Match the FormData interface from LicensingRegistry.tsx
interface FormData {
  issuedDate: string;
  expiryDate: string;
  licenseNumber: string;
  licenseeName: string;
  regulatedActivity: string;
  legalReference: string;
  signatoryName: string;
  signatoryTitle: string;
  subtitle?: string;
  subtitle2?: string;
  subtitle3?: string;
  licenseNumberDottedLineContent?: string;
  licenseNumberDottedLine2Content?: string;
  leftSections?: string;
  leftAuthorizedActivity?: string;
  rightSideActivityDisplay?: string;
}

interface HtmlLicensePreviewProps {
  formData: FormData;
  onTextChange: (fieldName: keyof FormData, value: string) => void;
  elementStyles: AllElementStyles; 
  onElementStyleChange: (elementKey: string, styles: Partial<ElementStyleProperties>) => void;
  previewWidth: number;
  previewHeight: number;
  onElementSelect: (elementKey: string | null, isCtrlOrMetaPressed: boolean) => void;
  selectedElementKeys: string[];
  onElementDragStart: (elementKey: string) => void;
  onElementDragStop: (elementKey: string, data: DraggableData) => void;
  onElementCopy?: (elementKeys: string[]) => void;
  onElementPaste?: (options: { defaultOffsetX: number, defaultOffsetY: number }) => void;
  onElementDuplicate?: (elementKey: string) => void;
  onElementDelete?: (elementKey: string) => void;
}

interface ResizingState {
  active: boolean;
  elementKey: string | null;
  handleType: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'right' | 'left' | 'top' | 'bottom';
  startX: number;
  startY: number;
  initialWidth: number;
  initialHeight: number;
  initialX: number;
  initialY: number;
}

const HtmlLicensePreview = React.forwardRef<HTMLDivElement, HtmlLicensePreviewProps>(({ 
  formData, 
  onTextChange, 
  elementStyles, 
  onElementStyleChange,
  previewWidth,
  previewHeight,
  onElementSelect,
  selectedElementKeys,
  onElementDragStart,
  onElementDragStop,
  onElementCopy,
  onElementPaste,
  onElementDuplicate,
  onElementDelete
}, ref) => {
  const elementRefs = useRef<{[key: string]: HTMLElement | null}>({});
  Object.keys(elementStyles).forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    elementRefs.current[key] = useRef(null).current;
  });
  
  // State for context menu
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTargetKey, setContextMenuTargetKey] = useState<string | null>(null);

  // State for resizing
  const [resizingState, setResizingState] = useState<ResizingState>({
    active: false,
    elementKey: null,
    handleType: 'bottom-right', // Default, will be set on mousedown
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialX: 0,
    initialY: 0,
  });

  // Refs for specific elements (could be part of elementRefs.current if consistently named)
  const headerLogoRef = useRef<HTMLImageElement>(null);
  const securitiesCommissionTextRef = useRef<HTMLHeadingElement>(null);
  const ofPapuaNewGuineaTextRef = useRef<HTMLHeadingElement>(null);
  const issuedLabelTextRef = useRef<HTMLParagraphElement>(null);
  const issuedDateTextRef = useRef<HTMLSpanElement>(null);
  const expiryLabelTextRef = useRef<HTMLParagraphElement>(null);
  const expiryDateTextRef = useRef<HTMLSpanElement>(null);
  const licenseNumberHeaderTextRef = useRef<HTMLSpanElement>(null);
  const licenseNumberDottedLineTextRef = useRef<HTMLParagraphElement>(null);
  const licenseNumberDottedLine2TextRef = useRef<HTMLParagraphElement>(null);
  const capitalMarketActTextRef = useRef<HTMLHeadingElement>(null);
  const actDetailsTextRef = useRef<HTMLParagraphElement>(null);
  const sidebarPara1StaticTextRef = useRef<HTMLSpanElement>(null);
  const sidebarRegulatedActivityTextRef = useRef<HTMLSpanElement>(null);
  const sidebarPara2TextRef = useRef<HTMLParagraphElement>(null);
  const qrCodeRef = useRef<HTMLImageElement>(null);
  const verticalGoldLineRef = useRef<HTMLDivElement>(null);

  const mainTitleBannerRef = useRef<HTMLDivElement>(null);
  const mainLicenseTitleTextRef = useRef<HTMLHeadingElement>(null);
  const grantedToLabelTextRef = useRef<HTMLParagraphElement>(null);
  const granteeNameTextRef = useRef<HTMLHeadingElement>(null);
  const subtitleTextRef = useRef<HTMLHeadingElement>(null);
  const subtitleText2Ref = useRef<HTMLHeadingElement>(null);
  const subtitleText3Ref = useRef<HTMLHeadingElement>(null);
  const regulatedActivityMainTextRef = useRef<HTMLParagraphElement>(null);
  const legalReferenceMainTextRef = useRef<HTMLParagraphElement>(null);
  const signatureNameTextRef = useRef<HTMLParagraphElement>(null);
  const signatureTitleTextRef = useRef<HTMLParagraphElement>(null);
  const footerLogoRef = useRef<HTMLImageElement>(null);
  const footerBannerRef = useRef<HTMLDivElement>(null);
  const footerLicenseNoLabelTextRef = useRef<HTMLSpanElement>(null);
  const footerLicenseNoValueTextRef = useRef<HTMLSpanElement>(null);

  const getStyle = (key: keyof AllElementStyles): ElementStyleProperties => {
    const style = elementStyles[key];
    if (!style) {
      console.warn(`Style key "${String(key)}" not found. Using default fallback.`);
      return { x: 0, y: 0, width: 10, height: 10, backgroundColor: 'red', zIndex: 1000, fontSize: 8, color: 'white' };
    }
    return style;
  };

  // Specific onBlur for FormData fields
  const handleFormDataTextBlur = (e: FocusEvent<HTMLElement>, fieldName: keyof FormData) => {
    onTextChange(fieldName, e.currentTarget.textContent || '');
  };

  // Generic onBlur for static, contentEditable text elements
  const handleStaticTextBlur = (e: FocusEvent<HTMLElement>, elementKey: string) => {
    console.log(`Static text blurred for ${elementKey}: ${e.currentTarget.textContent}`);
  };

  const handleElementClick = (event: ReactMouseEvent<HTMLElement>, key: string) => {
    event.stopPropagation();
    onElementSelect(key, event.ctrlKey || event.metaKey);
  };

  const handleContainerClick = () => {
    onElementSelect(null, false);
  };

  // Log received selected keys on re-render
  console.log("HtmlLicensePreview received selectedElementKeys:", selectedElementKeys);

  // Effect for global keydown (copy/paste) and click (hide context menu)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && event.key === 'c') {
        if (onElementCopy && selectedElementKeys.length > 0) {
          onElementCopy(selectedElementKeys);
          console.log('Copy action triggered for:', selectedElementKeys);
        }
      }

      if (isCtrlOrMeta && event.key === 'v') {
        if (onElementPaste) {
          onElementPaste({ defaultOffsetX: 20, defaultOffsetY: 20 });
          console.log('Paste action triggered');
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Simple check; for more robust solution, check if click is inside the context menu itself
      if (contextMenuVisible) {
        setContextMenuVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [selectedElementKeys, onElementCopy, onElementPaste, contextMenuVisible]);

  // Effect for global mouse move and mouse up during resizing
  useEffect(() => {
    const handleMouseMoveGlobal = (event: MouseEvent) => {
      if (!resizingState.active || !resizingState.elementKey) return;

      const { clientX, clientY } = event;
      const deltaX = clientX - resizingState.startX;
      const deltaY = clientY - resizingState.startY;

      let newWidth = resizingState.initialWidth;
      let newHeight = resizingState.initialHeight;
      // let newX = resizingState.initialX; // Will be used for other handles
      // let newY = resizingState.initialY; // Will be used for other handles

      // Basic bottom-right resizing
      if (resizingState.handleType === 'bottom-right') {
        newWidth = Math.max(10, resizingState.initialWidth + deltaX); // Min width 10px
        newHeight = Math.max(10, resizingState.initialHeight + deltaY); // Min height 10px
      }
      // Add logic for other handle types here later

      onElementStyleChange(resizingState.elementKey, {
        width: newWidth,
        height: newHeight,
        // x: newX, // If position changes
        // y: newY, // If position changes
      });
    };

    const handleMouseUpGlobal = () => {
      if (resizingState.active) {
        setResizingState(prev => ({ ...prev, active: false, elementKey: null }));
      }
    };

    if (resizingState.active) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [resizingState, onElementStyleChange]);

  const handleElementContextMenu = (event: ReactMouseEvent<HTMLElement>, key: string) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent container click from deselecting
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuTargetKey(key);
    setContextMenuVisible(true);
    // Optionally, select the right-clicked element if not already selected
    if (!selectedElementKeys.includes(key)) {
        onElementSelect(key, false); // Select only this element
    }
  };

  const handleDuplicateClick = () => {
    if (onElementDuplicate && contextMenuTargetKey) {
      onElementDuplicate(contextMenuTargetKey);
    }
    setContextMenuVisible(false);
  };

  const handleDeleteClick = () => {
    if (onElementDelete && contextMenuTargetKey) {
      onElementDelete(contextMenuTargetKey);
    }
    setContextMenuVisible(false);
  };

  const handleResizeHandleMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>,
    elementKey: string,
    handleType: ResizingState['handleType']
  ) => {
    event.stopPropagation(); // Prevent element dragging
    event.preventDefault(); // Prevent text selection, etc.

    const elementStyle = getStyle(elementKey);
    if (elementStyle.width === undefined || elementStyle.height === undefined) {
      console.warn("Element cannot be resized without explicit width/height:", elementKey);
      return;
    }

    setResizingState({
      active: true,
      elementKey,
      handleType,
      startX: event.clientX,
      startY: event.clientY,
      initialWidth: elementStyle.width,
      initialHeight: elementStyle.height,
      initialX: elementStyle.x,
      initialY: elementStyle.y,
    });
  };

  // Helper to combine styles from getStyle with absolute positioning
  const combineStyles = (key: string, additionalStyles: React.CSSProperties = {}): React.CSSProperties => {
    const baseStyle = getStyle(key);

    // DEBUG: Log style generation for ANY element when selection changes
    console.log(`combineStyles for key: ${key}`);

    const combined: React.CSSProperties = {
        ...baseStyle, 
        position: 'absolute' as 'absolute', // Explicitly cast to satisfy type checker
        left: `${baseStyle.x}px`, 
        top: `${baseStyle.y}px`,
        width: baseStyle.width !== undefined ? `${baseStyle.width}px` : undefined,
        height: baseStyle.height !== undefined ? `${baseStyle.height}px` : undefined,
        fontSize: baseStyle.fontSize !== undefined ? `${baseStyle.fontSize}px` : undefined,
        letterSpacing: baseStyle.letterSpacing !== undefined ? `${baseStyle.letterSpacing}px` : undefined,
        fontStyle: baseStyle.fontStyle,
        borderRadius: baseStyle.borderRadius !== undefined ? `${baseStyle.borderRadius}px` : undefined,
        textShadow: baseStyle.textShadow,
        borderTopLeftRadius: baseStyle.borderTopLeftRadius !== undefined ? `${baseStyle.borderTopLeftRadius}px` : undefined,
        borderTopRightRadius: baseStyle.borderTopRightRadius !== undefined ? `${baseStyle.borderTopRightRadius}px` : undefined,
        borderBottomLeftRadius: baseStyle.borderBottomLeftRadius !== undefined ? `${baseStyle.borderBottomLeftRadius}px` : undefined,
        borderBottomRightRadius: baseStyle.borderBottomRightRadius !== undefined ? `${baseStyle.borderBottomRightRadius}px` : undefined,
        boxSizing: 'border-box' as 'border-box',
        ...additionalStyles,
    };

    // DEBUG: Log final style object when selected
    console.log(`   Final combined style:`, combined);
    
    return combined;
  };

  // Helper to render resize handles
  const renderResizeHandles = (elementKey: string) => {
    return null;
    const elementStyle = getStyle(elementKey);
    if (elementStyle.width === undefined || elementStyle.height === undefined) {
      return null; // Only show handles for elements with explicit width/height
    }

    const handleSize = 8; // Size of the resize handle
    const handleOffset = -handleSize / 2;

    // Define handles: [type, cursor, styles]
    const handles: Array<{ type: ResizingState['handleType']; cursor: string; style: React.CSSProperties }> = [
      // Corners
      {
        type: 'top-left',
        cursor: 'nwse-resize',
        style: { top: `${handleOffset}px`, left: `${handleOffset}px` },
      },
      {
        type: 'top-right',
        cursor: 'nesw-resize',
        style: { top: `${handleOffset}px`, right: `${handleOffset}px` },
      },
      {
        type: 'bottom-left',
        cursor: 'nesw-resize',
        style: { bottom: `${handleOffset}px`, left: `${handleOffset}px` },
      },
      {
        type: 'bottom-right',
        cursor: 'nwse-resize',
        style: { bottom: `${handleOffset}px`, right: `${handleOffset}px` },
      },
      // Edges
      {
        type: 'top',
        cursor: 'ns-resize',
        style: { top: `${handleOffset}px`, left: `calc(50% - ${handleSize / 2}px)`, width: `${handleSize}px`, height: `${handleSize}px` },
      },
      {
        type: 'bottom',
        cursor: 'ns-resize',
        style: { bottom: `${handleOffset}px`, left: `calc(50% - ${handleSize / 2}px)`, width: `${handleSize}px`, height: `${handleSize}px` },
      },
      {
        type: 'left',
        cursor: 'ew-resize',
        style: { top: `calc(50% - ${handleSize / 2}px)`, left: `${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px` },
      },
      {
        type: 'right',
        cursor: 'ew-resize',
        style: { top: `calc(50% - ${handleSize / 2}px)`, right: `${handleOffset}px`, width: `${handleSize}px`, height: `${handleSize}px` },
      },
    ];

    return handles.map(handle => (
      <div
        key={handle.type}
        className={styles.resizeHandle} // You'll need to define this style
        style={{
          position: 'absolute',
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          backgroundColor: 'rgba(0, 0, 255, 0.7)', // Example style
          border: '1px solid white',
          borderRadius: '50%',
          cursor: handle.cursor,
          zIndex: (elementStyle.zIndex || 0) + 1, // Ensure handles are above the element
          ...handle.style,
        }}
        onMouseDown={(e) => handleResizeHandleMouseDown(e, elementKey, handle.type)}
      />
    ));
  };

  return (
    <div 
      ref={ref} 
      className={styles.licenseContainer}
      style={{
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
        position: 'relative',
      }}
      onClick={handleContainerClick}
    >
      {/* Header Elements */}
      <Draggable nodeRef={headerLogoRef} position={getStyle('headerLogo')} onStart={() => onElementDragStart('headerLogo')} onStop={(e, data) => onElementDragStop('headerLogo', data)}>
        <img ref={headerLogoRef} src="/images/SCPNG Original Logo.png" alt="SCPNG Header Logo" title="headerLogo" onClick={(e) => handleElementClick(e, 'headerLogo')} onContextMenu={(e) => handleElementContextMenu(e, 'headerLogo')} className={selectedElementKeys.includes('headerLogo') ? styles.selectedElementOutline : ''} style={combineStyles('headerLogo')}/>
      </Draggable>
      <Draggable nodeRef={securitiesCommissionTextRef} position={getStyle('securitiesCommissionText')} onStart={() => onElementDragStart('securitiesCommissionText')} onStop={(e, data) => onElementDragStop('securitiesCommissionText', data)}>
        <h1 ref={securitiesCommissionTextRef} title="securitiesCommissionText" onClick={(e) => handleElementClick(e, 'securitiesCommissionText')} onContextMenu={(e) => handleElementContextMenu(e, 'securitiesCommissionText')} onBlur={(e) => handleStaticTextBlur(e, 'securitiesCommissionText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('securitiesCommissionText') ? styles.selectedElementOutline : ''} style={combineStyles('securitiesCommissionText')}>SECURITIES COMMISSION</h1>
      </Draggable>
      <Draggable nodeRef={ofPapuaNewGuineaTextRef} position={getStyle('ofPapuaNewGuineaText')} onStart={() => onElementDragStart('ofPapuaNewGuineaText')} onStop={(e, data) => onElementDragStop('ofPapuaNewGuineaText', data)}>
        <h2 ref={ofPapuaNewGuineaTextRef} title="ofPapuaNewGuineaText" onClick={(e) => handleElementClick(e, 'ofPapuaNewGuineaText')} onContextMenu={(e) => handleElementContextMenu(e, 'ofPapuaNewGuineaText')} onBlur={(e) => handleStaticTextBlur(e, 'ofPapuaNewGuineaText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('ofPapuaNewGuineaText') ? styles.selectedElementOutline : ''} style={combineStyles('ofPapuaNewGuineaText')}>OF PAPUA NEW GUINEA</h2>
      </Draggable>
      <Draggable nodeRef={issuedLabelTextRef} position={getStyle('issuedLabelText')} onStart={() => onElementDragStart('issuedLabelText')} onStop={(e, data) => onElementDragStop('issuedLabelText', data)}>
        <p ref={issuedLabelTextRef} title="issuedLabelText" onClick={(e) => handleElementClick(e, 'issuedLabelText')} onBlur={(e) => handleStaticTextBlur(e, 'issuedLabelText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('issuedLabelText') ? styles.selectedElementOutline : ''} style={combineStyles('issuedLabelText')}>ISSUED:</p>
      </Draggable>
      <Draggable nodeRef={issuedDateTextRef} position={getStyle('issuedDateText')} onStart={() => onElementDragStart('issuedDateText')} onStop={(e, data) => onElementDragStop('issuedDateText', data)}>
        <span ref={issuedDateTextRef} title="issuedDateText" onClick={(e) => handleElementClick(e, 'issuedDateText')} onBlur={(e) => handleFormDataTextBlur(e, 'issuedDate')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('issuedDateText') ? styles.selectedElementOutline : ''} style={combineStyles('issuedDateText')}>{formData.issuedDate}</span>
      </Draggable>
      <Draggable nodeRef={expiryLabelTextRef} position={getStyle('expiryLabelText')} onStart={() => onElementDragStart('expiryLabelText')} onStop={(e, data) => onElementDragStop('expiryLabelText', data)}>
        <p ref={expiryLabelTextRef} title="expiryLabelText" onClick={(e) => handleElementClick(e, 'expiryLabelText')} onBlur={(e) => handleStaticTextBlur(e, 'expiryLabelText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('expiryLabelText') ? styles.selectedElementOutline : ''} style={combineStyles('expiryLabelText')}>EXPIRY:</p>
      </Draggable>
      <Draggable nodeRef={expiryDateTextRef} position={getStyle('expiryDateText')} onStart={() => onElementDragStart('expiryDateText')} onStop={(e, data) => onElementDragStop('expiryDateText', data)}>
        <span ref={expiryDateTextRef} title="expiryDateText" onClick={(e) => handleElementClick(e, 'expiryDateText')} onBlur={(e) => handleFormDataTextBlur(e, 'expiryDate')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('expiryDateText') ? styles.selectedElementOutline : ''} style={{...getStyle('expiryDateText') as any, position:'absolute'}}>{formData.expiryDate}</span>
      </Draggable>
      <Draggable nodeRef={licenseNumberHeaderTextRef} bounds="parent" position={{ x: getStyle('licenseNumberHeaderText').x, y: getStyle('licenseNumberHeaderText').y }} onStart={() => onElementDragStart('licenseNumberHeaderText')} onStop={(_, data) => onElementDragStop('licenseNumberHeaderText', data)} >
        <span
          ref={licenseNumberHeaderTextRef}
          contentEditable
          suppressContentEditableWarning
          className={`${styles.draggableElement} ${selectedElementKeys.includes('licenseNumberHeaderText') ? styles.selected : ''}`}
          style={combineStyles('licenseNumberHeaderText')}
          onBlur={(e) => handleFormDataTextBlur(e, 'licenseNumber')}
          onClick={(e) => handleElementClick(e, 'licenseNumberHeaderText')}
          onContextMenu={(e) => handleElementContextMenu(e, 'licenseNumberHeaderText')}
          data-testid="licenseNumberHeaderText"
        >
          {formData.licenseNumber}
          {renderResizeHandles('licenseNumberHeaderText')}
        </span>
      </Draggable>

      {/* License Number Dotted Line 1 - New */}
      {formData.licenseNumberDottedLineContent && getStyle('licenseNumberDottedLine') && (
        <Draggable nodeRef={licenseNumberDottedLineTextRef} bounds="parent" position={{ x: getStyle('licenseNumberDottedLine').x, y: getStyle('licenseNumberDottedLine').y }} onStart={() => onElementDragStart('licenseNumberDottedLine')} onStop={(_, data) => onElementDragStop('licenseNumberDottedLine', data)} >
          <p
            ref={licenseNumberDottedLineTextRef}
            contentEditable
            suppressContentEditableWarning
            className={`${styles.draggableElement} ${selectedElementKeys.includes('licenseNumberDottedLine') ? styles.selected : ''}`}
            style={combineStyles('licenseNumberDottedLine')}
            onBlur={(e) => onTextChange('licenseNumberDottedLineContent' as any, e.currentTarget.textContent || '')}
            onClick={(e) => handleElementClick(e, 'licenseNumberDottedLine')}
            onContextMenu={(e) => handleElementContextMenu(e, 'licenseNumberDottedLine')}
            data-testid="licenseNumberDottedLine"
          >
            {formData.licenseNumberDottedLineContent}
            {renderResizeHandles('licenseNumberDottedLine')}
          </p>
        </Draggable>
      )}

      {/* License Number Dotted Line 2 - New */}
      {formData.licenseNumberDottedLine2Content && getStyle('licenseNumberDottedLine2') && (
         <Draggable nodeRef={licenseNumberDottedLine2TextRef} bounds="parent" position={{ x: getStyle('licenseNumberDottedLine2').x, y: getStyle('licenseNumberDottedLine2').y }} onStart={() => onElementDragStart('licenseNumberDottedLine2')} onStop={(_, data) => onElementDragStop('licenseNumberDottedLine2', data)} >
          <p
            ref={licenseNumberDottedLine2TextRef}
            contentEditable
            suppressContentEditableWarning
            className={`${styles.draggableElement} ${selectedElementKeys.includes('licenseNumberDottedLine2') ? styles.selected : ''}`}
            style={combineStyles('licenseNumberDottedLine2')}
            onBlur={(e) => onTextChange('licenseNumberDottedLine2Content' as any, e.currentTarget.textContent || '')}
            onClick={(e) => handleElementClick(e, 'licenseNumberDottedLine2')}
            onContextMenu={(e) => handleElementContextMenu(e, 'licenseNumberDottedLine2')}
            data-testid="licenseNumberDottedLine2"
          >
            {formData.licenseNumberDottedLine2Content}
            {renderResizeHandles('licenseNumberDottedLine2')}
          </p>
        </Draggable>
      )}

      {/* Sidebar Elements */}
      <Draggable nodeRef={capitalMarketActTextRef} position={getStyle('capitalMarketActText')} onStart={() => onElementDragStart('capitalMarketActText')} onStop={(e, data) => onElementDragStop('capitalMarketActText', data)}>
        <h3 ref={capitalMarketActTextRef} title="capitalMarketActText" onClick={(e) => handleElementClick(e, 'capitalMarketActText')} onBlur={(e) => handleStaticTextBlur(e, 'capitalMarketActText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('capitalMarketActText') ? styles.selectedElementOutline : ''} style={{...getStyle('capitalMarketActText') as any, position:'absolute'}}>CAPITAL MARKET ACT 2015</h3>
      </Draggable>
      <Draggable nodeRef={actDetailsTextRef} position={getStyle('actDetailsText')} onStart={() => onElementDragStart('actDetailsText')} onStop={(e, data) => onElementDragStop('actDetailsText', data)}>
        <p 
          ref={actDetailsTextRef} 
          title="actDetailsText" 
          onClick={(e) => handleElementClick(e, 'actDetailsText')} 
          onBlur={(e) => handleFormDataTextBlur(e, 'leftSections' as keyof FormData)} 
          contentEditable 
          suppressContentEditableWarning 
          className={selectedElementKeys.includes('actDetailsText') ? styles.selectedElementOutline : ''} 
          style={{...getStyle('actDetailsText') as any, position:'absolute'}}
        >
          {formData.leftSections}
        </p>
      </Draggable>
      <Draggable nodeRef={sidebarPara1StaticTextRef} position={getStyle('sidebarPara1StaticText')} onStart={() => onElementDragStart('sidebarPara1StaticText')} onStop={(e, data) => onElementDragStop('sidebarPara1StaticText', data)}>
        <span ref={sidebarPara1StaticTextRef} title="sidebarPara1StaticText" onClick={(e) => handleElementClick(e, 'sidebarPara1StaticText')} onBlur={(e) => handleStaticTextBlur(e, 'sidebarPara1StaticText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('sidebarPara1StaticText') ? styles.selectedElementOutline : ''} style={{...getStyle('sidebarPara1StaticText') as any, position:'absolute'}}>This Capital Market authorises the licensee to conduct the below stipulated regulated activity: </span>
      </Draggable>
      <Draggable nodeRef={sidebarRegulatedActivityTextRef} position={getStyle('sidebarRegulatedActivityText')} onStart={() => onElementDragStart('sidebarRegulatedActivityText')} onStop={(e, data) => onElementDragStop('sidebarRegulatedActivityText', data)}>
        <span ref={sidebarRegulatedActivityTextRef} title="sidebarRegulatedActivityText" onClick={(e) => handleElementClick(e, 'sidebarRegulatedActivityText')} onBlur={(e) => handleFormDataTextBlur(e, 'regulatedActivity')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('sidebarRegulatedActivityText') ? styles.selectedElementOutline : ''} style={{...getStyle('sidebarRegulatedActivityText') as any, position:'absolute'}}>{formData.regulatedActivity}</span>
      </Draggable>
      <Draggable nodeRef={sidebarPara2TextRef} position={getStyle('sidebarPara2Text')} onStart={() => onElementDragStart('sidebarPara2Text')} onStop={(e, data) => onElementDragStop('sidebarPara2Text', data)}>
        <p ref={sidebarPara2TextRef} title="sidebarPara2Text" onClick={(e) => handleElementClick(e, 'sidebarPara2Text')} onBlur={(e) => handleStaticTextBlur(e, 'sidebarPara2Text')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('sidebarPara2Text') ? styles.selectedElementOutline : ''} style={{...getStyle('sidebarPara2Text') as any, position:'absolute', width: getStyle('sidebarPara2Text').width ? `${getStyle('sidebarPara2Text').width}px` : 'auto'}}>The license remains valid, subject to compliance with requirements for approval, grant and renewal stipulated in the Capital Market Act 2015. Issued by authority of the Securities Commission of Papua New Guinea.</p>
      </Draggable>

      {/* QR Code Element */}
      <Draggable nodeRef={qrCodeRef} position={getStyle('qrCode')} onStart={() => onElementDragStart('qrCode')} onStop={(e, data) => onElementDragStop('qrCode', data)}>
        <img 
          ref={qrCodeRef} 
          src="/images/scpng_qr_code.png" 
          alt="QR Code" 
          title="qrCode" 
          onClick={(e) => handleElementClick(e, 'qrCode')} 
          onContextMenu={(e) => handleElementContextMenu(e, 'qrCode')} 
          className={selectedElementKeys.includes('qrCode') ? styles.selectedElementOutline : ''} 
          style={combineStyles('qrCode')}
        />
      </Draggable>

      {/* Vertical Gold Line */}
      <Draggable nodeRef={verticalGoldLineRef} position={getStyle('verticalGoldLine')} onStart={() => onElementDragStart('verticalGoldLine')} onStop={(e, data) => onElementDragStop('verticalGoldLine', data)} bounds=".licenseContainer">
        <div ref={verticalGoldLineRef} title="verticalGoldLine" onClick={(e) => handleElementClick(e, 'verticalGoldLine')} className={selectedElementKeys.includes('verticalGoldLine') ? styles.selectedElementOutline : ''} style={{...getStyle('verticalGoldLine') as any, position:'absolute' }}></div>
      </Draggable>

      {/* Main Content Elements */}
      <Draggable nodeRef={mainTitleBannerRef} position={getStyle('mainTitleBanner')} onStart={() => onElementDragStart('mainTitleBanner')} onStop={(e, data) => onElementDragStop('mainTitleBanner', data)}>
         <div ref={mainTitleBannerRef} title="mainTitleBanner" onClick={(e) => handleElementClick(e, 'mainTitleBanner')} className={selectedElementKeys.includes('mainTitleBanner') ? styles.selectedElementOutline : ''} style={{...getStyle('mainTitleBanner') as any, position:'absolute' }}></div>
      </Draggable>
      <Draggable nodeRef={mainLicenseTitleTextRef} position={getStyle('mainLicenseTitleText')} onStart={() => onElementDragStart('mainLicenseTitleText')} onStop={(e, data) => onElementDragStop('mainLicenseTitleText', data)}>
        <h2 ref={mainLicenseTitleTextRef} title="mainLicenseTitleText" onClick={(e) => handleElementClick(e, 'mainLicenseTitleText')} onBlur={(e) => handleStaticTextBlur(e, 'mainLicenseTitleText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('mainLicenseTitleText') ? styles.selectedElementOutline : ''} style={{...getStyle('mainLicenseTitleText') as any, position:'absolute'}}>CAPITAL MARKET LICENSE</h2>
      </Draggable>
      <Draggable nodeRef={grantedToLabelTextRef} position={getStyle('grantedToLabelText')} onStart={() => onElementDragStart('grantedToLabelText')} onStop={(e, data) => onElementDragStop('grantedToLabelText', data)}>
        <p ref={grantedToLabelTextRef} title="grantedToLabelText" onClick={(e) => handleElementClick(e, 'grantedToLabelText')} onBlur={(e) => handleStaticTextBlur(e, 'grantedToLabelText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('grantedToLabelText') ? styles.selectedElementOutline : ''} style={{...getStyle('grantedToLabelText') as any, position:'absolute'}}>Granted to</p>
      </Draggable>
      <Draggable nodeRef={granteeNameTextRef} position={getStyle('granteeNameText')} onStart={() => onElementDragStart('granteeNameText')} onStop={(e, data) => onElementDragStop('granteeNameText', data)}>
        <h1
          ref={granteeNameTextRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFormDataTextBlur(e, 'licenseeName')}
          className={`${styles.draggableElement} ${selectedElementKeys.includes('granteeNameText') ? styles.selected : ''} ${getStyle('granteeNameText').fontFamily ? styles[getStyle('granteeNameText').fontFamily as keyof typeof styles] : ''}`}
          style={combineStyles('granteeNameText', { textAlign: 'center' })}
          onClick={(e) => handleElementClick(e, 'granteeNameText')}
          onContextMenu={(e) => handleElementContextMenu(e, 'granteeNameText')}
        >
          {formData.licenseeName}
        </h1>
      </Draggable>
      <Draggable
        nodeRef={subtitleTextRef}
        position={{ x: getStyle('subtitleText').x, y: getStyle('subtitleText').y }}
        onStart={() => onElementDragStart('subtitleText')}
        onStop={(_, data) => onElementDragStop('subtitleText', data)}
      >
        <h2
          ref={subtitleTextRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFormDataTextBlur(e, 'subtitle' as keyof FormData) }
          className={`${styles.draggableElement} ${selectedElementKeys.includes('subtitleText') ? styles.selected : ''} ${getStyle('subtitleText').fontFamily ? styles[getStyle('subtitleText').fontFamily as keyof typeof styles] : ''}`}
          style={combineStyles('subtitleText')}
          onClick={(e) => handleElementClick(e, 'subtitleText')}
          onContextMenu={(e) => handleElementContextMenu(e, 'subtitleText')}
        >
          {formData.subtitle}
        </h2>
      </Draggable>
      <Draggable
        nodeRef={subtitleText2Ref}
        position={{ x: getStyle('subtitleText2').x, y: getStyle('subtitleText2').y }}
        onStart={() => onElementDragStart('subtitleText2')}
        onStop={(_, data) => onElementDragStop('subtitleText2', data)}
      >
        <h2
          ref={subtitleText2Ref}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFormDataTextBlur(e, 'subtitle2' as keyof FormData) }
          className={`${styles.draggableElement} ${selectedElementKeys.includes('subtitleText2') ? styles.selected : ''} ${getStyle('subtitleText2').fontFamily ? styles[getStyle('subtitleText2').fontFamily as keyof typeof styles] : ''}`}
          style={combineStyles('subtitleText2')}
          onClick={(e) => handleElementClick(e, 'subtitleText2')}
          onContextMenu={(e) => handleElementContextMenu(e, 'subtitleText2')}
        >
          {formData.subtitle2}
        </h2>
      </Draggable>
      <Draggable
        nodeRef={subtitleText3Ref}
        position={{ x: getStyle('subtitleText3').x, y: getStyle('subtitleText3').y }}
        onStart={() => onElementDragStart('subtitleText3')}
        onStop={(_, data) => onElementDragStop('subtitleText3', data)}
      >
        <h2
          ref={subtitleText3Ref}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleFormDataTextBlur(e, 'subtitle3' as keyof FormData) }
          className={`${styles.draggableElement} ${selectedElementKeys.includes('subtitleText3') ? styles.selected : ''} ${getStyle('subtitleText3').fontFamily ? styles[getStyle('subtitleText3').fontFamily as keyof typeof styles] : ''}`}
          style={combineStyles('subtitleText3')}
          onClick={(e) => handleElementClick(e, 'subtitleText3')}
          onContextMenu={(e) => handleElementContextMenu(e, 'subtitleText3')}
        >
          {formData.subtitle3}
        </h2>
      </Draggable>
      <Draggable nodeRef={regulatedActivityMainTextRef} position={getStyle('regulatedActivityMainText')} onStart={() => onElementDragStart('regulatedActivityMainText')} onStop={(e, data) => onElementDragStop('regulatedActivityMainText', data)}>
        <p 
          ref={regulatedActivityMainTextRef} 
          title="regulatedActivityMainText" 
          onClick={(e) => handleElementClick(e, 'regulatedActivityMainText')} 
          onBlur={(e) => handleFormDataTextBlur(e, 'rightSideActivityDisplay' as keyof FormData)}
          contentEditable 
          suppressContentEditableWarning 
          className={selectedElementKeys.includes('regulatedActivityMainText') ? styles.selectedElementOutline : ''} 
          style={{...getStyle('regulatedActivityMainText') as any, position:'absolute', textAlign: 'center'}}
        >
          {formData.rightSideActivityDisplay}
        </p>
      </Draggable>
      <Draggable nodeRef={legalReferenceMainTextRef} position={getStyle('legalReferenceMainText')} onStart={() => onElementDragStart('legalReferenceMainText')} onStop={(e, data) => onElementDragStop('legalReferenceMainText', data)}>
        <p ref={legalReferenceMainTextRef} title="legalReferenceMainText" onClick={(e) => handleElementClick(e, 'legalReferenceMainText')} onBlur={(e) => handleFormDataTextBlur(e, 'legalReference')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('legalReferenceMainText') ? styles.selectedElementOutline : ''} style={{...getStyle('legalReferenceMainText') as any, position:'absolute', textAlign: 'center'}}>{formData.legalReference}</p>
      </Draggable>
      <Draggable nodeRef={signatureNameTextRef} position={getStyle('signatureNameText')} onStart={() => onElementDragStart('signatureNameText')} onStop={(e, data) => onElementDragStop('signatureNameText', data)}>
        <p ref={signatureNameTextRef} title="signatureNameText" onClick={(e) => handleElementClick(e, 'signatureNameText')} onBlur={(e) => handleFormDataTextBlur(e, 'signatoryName')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('signatureNameText') ? styles.selectedElementOutline : ''} style={{...getStyle('signatureNameText') as any, position:'absolute'}}>{formData.signatoryName}</p>
      </Draggable>
      <Draggable nodeRef={signatureTitleTextRef} position={getStyle('signatureTitleText')} onStart={() => onElementDragStart('signatureTitleText')} onStop={(e, data) => onElementDragStop('signatureTitleText', data)}>
        <p ref={signatureTitleTextRef} title="signatureTitleText" onClick={(e) => handleElementClick(e, 'signatureTitleText')} onBlur={(e) => handleFormDataTextBlur(e, 'signatoryTitle')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('signatureTitleText') ? styles.selectedElementOutline : ''} style={{...getStyle('signatureTitleText') as any, position:'absolute'}}>{formData.signatoryTitle}</p>
      </Draggable>

      {/* Footer Elements */}
      <Draggable nodeRef={footerLogoRef} position={getStyle('footerLogo')} onStart={() => onElementDragStart('footerLogo')} onStop={(e, data) => onElementDragStop('footerLogo', data)}>
        <img ref={footerLogoRef} src="/images/SCPNG Original Logo.png" alt="SCPNG Footer Logo" title="footerLogo" onClick={(e) => handleElementClick(e, 'footerLogo')} className={selectedElementKeys.includes('footerLogo') ? styles.selectedElementOutline : ''} style={{...getStyle('footerLogo') as any, position:'absolute' }}/>
      </Draggable>
      <Draggable nodeRef={footerBannerRef} position={getStyle('footerBanner')} onStart={() => onElementDragStart('footerBanner')} onStop={(e, data) => onElementDragStop('footerBanner', data)}>
        <div ref={footerBannerRef} title="footerBanner" onClick={(e) => handleElementClick(e, 'footerBanner')} className={selectedElementKeys.includes('footerBanner') ? styles.selectedElementOutline : ''} style={{...getStyle('footerBanner') as any, position:'absolute' }}></div>
      </Draggable>
      <Draggable nodeRef={footerLicenseNoLabelTextRef} position={getStyle('footerLicenseNoLabelText')} onStart={() => onElementDragStart('footerLicenseNoLabelText')} onStop={(e, data) => onElementDragStop('footerLicenseNoLabelText', data)}>
        <span ref={footerLicenseNoLabelTextRef} title="footerLicenseNoLabelText" onClick={(e) => handleElementClick(e, 'footerLicenseNoLabelText')} onBlur={(e) => handleStaticTextBlur(e, 'footerLicenseNoLabelText')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('footerLicenseNoLabelText') ? styles.selectedElementOutline : ''} style={{...getStyle('footerLicenseNoLabelText') as any, position:'absolute'}}>CAPITAL MARKET LICENSE NO. </span>
      </Draggable>
      <Draggable nodeRef={footerLicenseNoValueTextRef} position={getStyle('footerLicenseNoValueText')} onStart={() => onElementDragStart('footerLicenseNoValueText')} onStop={(e, data) => onElementDragStop('footerLicenseNoValueText', data)}>
        <span ref={footerLicenseNoValueTextRef} title="footerLicenseNoValueText" onClick={(e) => handleElementClick(e, 'footerLicenseNoValueText')} onBlur={(e) => handleFormDataTextBlur(e, 'licenseNumber')} contentEditable suppressContentEditableWarning className={selectedElementKeys.includes('footerLicenseNoValueText') ? styles.selectedElementOutline : ''} style={{...getStyle('footerLicenseNoValueText') as any, position:'absolute'}}>{formData.licenseNumber}</span>
      </Draggable>

      {contextMenuVisible && (
        <div 
          style={{
            position: 'fixed', // Use fixed to position relative to viewport
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '5px',
            zIndex: 2000, // Ensure it's above other elements
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent click inside from closing it immediately
        >
          <button onClick={handleDuplicateClick} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', border: 'none', background: 'none', cursor: 'pointer' }}>
            Duplicate
          </button>
          <button onClick={handleDeleteClick} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}>
            Delete
          </button>
        </div>
      )}

    </div>
  );
});

export default HtmlLicensePreview;