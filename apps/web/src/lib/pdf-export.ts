import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPDFOptions {
  elementId: string;
  reportTitle: string;
  query: string;
  confidence?: number;
}

export const exportReportToPDF = async ({
  elementId,
  reportTitle,
  query,
  confidence = 95,
}: ExportPDFOptions): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Create temporary container cloned with high-contrast light/dark clean print styling
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#0a0d14',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let heightLeft = calculatedHeight;
  let position = 0;

  // Header branding banner
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight);
  heightLeft -= pdfHeight;

  while (heightLeft >= 0) {
    position = heightLeft - calculatedHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeight);
    heightLeft -= pdfHeight;
  }

  const cleanFilename = (reportTitle || 'market_intelligence_report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 40);

  pdf.save(`${cleanFilename}_report.pdf`);
};
