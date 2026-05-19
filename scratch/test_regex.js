const fullText = `3x4 Simultaneous ECG Report
Patient Details
Name:ID:Gender:Date of Birth:Height:Weight:Willy McKee
123123Male1/25/1950   (61 years)6 ft 3 in223 lbsRecording DetailsRecorded:Device:Location:2/17/2011 2:21:27 PMCL   131568MeasurementsHeart Rate:P Duration:PR Interval:QRS Duration:QT Interval:QTc Interval:P,QRS,T A xis:80 bpm102 ms186 ms100 ms360 ms416 ms49, 50, 49Interpretation (Unconfirmed)
004 Normal sinus rhythm
193 Anteroseptal infarction, probably old239 Ischemic ST-T changes in posterior  
leadsComments:
Scale: 25.0 mm/s 10.0 mm/mV 5mm/sqr. Filters: 0.05 - 150 HzI
II
IIIaVR
aVL
aVFV1
V2
V3V4
V5
V6
II
Page 1 of 9    Printed: W ednesday, March 02, 2011Data must be reviewed by a qualified physician.
Copyright QRS DiagnosticML122 Rev.6/11`;

let name = "";
let sex = "";
let dob = "";
let age = "";
let height = "";
let weight = "";
let trestbps = "";

// ─── QRS Diagnostic Specific Parser ───
const isQrsDiagnostic = fullText.includes("Name:ID:Gender:Date of Birth:Height:Weight:");
if (isQrsDiagnostic) {
  console.log("Found QRS Diagnostic layout!");
  
  const nameMatch = fullText.match(/Height:Weight:\s*([^\r\n]+)/i);
  if (nameMatch) name = nameMatch[1].trim();

  const lines = fullText.split('\n');
  const index = lines.findIndex(l => l.includes("Name:ID:Gender:Date of Birth:Height:Weight:"));
  if (index !== -1 && index + 1 < lines.length) {
    const valueLine = lines[index + 1].trim();
    console.log("QRS Value Line:", valueLine);
    
    const genderMatch = valueLine.match(/(Male|Female)/i);
    if (genderMatch) sex = genderMatch[1].toLowerCase() === 'male' ? 1 : 0;
    
    const dobMatch = valueLine.match(/(?:Male|Female)\s*([\d\-\/]+)/i);
    if (dobMatch) dob = dobMatch[1].trim();
    
    const ageMatch = valueLine.match(/\((\d+)\s*years\)/i);
    if (ageMatch) age = parseInt(ageMatch[1]);
    
    // Parse height e.g. "6 ft 3 in"
    const ftInMatch = valueLine.match(/(\d+)\s*ft\s*(\d+)\s*in/i);
    if (ftInMatch) {
      const ft = parseInt(ftInMatch[1]);
      const inches = parseInt(ftInMatch[2]);
      height = Math.round(ft * 30.48 + inches * 2.54);
    } else {
      const cmMatch = valueLine.match(/(\d+)\s*cm/i);
      if (cmMatch) height = parseInt(cmMatch[1]);
    }
    
    // Parse weight e.g. "223 lbs"
    const lbsMatch = valueLine.match(/(\d+)\s*lbs/i);
    if (lbsMatch) {
      const lbs = parseInt(lbsMatch[1]);
      weight = Math.round(lbs * 0.453592);
    } else {
      const kgMatch = valueLine.match(/(\d+)\s*kg/i);
      if (kgMatch) weight = parseInt(kgMatch[1]);
    }
  }
}

// ─── Test general BP parsing with date stripping fallback ───
const textWithoutDates = fullText.replace(/\d{1,4}[\/\-\.]\d{1,4}[\/\-\.]\d{1,4}/g, '');
const bpMatch = textWithoutDates.match(/(?:blood\s*pressure|bp|resting\s*bp|trestbps|pressure)\s*[:\-\s]\s*(\d+)/i);
if (bpMatch) {
  trestbps = parseInt(bpMatch[1]);
} else {
  const slashBpMatch = textWithoutDates.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (slashBpMatch) {
    trestbps = parseInt(slashBpMatch[1]);
  }
}

console.log("--- RESULTS ---");
console.log("Name:", name);
console.log("Sex (1=M, 0=F):", sex);
console.log("DOB:", dob);
console.log("Age:", age);
console.log("Height (cm):", height);
console.log("Weight (kg):", weight);
console.log("BP (trestbps):", trestbps);
