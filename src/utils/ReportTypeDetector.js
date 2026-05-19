export const detectReportType = (file) => {
  if (!file) return 'unknown';
  
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  
  const ecgKeywords = ['ecg', 'ekg', 'electrocardiogram', 'heart', 'rhythm', 'cardio'];
  
  const isEcgByKeyword = ecgKeywords.some(keyword => name.includes(keyword));
  const isCsv = name.endsWith('.csv') || type.includes('csv');
  
  if (isEcgByKeyword || isCsv) {
    if (isCsv) return 'ECG_WAVEFORM_DATA';
    if (name.endsWith('.pdf')) return 'ECG_PDF_REPORT';
    return 'ECG_IMAGE';
  }
  
  return 'GENERAL_MEDICAL_REPORT';
};
