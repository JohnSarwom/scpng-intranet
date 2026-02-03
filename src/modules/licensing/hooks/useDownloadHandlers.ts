import { RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AllElementStyles, ElementStyleProperties } from '../types';

const styleOverrides: { [key: string]: Partial<ElementStyleProperties> } = {
  licenseNumberHeaderText: { y: 40 },
  licenseNumberDottedLine: { y: 33 },
  licenseNumberDottedLine2: { y: 38 },
  subtitleText2: { y: 28 },
  subtitleText3: { y: 33 },
  // qrCode: { y: 359 }, // Commented out as per user request to use original values
  verticalGoldLine: { y: 163 },
  mainTitleBanner: { x: 349, y: 163 },
  footerBanner: { x: -1 },
  footerLicenseNoLabelText: { y: 531 },
  footerLicenseNoValueText: { y: 531 },
};

const captureLicensePreview = async (licensePreviewRef: RefObject<HTMLDivElement>): Promise<HTMLCanvasElement | null> => {
  if (!licensePreviewRef.current) {
    console.error("License preview element not found.");
    alert("Could not find license preview element.");
    return null;
  }
  const currentPreview = licensePreviewRef.current;
  try {
    const canvas = await html2canvas(currentPreview, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: currentPreview.offsetWidth,
      height: currentPreview.offsetHeight,
    });
    return canvas;
  } catch (error) {
    console.error("Error capturing license preview:", error);
    alert("Error capturing license preview. See console.");
    return null;
  }
};

export const useDownloadHandlers = (
  licensePreviewRef: RefObject<HTMLDivElement>,
  elementStyles: AllElementStyles,
  setElementStyles: (styles: AllElementStyles | ((prevStyles: AllElementStyles) => AllElementStyles)) => void,
  handleBulkStyleChange: (updates: { [key: string]: Partial<ElementStyleProperties> }) => void
) => {
  const applyOverrides = () => {
    const originalStyles: { [key: string]: Partial<ElementStyleProperties> } = {};
    // Capture original styles for all keys that will be overridden
    Object.keys(styleOverrides).forEach(key => {
      if (elementStyles[key]) {
        originalStyles[key] = { x: elementStyles[key].x, y: elementStyles[key].y };
      }
    });

    handleBulkStyleChange(styleOverrides); // Apply the static overrides directly
    return originalStyles;
  };

  const revertOverrides = (originalStylesToRevert: { [key: string]: Partial<ElementStyleProperties> }) => {
    handleBulkStyleChange(originalStylesToRevert);
  };

  const handleDownloadPdf = async () => {
    let originalStyles = {};
    try {
      originalStyles = applyOverrides();
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await captureLicensePreview(licensePreviewRef);
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(imgData, 'PNG', x, y, width, height);
      pdf.save('capital_market_license.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. See console.");
    } finally {
      revertOverrides(originalStyles);
    }
  };

  const handleDownloadJpeg = async () => {
    let originalStyles = {};
    try {
      originalStyles = applyOverrides();
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await captureLicensePreview(licensePreviewRef);
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'capital_market_license.jpeg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating JPEG:", error);
      alert("Error generating JPEG. See console.");
    } finally {
      revertOverrides(originalStyles);
    }
  };

  const handlePrint = async () => {
    let originalStyles = {};
    try {
      originalStyles = applyOverrides();
      await new Promise(resolve => setTimeout(resolve, 500));
      window.print();
    } catch (error) {
      console.error("Error printing:", error);
      alert("Error printing. See console.");
    } finally {
      setTimeout(() => revertOverrides(originalStyles), 1000);
    }
  };

  return {
    handleDownloadPdf,
    handleDownloadJpeg,
    handlePrint,
    applyOverrides,
    revertOverrides,
  };
}; 