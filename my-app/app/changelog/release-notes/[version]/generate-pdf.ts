export async function generatePDF(version: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Heading
  doc.setFontSize(24);
  doc.text(`Release Notes - Version ${version}`, 20, 20);

  // Overview
  doc.setFontSize(12);
  let yPosition = 40;
  const overview =
    "This release includes numerous improvements, new features, and fixes. Below are the technical details behind each change:";
  const overviewLines = doc.splitTextToSize(overview, 170);
  doc.text(overviewLines, 20, yPosition);
  yPosition += overviewLines.length * 7 + 10;

  // Technical details list
  const technicalDetails = [
    "Updated dependencies and refactored hooks for improved notification handling.",
    "Implemented logic to fetch app services by organization using new API endpoints.",
    "Integrated live chat feature for website widgets with real-time engagement.",
    "Added a demo video component with enhanced user interface and experience.",
    "Optimized statistics view on conversations page and refined data fetching logic.",
    "Resolved build issues by addressing dependency conflicts and code inconsistencies.",
    "Updated documentation to include OG image support and widget conversation endpoints.",
    "Improved widget display with adjustments in layout and responsive design.",
    "Fixed build configuration errors affecting production deployment.",
    "Enhanced notifications by integrating a new phone number form for user alerts.",
    "Refactored the widgets page and components to boost performance and usability.",
    "Introduced escalation events and updated pricing page with interactive elements.",
    "Enhanced organization management via improved invite member functionality.",
    "Implemented delete functionality for assistants to streamline management.",
    "Refined the pricing page with improved layouts and performance optimizations.",
    "Upgraded the command center UI/UX for a more intuitive interface.",
    "Streamlined product tour copy for better clarity and engagement.",
    "Resolved socket API build errors through backend communication refactoring.",
    "Enhanced WhatsApp Conversations page with export options and WebRTC integration.",
    "Improved security and accessibility with comprehensive component refactoring.",
    "Optimized create organization popups to support multiple instances.",
    "Integrated new office addresses feature to enhance website contact information.",
    "Added support for additional analytics providers by integrating more data sources.",
    "Refined WhatsApp onboarding process for a smoother user experience."
  ];

  // Technical Details Section
  doc.setFontSize(14);
  doc.text("Technical Details:", 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);
  for (const detail of technicalDetails) {
    const detailLines = doc.splitTextToSize(detail, 170);
    if (yPosition + detailLines.length * 7 > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(detailLines, 20, yPosition);
    yPosition += detailLines.length * 7 + 5;
  }

  // Footer
  if (yPosition > doc.internal.pageSize.height - 20) {
    doc.addPage();
    yPosition = 20;
  }
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 20);

  // Save the PDF
  doc.save(`intelli-release-notes-${version}.pdf`);
}

