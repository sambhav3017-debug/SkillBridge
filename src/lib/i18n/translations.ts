export type Language = "en" | "hi";

export interface Translations {
  header: {
    homeAria: string;
    searchPlaceholder: string;
    searchBtnTitle: string;
    settingsBtnTitle: string;
    logIn: string;
    signUp: string;
    search: string;
    settings: string;
  };
  hero: {
    eyebrow1: string;
    eyebrow2: string;
    eyebrow3: string;
    titleLine1: string;
    titleLine2Our: string;
    titleLine2Bridge: string;
    description: string;
    getStarted: string;
    watchStory: string;
  };
  opportunities: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    capstonesTitle: string;
    capstonesDesc: string;
    researchTitle: string;
    researchDesc: string;
    mentorshipTitle: string;
    mentorshipDesc: string;
    careersTitle: string;
    careersDesc: string;
  };
  skills: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  ecosystem: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    studentTitle: string;
    studentRole: string;
    academiaTitle: string;
    academiaRole: string;
    industryTitle: string;
    industryRole: string;
    enterStudentPortal: string;
    enterAcademiaPortal: string;
    enterIndustryPortal: string;
  };
  progression: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  outcomes: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  closingCta: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryBtn: string;
    secondaryBtn: string;
  };
  footer: {
    tagline: string;
    operational: string;
    forStudents: string;
    forAcademia: string;
    forIndustry: string;
    platform: string;
    legal: string;
    allRightsReserved: string;
  };
  settings: {
    title: string;
    subtitle: string;
    language: string;
    languageSubtitle: string;
    langEn: string;
    langHi: string;
    appearance: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    themeDesc: string;
    accessibility: string;
    reduceMotion: string;
    reduceMotionDesc: string;
    textScale: string;
    textScaleDesc: string;
    contrast: string;
    contrastDesc: string;
    shortcuts: string;
    openSearch: string;
    globalSearch: string;
    settingsMenu: string;
    account: string;
    guestVisitor: string;
    student: string;
    academia: string;
    industry: string;
    privacyTerms: string;
    resetDefaults: string;
    resetConfirmed: string;
  };
  search: {
    modalAria: string;
    placeholder: string;
    all: string;
    portals: string;
    opportunities: string;
    studentCat: string;
    academiaCat: string;
    industryCat: string;
    platformCat: string;
    authCat: string;
    open: string;
    noResultsTitle: string;
    noResultsDesc: string;
    trySearching: string;
    trending: string;
    navTip: string;
    selectTip: string;
    closeTip: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      homeAria: "SkillBridge home",
      searchPlaceholder: "Search SkillBridge...",
      searchBtnTitle: "Search SkillBridge (⌘K)",
      settingsBtnTitle: "Settings (⌘,)",
      logIn: "Log In",
      signUp: "Sign Up",
      search: "Search",
      settings: "Settings",
    },
    hero: {
      eyebrow1: "LEARN",
      eyebrow2: "GROW",
      eyebrow3: "GET PLACED",
      titleLine1: "Your Skills.",
      titleLine2Our: "Our",
      titleLine2Bridge: "Bridge.",
      description:
        "SkillBridge connects students, industry and academia to build real skills, create opportunities and shape a better tomorrow.",
      getStarted: "Get Started",
      watchStory: "Watch the story",
    },
    opportunities: {
      badge: "DISCOVER YOUR NEXT OPPORTUNITY",
      title: "Four Pathways to",
      titleAccent: "Accelerate Forward",
      subtitle:
        "Select a pathway to inspect real project scopes, research fellowships, direct mentorship, and fast-track hiring pipelines.",
      capstonesTitle: "Industry Capstones",
      capstonesDesc:
        "Tackle verified engineering briefs submitted by top tech teams with structured milestone evaluations.",
      researchTitle: "Research Fellowships",
      researchDesc:
        "Collaborate with university research labs on frontier AI, distributed computing, and biotechnology.",
      mentorshipTitle: "1-on-1 Mentorship",
      mentorshipDesc:
        "Pair with seasoned practitioners who review your system architectures, pull requests, and career trajectory.",
      careersTitle: "Fast-Track Pipelines",
      careersDesc:
        "Skip keyword-matching resume filters. Employers invite you directly based on demonstrated project mastery.",
    },
    skills: {
      badge: "LEARN BY BUILDING",
      title: "Turn Skills into",
      titleAccent: "Real Projects",
      subtitle:
        "Practical execution, cross-disciplinary collaboration, and production commits help you prove real-world engineering mastery.",
    },
    ecosystem: {
      badge: "ONE CONNECTED ECOSYSTEM",
      title: "Three Words,",
      titleAccent: "One Unified Network",
      subtitle:
        "SkillBridge replaces isolated silos with a continuous triangular bridge. Every project, curriculum, and recruitment drive strengthens the collective momentum of the entire community.",
      studentTitle: "Students",
      studentRole: "Learners & Future Innovators",
      academiaTitle: "Academia",
      academiaRole: "Educators, Mentors & Research Labs",
      industryTitle: "Industry",
      industryRole: "Enterprises & Leading Tech Companies",
      enterStudentPortal: "Enter Student Portal",
      enterAcademiaPortal: "Enter Academia Portal",
      enterIndustryPortal: "Enter Industry Portal",
    },
    progression: {
      badge: "CONTINUOUS GROWTH",
      title: "From Progress to",
      titleAccent: "Possibility",
      subtitle:
        "Track your verified growth across 5 progressive milestones designed to transform curiosity into career leadership.",
    },
    outcomes: {
      badge: "VERIFIED IMPACT",
      title: "Real Outcomes,",
      titleAccent: "Real Connections",
      subtitle:
        "See how students, academic institutions, and global tech leaders thrive across our shared network.",
    },
    closingCta: {
      badge: "BUILD WHAT COMES NEXT",
      titleLine1: "Your Future Is Built",
      titleLine2: "One Skill at a Time.",
      subtitle:
        "Whether you're a student building your first repo, a faculty member mentoring innovators, or an enterprise hiring talent, SkillBridge is where progress connects.",
      primaryBtn: "Get Started Now",
      secondaryBtn: "Explore All Portals",
    },
    footer: {
      tagline:
        "The unified platform connecting students, university academia, and forward-looking industry into a single continuous talent bridge.",
      operational: "All Systems Operational",
      forStudents: "For Students",
      forAcademia: "For Academia",
      forIndustry: "For Industry",
      platform: "Platform",
      legal: "Legal & Compliance",
      allRightsReserved: "All rights reserved.",
    },
    settings: {
      title: "Website Settings",
      subtitle: "Personalize language, theme, accessibility, and platform preferences",
      language: "Language",
      languageSubtitle: "Select your preferred interface language",
      langEn: "English",
      langHi: "हिंदी (Hindi)",
      appearance: "Appearance & Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
      themeDesc:
        "System mode synchronizes automatically with your operating system day/night schedule.",
      accessibility: "Accessibility",
      reduceMotion: "Reduce Motion",
      reduceMotionDesc:
        "Minimize transitions and disable background 3D spring animations.",
      textScale: "Text Scale",
      textScaleDesc: "Adjust base font scale for enhanced on-screen readability.",
      contrast: "Enhanced Contrast",
      contrastDesc: "Boost border contrast and text legibility across all panels.",
      shortcuts: "Search & Navigation",
      openSearch: "Open Website Search...",
      globalSearch: "Global Search",
      settingsMenu: "Settings Menu",
      account: "Account & Session",
      guestVisitor: "Guest Visitor",
      student: "Student",
      academia: "Academia",
      industry: "Industry",
      privacyTerms: "Privacy & Terms",
      resetDefaults: "Reset",
      resetConfirmed: "Reset to defaults",
    },
    search: {
      modalAria: "SkillBridge Intelligent Search",
      placeholder: "Search features, opportunities, portals, research...",
      all: "All",
      portals: "Portals",
      opportunities: "Opportunities",
      studentCat: "Student",
      academiaCat: "Academia",
      industryCat: "Industry",
      platformCat: "Platform",
      authCat: "Accounts",
      open: "Open",
      noResultsTitle: "No matching results found",
      noResultsDesc: "We couldn't find anything matching",
      trySearching: "Try searching for:",
      trending: "Trending:",
      navTip: "navigate",
      selectTip: "select",
      closeTip: "close",
    },
  },

  hi: {
    header: {
      homeAria: "स्किलब्रिज होम",
      searchPlaceholder: "स्किलब्रिज में खोजें...",
      searchBtnTitle: "स्किलब्रिज खोजें (⌘K)",
      settingsBtnTitle: "सेटिंग्स (⌘,)",
      logIn: "लॉग इन",
      signUp: "साइन अप",
      search: "खोजें",
      settings: "सेटिंग्स",
    },
    hero: {
      eyebrow1: "सीखें",
      eyebrow2: "आगे बढ़ें",
      eyebrow3: "प्लेसमेंट पाएं",
      titleLine1: "आपका कौशल।",
      titleLine2Our: "हमारा",
      titleLine2Bridge: "सेतु।",
      description:
        "स्किलब्रिज छात्रों, उद्योग और शिक्षा जगत को जोड़ता है ताकि वास्तविक कौशल का निर्माण हो, नए अवसर पैदा हों और एक बेहतर कल संवर सके।",
      getStarted: "शुरू करें",
      watchStory: "कहानी देखें",
    },
    opportunities: {
      badge: "अपना अगला अवसर खोजें",
      title: "आगे बढ़ने के",
      titleAccent: "चार सुनहरे रास्ते",
      subtitle:
        "वास्तविक प्रोजेक्ट कार्यक्षेत्र, रिसर्च फेलोशिप, प्रत्यक्ष मेंटरशिप और फास्ट-ट्रैक हायरिंग पाइपलाइन देखने के लिए एक मार्ग चुनें।",
      capstonesTitle: "उद्योग कैपस्टोन",
      capstonesDesc:
        "शीर्ष तकनीकी टीमों द्वारा प्रस्तुत सत्यापित इंजीनियरिंग समस्याओं पर संरचित मूल्यांकन के साथ काम करें।",
      researchTitle: "रिसर्च फेलोशिप",
      researchDesc:
        "अग्रणी एआई, डिस्ट्रीब्यूटेड कंप्यूटिंग और बायोटेक्नोलॉजी पर विश्वविद्यालय अनुसंधान प्रयोगशालाओं के साथ सहयोग करें।",
      mentorshipTitle: "1-ऑन-1 मेंटरशिप",
      mentorshipDesc:
        "अनुभवी विशेषज्ञों से जुड़ें जो आपके सिस्टम आर्किटेक्चर, कोड समीक्षा और करियर मार्गदर्शन में मदद करते हैं।",
      careersTitle: "फास्ट-ट्रैक पाइपलाइन",
      careersDesc:
        "रेज़्यूमे फिल्टर छोड़ें। नियोक्ता आपकी प्रदर्शित प्रोजेक्ट दक्षता के आधार पर सीधे आपको आमंत्रित करते हैं।",
    },
    skills: {
      badge: "करके सीखें",
      title: "कौशल को बदलें",
      titleAccent: "वास्तविक प्रोजेक्ट्स में",
      subtitle:
        "व्यावहारिक निष्पादन, अंतर-विषयक सहयोग और प्रोडक्शन कोड कमिट्स आपको वास्तविक इंजीनियरिंग दक्षता साबित करने में मदद करते हैं।",
    },
    ecosystem: {
      badge: "एक एकीकृत तंत्र",
      title: "तीन शब्द,",
      titleAccent: "एक संयुक्त नेटवर्क",
      subtitle:
        "स्किलब्रिज अलग-थलग व्यवस्था को एक निरंतर त्रिकोणीय सेतु से बदलता है। प्रत्येक प्रोजेक्ट, पाठ्यक्रम और भर्ती अभियान पूरे समुदाय की गति को मजबूत करता है।",
      studentTitle: "छात्र",
      studentRole: "शिक्षार्थी और भविष्य के नवप्रवर्तक",
      academiaTitle: "शिक्षा जगत",
      academiaRole: "शिक्षक, मार्गदर्शक और अनुसंधान प्रयोगशालाएं",
      industryTitle: "उद्योग",
      industryRole: "उद्यम और अग्रणी टेक कंपनियां",
      enterStudentPortal: "छात्र पोर्टल में प्रवेश करें",
      enterAcademiaPortal: "अकादमिक पोर्टल में प्रवेश करें",
      enterIndustryPortal: "उद्योग पोर्टल में प्रवेश करें",
    },
    progression: {
      badge: "निरंतर प्रगति",
      title: "प्रगति से",
      titleAccent: "संभावनाओं तक",
      subtitle:
        "जिज्ञासा को करियर नेतृत्व में बदलने के लिए डिज़ाइन किए गए 5 प्रगतिशील मील के पत्थरों के साथ अपनी सत्यापित वृद्धि को ट्रैक करें।",
    },
    outcomes: {
      badge: "सत्यापित प्रभाव",
      title: "सच्चे परिणाम,",
      titleAccent: "सच्चे संपर्क",
      subtitle:
        "देखें कि कैसे छात्र, शैक्षणिक संस्थान और वैश्विक तकनीकी दिग्गज हमारे साझा नेटवर्क में प्रगति कर रहे हैं।",
    },
    closingCta: {
      badge: "भविष्य का निर्माण करें",
      titleLine1: "आपका भविष्य निर्मित होता है",
      titleLine2: "एक समय में एक कौशल से।",
      subtitle:
        "चाहे आप अपना पहला प्रोजेक्ट बनाने वाले छात्र हों, नवप्रवर्तकों को सलाह देने वाले शिक्षक हों, या प्रतिभा की तलाश में कोई उद्योग, स्किलब्रिज पर ही हर प्रगति जुड़ती है।",
      primaryBtn: "अभी शुरू करें",
      secondaryBtn: "सभी पोर्टल देखें",
    },
    footer: {
      tagline:
        "छात्रों, विश्वविद्यालय शिक्षा जगत और भविष्योन्मुखी उद्योग को एक निरंतर प्रतिभा सेतु में जोड़ने वाला एकीकृत मंच।",
      operational: "सभी प्रणालियाँ सक्रिय हैं",
      forStudents: "छात्रों के लिए",
      forAcademia: "शिक्षा जगत के लिए",
      forIndustry: "उद्योग के लिए",
      platform: "प्लेटफॉर्म",
      legal: "कानूनी और अनुपालन",
      allRightsReserved: "सर्वाधिकार सुरक्षित।",
    },
    settings: {
      title: "वेबसाइट सेटिंग्स",
      subtitle: "भाषा, थीम, सुगमता और प्लेटफॉर्म प्राथमिकताओं को अनुकूलित करें",
      language: "भाषा (Language)",
      languageSubtitle: "अपनी पसंदीदा इंटरफ़ेस भाषा चुनें",
      langEn: "English",
      langHi: "हिंदी (Hindi)",
      appearance: "दिखावट और थीम",
      themeLight: "लाइट",
      themeDark: "डार्क",
      themeSystem: "सिस्टम",
      themeDesc:
        "सिस्टम मोड आपके ऑपरेटिंग सिस्टम के दिन/रात शेड्यूल से स्वतः मेल खाता है।",
      accessibility: "सुगमता (Accessibility)",
      reduceMotion: "मोशन कम करें",
      reduceMotionDesc:
        "एनिमेशन और बैकग्राउंड 3D मोशन प्रभावों को कम करें।",
      textScale: "टेक्स्ट का आकार",
      textScaleDesc: "बेहतर पठनीयता के लिए मुख्य फ़ॉन्ट आकार समायोजित करें।",
      contrast: "बेहतर कंट्रास्ट",
      contrastDesc: "सभी पैनल में बॉर्डर और टेक्स्ट की स्पष्टता बढ़ाएं।",
      shortcuts: "खोज और नेविगेशन",
      openSearch: "वेबसाइट खोज खोलें...",
      globalSearch: "वैश्विक खोज",
      settingsMenu: "सेटिंग्स मेनू",
      account: "खाता और सत्र",
      guestVisitor: "अतिथि आगंतुक",
      student: "छात्र",
      academia: "शिक्षा जगत",
      industry: "उद्योग",
      privacyTerms: "गोपनीयता और शर्तें",
      resetDefaults: "रीसेट करें",
      resetConfirmed: "डिफ़ॉल्ट पर रीसेट किया गया",
    },
    search: {
      modalAria: "स्किलब्रिज बुद्धिमान खोज",
      placeholder: "सुविधाएं, अवसर, पोर्टल, अनुसंधान खोजें...",
      all: "सभी",
      portals: "पोर्टल",
      opportunities: "अवसर",
      studentCat: "छात्र",
      academiaCat: "शिक्षा जगत",
      industryCat: "उद्योग",
      platformCat: "प्लेटफॉर्म",
      authCat: "खाते",
      open: "खोलें",
      noResultsTitle: "कोई मेल खाने वाला परिणाम नहीं मिला",
      noResultsDesc: "हमें इसके लिए कुछ नहीं मिला",
      trySearching: "इन्हें खोज कर देखें:",
      trending: "लोकप्रिय:",
      navTip: "नेविगेट करें",
      selectTip: "चुनें",
      closeTip: "बंद करें",
    },
  },
};
