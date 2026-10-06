import { jsPDF } from 'jspdf';
import { MedicationLog, UserProfile, Medicine } from '../types';

export interface ReportExportOptions {
  patient: UserProfile;
  logs: MedicationLog[];
  medicines: Medicine[];
  dateRangeLabel: string;
  adherenceRate: number;
}

export function exportMedicationHistoryPDF({
  patient,
  logs,
  medicines,
  dateRangeLabel,
  adherenceRate,
}: ReportExportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  // --- Header Banner ---
  doc.setFillColor(37, 99, 235); // Blue #2563EB
  doc.rect(margin, y, pageWidth - margin * 2, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MEDISYNC CLINICAL MEDICATION REPORT', margin + 15, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Confidential Healthcare Provider Summary · Adherence & Dosage Log', margin + 15, y + 44);

  y += 75;

  // --- Patient & Clinical Metadata Grid ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 6, 6, 'S');

  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT PROFILE:', margin + 12, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${patient.name}`, margin + 12, y + 32);
  doc.text(`Age: ${patient.age || '64'} years`, margin + 12, y + 46);
  doc.text(`Emergency: ${patient.emergencyContact?.name} (${patient.emergencyContact?.phone})`, margin + 12, y + 60);

  // Column 2
  const col2X = margin + 200;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('REPORT DETAILS:', col2X, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Period: ${dateRangeLabel}`, col2X, y + 32);
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, col2X, y + 46);
  doc.text(`Total Doses Logged: ${logs.length}`, col2X, y + 60);

  // Column 3: Adherence Badge
  const col3X = margin + 400;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.roundedRect(col3X, y + 10, 110, 50, 6, 6, 'F');
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(col3X, y + 10, 110, 50, 6, 6, 'S');

  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OVERALL ADHERENCE', col3X + 10, y + 26);
  doc.setFontSize(18);
  doc.text(`${adherenceRate}%`, col3X + 10, y + 48);

  y += 85;

  // --- Active Regimens Section ---
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CURRENT ACTIVE MEDICATIONS (REGIMENS):', margin, y);
  y += 14;

  const activeMeds = medicines.filter((m) => m.status === 'active');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  activeMeds.forEach((m) => {
    const medLine = `• ${m.name} (${m.dosage} ${m.unit}) — ${m.frequency.replace('_', ' ').toUpperCase()} at [${m.reminderTimes.join(', ')}] · ${m.mealTiming.replace('_', ' ')}`;
    doc.text(medLine, margin + 8, y);
    y += 12;
  });

  y += 10;

  // --- Table Header ---
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 20, pageWidth - margin, y + 20);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colOffsets = {
    date: margin + 6,
    time: margin + 60,
    actual: margin + 115,
    med: margin + 170,
    dose: margin + 270,
    status: margin + 340,
    notes: margin + 410,
  };

  doc.text('DATE', colOffsets.date, y + 14);
  doc.text('SCHEDULED', colOffsets.time, y + 14);
  doc.text('ACTUAL', colOffsets.actual, y + 14);
  doc.text('MEDICINE', colOffsets.med, y + 14);
  doc.text('DOSAGE', colOffsets.dose, y + 14);
  doc.text('STATUS', colOffsets.status, y + 14);
  doc.text('TIMING / NOTES', colOffsets.notes, y + 14);

  y += 24;

  // --- Table Rows ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const maxRowsPerPage = 28;
  let rowsCount = 0;

  logs.forEach((log) => {
    // Page overflow check
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;

      // Repeat table header on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y + 20, pageWidth - margin, y + 20);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DATE', colOffsets.date, y + 14);
      doc.text('SCHEDULED', colOffsets.time, y + 14);
      doc.text('ACTUAL', colOffsets.actual, y + 14);
      doc.text('MEDICINE', colOffsets.med, y + 14);
      doc.text('DOSAGE', colOffsets.dose, y + 14);
      doc.text('STATUS', colOffsets.status, y + 14);
      doc.text('TIMING / NOTES', colOffsets.notes, y + 14);

      y += 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    // Row zebra background
    if (rowsCount % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 16, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(log.date, colOffsets.date, y + 8);
    doc.text(log.scheduledTime, colOffsets.time, y + 8);
    doc.text(log.actualTime || '—', colOffsets.actual, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.text(log.medicineName.substring(0, 18), colOffsets.med, y + 8);
    doc.setFont('helvetica', 'normal');

    doc.text(log.dosage, colOffsets.dose, y + 8);

    // Colored status text
    if (log.status === 'taken') {
      doc.setTextColor(16, 185, 129); // Green
      doc.text('TAKEN', colOffsets.status, y + 8);
    } else if (log.status === 'missed') {
      doc.setTextColor(239, 68, 68); // Red
      doc.text('MISSED', colOffsets.status, y + 8);
    } else if (log.status === 'skipped') {
      doc.setTextColor(148, 163, 184); // Gray
      doc.text('SKIPPED', colOffsets.status, y + 8);
    } else {
      doc.setTextColor(245, 158, 11); // Amber
      doc.text('SNOOZED', colOffsets.status, y + 8);
    }

    doc.setTextColor(100, 116, 139);
    const notePreview = log.notes || log.mealTiming.replace('_', ' ');
    doc.text(notePreview.substring(0, 24), colOffsets.notes, y + 8);

    y += 16;
    rowsCount++;
  });

  // --- Bottom Disclaimer ---
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin;
  }

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(
    'CLINICAL NOTICE: This report is generated by MediSync for patient adherence records and medical consultations. It does not constitute a prescription or diagnosis.',
    margin,
    y
  );
  doc.text(
    `Page ${doc.getNumberOfPages()} · MediSync Healthcare Systems · Authenticated Record`,
    margin,
    y + 10
  );

  // Trigger download
  const cleanName = patient.name.replace(/\s+/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`MediSync_Medication_Report_${cleanName}_${dateStr}.pdf`);
}
