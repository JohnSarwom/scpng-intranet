import React from 'react';
import Draggable from 'react-draggable';
import { AllElementStyles, ElementStyleProperties, FormData } from '../types';
import { PREVIEW_SIZES, availableFontFamilies } from '../constants/index';

interface ConfigurationPanelProps {
  isOpen: boolean;
  panelPosition: { x: number; y: number };
  setPanelPosition: (pos: { x: number; y: number }) => void;
  formData: FormData;
  elementStyles: AllElementStyles;
  previewSizePreset: string;
  previewWidth: number;
  previewHeight: number;
  selectedElementKeysForPanel: string[];
  configCardRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  onElementStyleChange: (key: string, styles: Partial<ElementStyleProperties>) => void;
  onPreviewSizeChange: (preset: string, width?: number, height?: number) => void;
  onAlignment: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribution: (direction: 'horizontal' | 'vertical') => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  isOpen,
  panelPosition,
  setPanelPosition,
  formData, // For Copy All Settings
  elementStyles,
  previewSizePreset,
  previewWidth,
  previewHeight,
  selectedElementKeysForPanel,
  configCardRefs,
  onElementStyleChange,
  onPreviewSizeChange,
  onAlignment,
  onDistribution,
}) => {
  if (!isOpen) return null;

  const handleCopySettings = async () => {
    try {
      const settingsToCopy = {
        formData: formData,
        elementStyles: elementStyles,
      };
      const jsonSettings = JSON.stringify(settingsToCopy, null, 2);
      await navigator.clipboard.writeText(jsonSettings);
      alert('Settings copied to clipboard as JSON!');
    } catch (err) {
      console.error('Failed to copy settings: ', err);
      alert('Failed to copy settings. See console for details.');
    }
  };

  return (
    <Draggable
      handle=".config-panel-drag-handle"
      position={panelPosition}
      onStop={(e, data) => setPanelPosition({ x: data.x, y: data.y })}
    >
      <div
        style={{
          position: 'fixed',
          top: `${panelPosition.y}px`,
          left: `${panelPosition.x}px`,
          width: '380px',
          zIndex: 1000,
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto'
        }}
        className="bg-gray-50 shadow-2xl rounded-lg no-print border border-gray-300 flex flex-col"
      >
        <div className="config-panel-drag-handle cursor-move p-3 bg-gray-200 border-b border-gray-300 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-700">Configuration Panel</h2>
        </div>
        <div className="p-4 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Panel Position Inputs */}
          <div className="mb-4 p-3 border rounded-md bg-white">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Panel Position</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600">X Pos (px):</label>
                <input
                  type="number"
                  value={panelPosition.x}
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsedX = parseInt(value);
                    setPanelPosition({ ...panelPosition, x: isNaN(parsedX) ? 0 : parsedX });
                  }}
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Y Pos (px):</label>
                <input
                  type="number"
                  value={panelPosition.y}
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsedY = parseInt(value);
                    setPanelPosition({ ...panelPosition, y: isNaN(parsedY) ? 0 : parsedY });
                  }}
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          {/* Copy Settings Button */}
          <div className="mb-4">
            <button
              onClick={handleCopySettings}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
            >
              Copy All Settings to JSON
            </button>
          </div>

          {/* Backdrop Size Controls */}
          <div className="mb-4 p-3 border rounded-md bg-white">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Backdrop Size</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="previewSizePreset" className="block text-xs font-medium text-gray-600">Preset:</label>
                <select
                  id="previewSizePreset"
                  value={previewSizePreset}
                  onChange={(e) => onPreviewSizeChange(e.target.value)}
                  className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                >
                  {Object.entries(PREVIEW_SIZES).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                  ))}
                </select>
              </div>
              {previewSizePreset === 'CUSTOM' && (
                <>
                  <div>
                    <label htmlFor="customPreviewWidth" className="block text-xs font-medium text-gray-600">Width (px):</label>
                    <input
                      type="number"
                      id="customPreviewWidth"
                      value={previewWidth}
                      onChange={(e) => onPreviewSizeChange('CUSTOM', parseInt(e.target.value) || PREVIEW_SIZES.ORIGINAL_DESIGN.width, undefined)}
                      className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="customPreviewHeight" className="block text-xs font-medium text-gray-600">Height (px):</label>
                    <input
                      type="number"
                      id="customPreviewHeight"
                      value={previewHeight}
                      onChange={(e) => onPreviewSizeChange('CUSTOM', undefined, parseInt(e.target.value) || PREVIEW_SIZES.ORIGINAL_DESIGN.height)}
                      className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Alignment and Distribution Controls */}
          {selectedElementKeysForPanel.length > 1 && (
            <div className="mb-4 p-3 border rounded-md bg-white">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Align Selected ({selectedElementKeysForPanel.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => onAlignment('left')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Align Left</button>
                <button onClick={() => onAlignment('center')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Center H</button>
                <button onClick={() => onAlignment('right')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Align Right</button>
                <button onClick={() => onAlignment('top')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Align Top</button>
                <button onClick={() => onAlignment('middle')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Middle V</button>
                <button onClick={() => onAlignment('bottom')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Align Bottom</button>
              </div>
              {selectedElementKeysForPanel.length > 2 && (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button onClick={() => onDistribution('horizontal')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Distribute H</button>
                  <button onClick={() => onDistribution('vertical')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded">Distribute V</button>
                </div>
              )}
            </div>
          )}

          {/* Element Styles */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-2">Element Styles</h3>
            {Object.entries(elementStyles).map(([key, styles]) => (
              <div
                key={key}
                ref={el => configCardRefs.current[key] = el}
                className={`mb-3 p-3 border rounded-md bg-white space-y-2 ${selectedElementKeysForPanel.includes(key) ? 'config-card-highlight' : 'border-gray-300'}`}
              >
                <p className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z](?=[a-z]))|([A-Z]+(?![a-z]))/g, ' $1$2').trim()}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">X Pos:</label>
                    <input type="number" value={styles.x} onChange={(e) => onElementStyleChange(key, { x: parseInt(e.target.value) || 0 })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Y Pos:</label>
                    <input type="number" value={styles.y} onChange={(e) => onElementStyleChange(key, { y: parseInt(e.target.value) || 0 })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                  </div>

                  {styles.hasOwnProperty('width') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Width (px):</label>
                      <input type="number" value={styles.width ?? ''} onChange={(e) => onElementStyleChange(key, { width: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                    </div>
                  )}
                  {styles.hasOwnProperty('height') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Height (px):</label>
                      <input type="number" value={styles.height ?? ''} onChange={(e) => onElementStyleChange(key, { height: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                    </div>
                  )}
                  {styles.hasOwnProperty('fontSize') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Font Size (px):</label>
                        <input type="number" value={styles.fontSize ?? ''} onChange={(e) => onElementStyleChange(key, { fontSize: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('fontWeight') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Font Weight:</label>
                        <select value={styles.fontWeight ?? ''} onChange={(e) => onElementStyleChange(key, { fontWeight: e.target.value })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs">
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                           {typeof styles.fontWeight === 'string' && !['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(styles.fontWeight) && (
                              <option value={styles.fontWeight}>{styles.fontWeight.charAt(0).toUpperCase() + styles.fontWeight.slice(1)}</option>
                           )}
                        </select>
                      </div>
                   )}
                   {styles.hasOwnProperty('fontStyle') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Font Style:</label>
                        <select value={styles.fontStyle ?? 'normal'} onChange={(e) => onElementStyleChange(key, { fontStyle: e.target.value as 'normal' | 'italic' })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs">
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </div>
                   )}
                   {styles.hasOwnProperty('letterSpacing') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Letter Spacing (px):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={styles.letterSpacing ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue = value === '' ? undefined : parseFloat(value);
                            onElementStyleChange(key, { letterSpacing: parsedValue });
                          }}
                          className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                        />
                      </div>
                    )}
                     {styles.hasOwnProperty('opacity') && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600">Opacity (0-1):</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={styles.opacity ?? ''}
                               onChange={(e) => {
                                const value = e.target.value;
                                const parsedValue = value === '' ? undefined : parseFloat(value);
                                const clampedValue = (parsedValue !== undefined && !isNaN(parsedValue))
                                                     ? Math.max(0, Math.min(1, parsedValue))
                                                     : parsedValue;
                                onElementStyleChange(key, { opacity: clampedValue });
                              }}
                              className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs"
                            />
                        </div>
                     )}
                   {styles.hasOwnProperty('color') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Color:</label>
                        <input type="color" value={styles.color ?? '#000000'} onChange={(e) => onElementStyleChange(key, { color: e.target.value })} className="mt-1 w-full h-6 p-0.5 border border-gray-300 rounded-md text-xs" />
                     </div>
                   )}
                    {styles.hasOwnProperty('fontFamily') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Font Family:</label>
                        <select value={styles.fontFamily ?? ''} onChange={(e) => onElementStyleChange(key, { fontFamily: e.target.value })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs">
                          {availableFontFamilies.map(font => (
                            <option key={font.id} value={font.id}>{font.name}</option>
                          ))}
                        </select>
                     </div>
                   )}
                    {styles.hasOwnProperty('backgroundColor') && (
                     <div>
                        <label className="block text-xs font-medium text-gray-600">Background:</label>
                        <input type="color" value={styles.backgroundColor ?? '#ffffff'} onChange={(e) => onElementStyleChange(key, { backgroundColor: e.target.value })} className="mt-1 w-full h-6 p-0.5 border border-gray-300 rounded-md text-xs" />
                     </div>
                   )}
                    {styles.hasOwnProperty('borderRadius') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Border Radius:</label>
                        <input type="number" value={styles.borderRadius ?? ''} onChange={(e) => onElementStyleChange(key, { borderRadius: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('borderTopLeftRadius') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">TL Radius:</label>
                        <input type="number" value={styles.borderTopLeftRadius ?? ''} onChange={(e) => onElementStyleChange(key, { borderTopLeftRadius: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('borderTopRightRadius') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">TR Radius:</label>
                        <input type="number" value={styles.borderTopRightRadius ?? ''} onChange={(e) => onElementStyleChange(key, { borderTopRightRadius: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('borderBottomLeftRadius') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">BL Radius:</label>
                        <input type="number" value={styles.borderBottomLeftRadius ?? ''} onChange={(e) => onElementStyleChange(key, { borderBottomLeftRadius: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('borderBottomRightRadius') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">BR Radius:</label>
                        <input type="number" value={styles.borderBottomRightRadius ?? ''} onChange={(e) => onElementStyleChange(key, { borderBottomRightRadius: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                    {styles.hasOwnProperty('zIndex') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Z-Index:</label>
                        <input type="number" value={styles.zIndex ?? ''} onChange={(e) => onElementStyleChange(key, { zIndex: parseInt(e.target.value) || undefined })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                      </div>
                   )}
                   {styles.hasOwnProperty('textShadow') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Text Shadow:</label>
                      <input type="text" value={styles.textShadow ?? ''} onChange={(e) => onElementStyleChange(key, { textShadow: e.target.value })} className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs" />
                    </div>
                  )}
                   {styles.hasOwnProperty('content') && (
                       <div className="col-span-2">
                           <label className="block text-xs font-medium text-gray-600">Content:</label>
                           <textarea
                               value={styles.content ?? ''}
                               onChange={(e) => onElementStyleChange(key, { content: e.target.value })}
                               className="mt-1 w-full p-1 border border-gray-300 rounded-md text-xs h-16 resize-y"
                           ></textarea>
                       </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default ConfigurationPanel; 