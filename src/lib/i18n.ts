export type Language = 'en' | 'hi' | 'te';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  safetyStatus: string;
  normalRisk: string;
  moderateRisk: string;
  highRisk: string;
  criticalRisk: string;
  sosButton: string;
  home: string;
  trips: string;
  map: string;
  alerts: string;
  crowd: string;
  passport: string;
  privacy: string;
  profile: string;
  askAi: string;
  emergencyContacts: string;
  documents: string;
  hotels: string;
  feedback: string;
  dashboard: string;
  auditTrail: string;
  tripReminderPrompt: string;
  imSafe: string;
  needHelp: string;
  saferRoute: string;
  gateRecommendation: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'AI Tourist Guardian',
    tagline: 'Your Safety. Our Priority.',
    safetyStatus: 'Safety Status',
    normalRisk: 'NORMAL (LOW RISK)',
    moderateRisk: 'MODERATE CAUTION',
    highRisk: 'ELEVATED RISK',
    criticalRisk: 'CRITICAL ALERT',
    sosButton: 'EMERGENCY SOS',
    home: 'Home',
    trips: 'Trip Hub',
    map: 'Safety GIS Map',
    alerts: 'Live Alerts',
    crowd: 'Crowd Intelligence',
    passport: 'Safety Passport',
    privacy: 'Privacy & Consent',
    profile: 'Profile',
    askAi: 'Guardian AI Copilot',
    emergencyContacts: 'Emergency Contacts',
    documents: 'Document Vault',
    hotels: 'Verified Accommodations',
    feedback: 'Journey Feedback',
    dashboard: 'Command Dashboard',
    auditTrail: 'Audit Trail',
    tripReminderPrompt: 'Your planned trip ends in 24 hours. Are you safe and on schedule?',
    imSafe: "I'M SAFE",
    needHelp: 'NEED ASSISTANCE',
    saferRoute: 'Recommended Safer Route',
    gateRecommendation: 'Alternate Gate Recommendation',
  },
  hi: {
    appName: 'एआई टूरिस्ट गार्जियन',
    tagline: 'आपकी सुरक्षा। हमारी प्राथमिकता।',
    safetyStatus: 'सुरक्षा स्थिति',
    normalRisk: 'सामान्य (कम जोखिम)',
    moderateRisk: 'मध्यम सावधानी',
    highRisk: 'बढ़ा हुआ जोखिम',
    criticalRisk: 'गंभीर आपातकाल',
    sosButton: 'आपातकालीन एसओएस',
    home: 'होम',
    trips: 'यात्रा प्रबंधन',
    map: 'सुरक्षा मानचित्र',
    alerts: 'लाइव अलर्ट',
    crowd: 'भीड़ विश्लेषण',
    passport: 'सुरक्षा पासपोर्ट',
    privacy: 'गोपनीयता और सहमति',
    profile: 'प्रोफ़ाइल',
    askAi: 'गार्जियन एआई सहायक',
    emergencyContacts: 'आपातकालीन संपर्क',
    documents: 'दस्तावेज़ वॉल्ट',
    hotels: 'सत्यापित होटल',
    feedback: 'यात्रा समीक्षा',
    dashboard: 'कमांड डैशबोर्ड',
    auditTrail: 'ऑडिट लॉग',
    tripReminderPrompt: 'आपकी नियोजित यात्रा 24 घंटों में समाप्त हो रही है। क्या आप सुरक्षित और समय पर हैं?',
    imSafe: 'मैं सुरक्षित हूँ',
    needHelp: 'सहायता चाहिए',
    saferRoute: 'अनुशंसित सुरक्षित मार्ग',
    gateRecommendation: 'वैकल्पिक प्रवेश द्वार अनुशंसा',
  },
  te: {
    appName: 'ఏఐ టూరిస్ట్ గార్డియన్',
    tagline: 'మీ భద్రత. మా ప్రాధాన్యత.',
    safetyStatus: 'భద్రతా స్థితి',
    normalRisk: 'సాధారణం (తక్కువ ప్రమాదం)',
    moderateRisk: 'మధ్యస్థ హెచ్చరిక',
    highRisk: 'ఎక్కువ ప్రమాదం',
    criticalRisk: 'తీవ్ర హెచ్చరిక',
    sosButton: 'అత్యవసర SOS',
    home: 'హోమ్',
    trips: 'ట్రిప్ నిర్వహణ',
    map: 'భద్రతా మ్యాప్',
    alerts: 'లైవ్ హెచ్చరికలు',
    crowd: 'క్రౌడ్ విశ్లేషణ',
    passport: 'భద్రతా పాస్‌పోర్ట్',
    privacy: 'గోప్యత & సమ్మతి',
    profile: 'ప్రొఫైల్',
    askAi: 'గార్డియన్ ఏఐ కోపైలట్',
    emergencyContacts: 'అత్యవసర పరిచయాలు',
    documents: 'డాక్యుమెంట్ వాల్ట్',
    hotels: 'ధృవీకరించబడిన హోటళ్ళు',
    feedback: 'ప్రయాణ సమీక్ష',
    dashboard: 'కమాండ్ డ్యాష్‌బోర్డ్',
    auditTrail: 'ఆడిట్ లాగ్‌లు',
    tripReminderPrompt: 'మీ ప్రణాళికాబద్ధమైన యాత్ర 24 గంటల్లో ముగుస్తుంది. మీరు సురక్షితంగా ఉన్నారా?',
    imSafe: 'నేను సురక్షితంగా ఉన్నాను',
    needHelp: 'సహాయం కావాలి',
    saferRoute: 'సురక్షితమైన మార్గం',
    gateRecommendation: 'ప్రత్యామ్నాయ గేట్ సిఫార్సు',
  },
};
