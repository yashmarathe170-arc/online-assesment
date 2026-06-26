import PDFDocument from 'pdfkit';

/**
 * Generates an A4 landscape certificate of completion as a PDF Buffer
 * @param {string} studentName Name of the student
 * @param {string} courseTitle Title of the completed course
 * @param {string} certNumber Unique certificate ID number
 * @param {string} issueDate Formatted date string
 * @returns {Promise<Buffer>}
 */
export const generateCertificatePDF = (studentName, courseTitle, certNumber, issueDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Background decorative frames
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(6)
        .stroke('#4f46e5'); // EduVerse Indigo theme color

      doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
        .lineWidth(1.5)
        .stroke('#a5b4fc'); // Light purple border

      // Header Text
      doc.moveDown(3);
      doc.font('Helvetica-Bold')
        .fontSize(36)
        .fillColor('#1e1b4b')
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });

      doc.moveDown(1);
      doc.font('Helvetica')
        .fontSize(16)
        .fillColor('#4b5563')
        .text('This is proudly presented to', { align: 'center' });

      // Student name (large and prominent)
      doc.moveDown(1.5);
      doc.font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#4f46e5')
        .text(studentName.toUpperCase(), { align: 'center' });

      doc.moveDown(1);
      doc.font('Helvetica')
        .fontSize(15)
        .fillColor('#4b5563')
        .text('for successfully completing all curriculum requirements of the course', { align: 'center' });

      // Course Name
      doc.moveDown(1);
      doc.font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#111827')
        .text(`"${courseTitle}"`, { align: 'center' });

      doc.moveDown(2);

      // Date of issue & verification credentials
      const bottomY = doc.y;

      doc.font('Helvetica')
        .fontSize(12)
        .fillColor('#4b5563')
        .text(`Date of Issue: ${issueDate}`, 80, bottomY);

      doc.text(`Certificate No: ${certNumber}`, 80, bottomY + 20);

      // Signature line on right side
      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#111827')
        .text('EduVerse LMS Academy', doc.page.width - 280, bottomY, { align: 'right' });

      doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#6b7280')
        .text('Authorized Instructor & Admin', doc.page.width - 280, bottomY + 20, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
export default generateCertificatePDF;
