import { Resume } from '../types';

export const sampleResumeMarkdown = `# PAARSAH SOROURI JAM
**Software Engineer | Full-Stack Developer | .NET / Java | React / Next.js | Flutter | Sensor Processing & 3D Visualization**
Yerevan, Armenia | +374 93 067 011 | paarsah.sorouri@gmail.com | https://github.com/PaarsahJam | linkedin.com/in/paarsah-sorouri-jam-2892922a2

## PROFESSIONAL SUMMARY
Versatile and detail-oriented Software Engineer with extensive experience architecting modern full-stack web applications, cross-platform software, and high-performance engineering simulations. Skilled in C#, Java, TypeScript/JavaScript, React/Next.js, and Flutter, with specialized domain expertise in inertial sensor processing (AHRS/IMU), real-time 3D telemetry visualization, and data-intensive distributed backends. Proven track record in designing resilient RESTful/GraphQL APIs, implementing mathematical sensor fusion algorithms (EKF/MEKF), and building scalable user interfaces.

## CORE TECHNICAL SKILLS
### Programming Languages
C# • Java • JavaScript / ES6+ • TypeScript • Python • Dart • C/C++ — previous project experience

### Web & Front-End Development
React.js • Next.js • Flutter • HTML5 • CSS3 • Material UI • Tailwind CSS • Bootstrap • Progressive Web Applications (PWA) • Responsive UI development

### Back-End & APIs
C# / .NET • Java • Node.js • Express.js • NestJS • RESTful APIs • Basic GraphQL • JWT authentication • Authentication providers and OAuth-based flows • Business logic and service-layer development

### State Management & Architecture
Riverpod • Riverpod Generator • Redux Toolkit • TanStack Query • Context API • Feature-based architecture • Clean architecture principles • Dependency injection • Repository / service patterns • Modular application design

### Databases & Persistence
PostgreSQL • MySQL • MongoDB • SQLite • Drift • Prisma • Drizzle • TypeORM

### Sensor Processing & Engineering
AHRS • IMU processing • Gyroscope / accelerometer / magnetometer data • Sensor calibration • Hard-Iron / Soft-Iron calibration • Complementary Filters • Extended Kalman Filter (EKF) • Multiplicative Extended Kalman Filter (MEKF) • Quaternion mathematics • Euler angles • Sensor data synchronization • Offline sensor-data processing

### Graphics & Visualization
OpenGL • Nzy3d • Avalonia • .NET MAUI • 3D orientation visualization • Engineering data visualization • Diagnostic charts • Real-time and offline data visualization

### DevOps & Infrastructure
Git / GitHub • Docker • Kubernetes • Linux / Ubuntu • Windows • macOS • VMware Workstation • VirtualBox • Proxmox • Basic server administration

### Additional Technical Experience
Computer networking • Cisco-based networks • Computer hardware and maintenance • Electronics • Embedded-systems familiarity • Binary data decoding • Biomedical data processing • Payment integration • Stripe

## PROFESSIONAL EXPERIENCE
### Software Engineer / AHRS & 3D Graphics Engineer
**Aladdin Project / Specialized Sensor Systems** | Yerevan, Armenia / Remote | 2023 – 2025
- Researched, architected, and engineered high-accuracy AHRS (Attitude and Heading Reference System) evaluation software for multi-axis inertial measurement units (IMUs).
- Designed and built a cross-platform desktop telemetry evaluation suite using C# (.NET), Avalonia UI, and .NET MAUI for continuous sensor monitoring and verification.
- Implemented real-time 3D sensor orientation rendering engine using OpenGL, visualizing full 6-DOF orientation, Euler angles, and quaternion-based attitude state.
- Developed and tuned sensor fusion pipelines utilizing Complementary Filters, Extended Kalman Filters (EKF), and Multiplicative EKF (MEKF) to eliminate gyro drift and acceleration noise.
- Engineered automated calibration routines for accelerometer bias, magnetometer distortion, and gyroscope drift compensation.
- Technologies: C#, .NET, Avalonia UI, .NET MAUI, OpenGL, Quaternions, EKF/MEKF, IMU Sensors, C/C++

### Full-Stack Software Engineer
**Trackar Analytics Platform** | Remote | 2021 – 2023
- Designed, built, and maintained modular full-stack web applications delivering real-time telemetry, user tracking analytics, and business insights.
- Developed responsive, high-performance front-end dashboards using React.js, Next.js, Material UI, and Tailwind CSS.
- Architected resilient backend microservices and high-throughput RESTful & GraphQL APIs utilizing Node.js (Express, Nest.js) and Java.
- Implemented end-to-end multi-provider authentication systems with JWT, Clerk, and Kinde, alongside secure role-based access control (RBAC).
- Integrated Stripe recurring payment and billing pipelines with automated invoice generation, webhook event handling, and tier upgrade flows.
- Structured and optimized relational and document databases across PostgreSQL, MySQL, and MongoDB using Prisma and Entity Framework.
- Technologies: React.js, Next.js, Java, Node.js, TypeScript, PostgreSQL, MongoDB, Prisma, Stripe, Tailwind CSS, Docker

### Remote Freelance Software Developer
**Independent Engineering & Client Solutions** | Remote | 2018 – 2021
- Engineered custom end-to-end web and mobile software solutions for diverse international clients and small businesses.
- Developed cross-platform mobile and web applications using Flutter, Dart, React.js, and TypeScript with focus on responsive layouts and fast load times.
- Designed backend APIs and data models in Node.js (Express) and C# ASP.NET Core with robust error handling and structured validation.
- Handled full software lifecycle from client requirements gathering and technical design to deployment, DNS configuration, and performance tuning.
- Technologies: TypeScript, React.js, Flutter, Dart, Node.js, C#, ASP.NET Core, MySQL, Docker, REST APIs

### Earlier Technical Experience
**Applied Technical Systems & Freelance** | Yerevan / Remote | 2016 – 2018
- Built foundational software utilities, accounting tooling, and hardware-interfaced data loggers in C/C++, C#, and Java.
- Implemented desktop graphical interfaces for database management and serial communication with embedded measurement hardware.
- Gained deep hands-on expertise in algorithm optimization, multithreading, and low-level data structures.
- Technologies: C/C++, C#, Java, SQL, Serial Port Communication, Windows Forms

## SELECTED SOFTWARE PROJECTS
### Accounting Management Application
Comprehensive desktop financial and inventory management system designed for double-entry bookkeeping, invoicing, ledger tracking, and automated financial report generation.
- Technologies: C#, .NET, SQL Server / SQLite, Entity Framework, Custom Reporting Engine, MVVM Architecture
- Key Engineering Work: Engineered scalable double-entry transactional accounting engine ensuring complete financial ledger consistency; built intuitive desktop user interface with advanced filtering, multi-currency support, and instant PDF invoice generation; designed automated backup routines to safeguard financial records.

### ECG / BIOMEDICAL DATA PROCESSING APPLICATION
Specialized biomedical signal processing application engineered to ingest, filter, process, and visualize electro-cardiogram (ECG) telemetry in real time.
- Technologies: Java, C#, Digital Signal Processing (DSP), Real-Time Canvas, Butterworth Filtering
- Key Engineering Work: Implemented real-time digital filtering algorithms (bandpass, notch, and baseline-wander removal) to clean noisy raw bio-signals; developed QRS complex detection and real-time heart-rate variability (HRV) calculation modules; rendered high-framerate interactive waveform graphs with zoom, pan, and annotation tools.

### MMS / AHRS SENSOR PROCESSING SYSTEM
End-to-end inertial measurement and attitude estimation suite for real-time motion capture, multi-sensor calibration, and 3D orientation rendering.
- Technologies: C#, OpenGL, Avalonia UI, Quaternions, EKF/MEKF, Serial / UDP Telemetry, Mathematical Modeling
- Key Engineering Work: Integrated live serial/UDP data streams from 6-DOF and 9-DOF IMU sensors; applied quaternion mathematical transformations to eliminate gimbal lock during continuous 3D rotation rendering; built customizable diagnostic panels plotting raw accelerometer, gyroscope, and filtered orientation data in real time.

## TECHNICAL STRENGTHS
- Sensor fusion algorithms, real-time data stream processing, and 3D orientational visualization
- Full-stack architectural design spanning robust backend microservices, clean REST/GraphQL APIs, and modern responsive front-ends
- Strong algorithmic problem-solving, math-intensive software engineering, and performance optimization
- Cross-platform desktop and mobile engineering (.NET MAUI, Avalonia UI, Flutter)
- High adaptability to new frameworks, clean code standards, and agile engineering workflows

## EDUCATION
### Azad University | Electronic Engineering Studies
Karaj | Coursework Completed
In-depth coursework in digital signal processing (DSP), circuit design, embedded microcontrollers, control systems, and engineering mathematics.

## PROFESSIONAL TRAINING
- Software Developer Vocational Certification — ACECR Sharif University Training Center (Comprehensive full-stack software development curriculum covering algorithms, data structures, enterprise architecture, Java, and database engineering)
- Advanced Java Programming — ACECR Sharif University Training Center (2021)
- Advanced C# / .NET Programming — ACECR Sharif University Training Center (2022)

## LANGUAGES
- English: Professional Working Proficiency / Advanced (Full technical communication, documentation, and remote collaboration)
- Persian (Farsi): Native Proficiency
- Armenian: Basic / Conversational

## AVAILABILITY
- Full-time Remote (Flexible timezone overlap across Americas, Europe, and Asia)
- Open to international relocation and contract / full-time employment

## REFERENCES
- Professional references and code samples available upon request.
`;

export const armenianSampleResumeMarkdown = `# Արմեն Գրիգորյան
**Ավագ Ծրագրային Ապահովման Ճարտարագետ (Full-Stack & Cloud)**
Երևան, Հայաստան (Հեռավար / Տեղափոխության պատրաստ) | armen.grigoryan@example.am | +374 91 12 34 56 | github.com/armengrigoryan | linkedin.com/in/armengrigoryan

## ԱՄՓՈՓՈՒՄ
Ավելի քան 6 տարվա փորձով ծրագրային ապահովման ճարտարագետ, մասնագիտացված ժամանակակից վեբ համակարգերի, ամպային ճարտարապետության և բարձր արտադրողականությամբ API-ների մշակման ոլորտում:

## ՀՄՏՈՒԹՅՈՒՆՆԵՐ
Ծրագրավորման լեզուներ: JavaScript (ES6+), TypeScript, C#, Python, SQL
Ֆրոնթենդ: React.js, Next.js, Redux, Tailwind CSS, HTML5/CSS3
Բեքենդ: Node.js (Express, Nest.js), C# ASP.NET Core, REST, GraphQL
Տվյալների բազաներ: PostgreSQL, MongoDB, Redis, Prisma, EF Core
DevOps և գործիքներ: Git, Docker, Kubernetes, AWS, Linux, CI/CD

## ՓՈՐՁԱՌՈՒԹՅՈՒՆ
### Ավագ Ծրագրավորող | «Սոֆթ Ինովացիաներ» ՍՊԸ
Երևան, Հայաստան | 2022 – Ներկա
- Մշակել և ներդրել է բարձր ծանրաբեռնվածությամբ ամպային համակարգեր, որոնք սպասարկում են 100,000+ ակտիվ օգտատերերի:
- Օպտիմալացրել է տվյալների բազայի հարցումները՝ բարձրացնելով համակարգի արագագործությունը 40%-ով:
- Ղեկավարել է 6 ծրագրավորողներից կազմված թիմը և իրականացրել կոդի ստուգումներ (Code Review):

### Full-Stack Ծրագրավորող | «Տեխնո Ստարտափ»
Երևան, Հայաստան | 2019 – 2022
- Մշակել է ինտերակտիվ վեբ հավելվածներ React.js և Node.js տեխնոլոգիաներով:
- Ինտեգրել է վճարային համակարգեր (Stripe, Idram) և նույնականացման ծառայություններ:

## ԿՐԹՈՒԹՅՈՒՆ
### Հայաստանի Ազգային Պոլիտեխնիկական Համալսարան
Բակալավր — Կոմպյուտերային Ճարտարագիտություն | 2015 – 2019

## ՍԵՐՏԻՖԻԿԱՏՆԵՐ
- AWS Certified Solutions Architect - Associate, 2023
- Certified Professional Scrum Master (PSM I), 2022

## ԼԵԶՈՒՆԵՐ
Հայերեն: Մայրենի
Անգլերեն: Սահուն / Պրոֆեսիոնալ
Ռուսերեն: Ազատ
`;

export const armenianSampleResume: Resume = {
  id: 'armenian-sample-resume',
  meta: {
    title: 'Արմեն Գրիգորյան — Ծրագրային Ճարտարագետ (Հայերեն)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Full-Stack', 'Armenian', 'Հայերեն', 'React'],
  },
  personal: {
    fullName: 'Արմեն Գրիգորյան',
    headline: 'Ավագ Ծրագրային Ապահովման Ճարտարագետ (Full-Stack & Cloud)',
    location: 'Երևան, Հայաստան (Հեռավար / Տեղափոխության պատրաստ)',
    email: 'armen.grigoryan@example.am',
    phone: '+374 91 12 34 56',
    website: 'https://github.com/armengrigoryan',
    github: 'github.com/armengrigoryan',
    linkedin: 'linkedin.com/in/armengrigoryan',
  },
  summary:
    'Ավելի քան 6 տարվա փորձով ծրագրային ապահովման ճարտարագետ, մասնագիտացված ժամանակակից վեբ համակարգերի, ամպային ճարտարապետության և բարձր արտադրողականությամբ API-ների մշակման ոլորտում:',
  skills: [
    {
      category: 'Ծրագրավորման լեզուներ',
      items: ['JavaScript (ES6+)', 'TypeScript', 'C#', 'Python', 'SQL'],
    },
    {
      category: 'Ֆրոնթենդ',
      items: ['React.js', 'Next.js', 'Redux', 'Tailwind CSS', 'HTML5/CSS3'],
    },
    {
      category: 'Բեքենդ',
      items: ['Node.js (Express, Nest.js)', 'C# ASP.NET Core', 'REST', 'GraphQL'],
    },
    {
      category: 'Տվյալների բազաներ',
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma', 'EF Core'],
    },
    {
      category: 'DevOps և գործիքներ',
      items: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
    },
  ],
  experience: [
    {
      id: 'hy-exp-1',
      jobTitle: 'Ավագ Ծրագրավորող',
      company: '«Սոֆթ Ինովացիաներ» ՍՊԸ',
      location: 'Երևան, Հայաստան',
      startDate: '2022',
      endDate: 'Ներկա',
      description: [
        'Մշակել և ներդրել է բարձր ծանրաբեռնվածությամբ ամպային համակարգեր, որոնք սպասարկում են 100,000+ ակտիվ օգտատերերի:',
        'Օպտիմալացրել է տվյալների բազայի հարցումները՝ բարձրացնելով համակարգի արագագործությունը 40%-ով:',
        'Ղեկավարել է 6 ծրագրավորողներից կազմված թիմը և իրականացրել կոդի ստուգումներ (Code Review):',
      ],
    },
    {
      id: 'hy-exp-2',
      jobTitle: 'Full-Stack Ծրագրավորող',
      company: '«Տեխնո Ստարտափ»',
      location: 'Երևան, Հայաստան',
      startDate: '2019',
      endDate: '2022',
      description: [
        'Մշակել է ինտերակտիվ վեբ հավելվածներ React.js և Node.js տեխնոլոգիաներով:',
        'Ինտեգրել է վճարային համակարգեր (Stripe, Idram) և նույնականացման ծառայություններ:',
      ],
    },
  ],
  projects: [
    {
      id: 'hy-proj-1',
      name: 'Ամպային Վերլուծական Համակարգ',
      description: 'Իրական ժամանակում ենթակառուցվածքների մոնիթորինգի հավելված ինտերակտիվ գրաֆիկներով:',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    },
  ],
  education: [
    {
      id: 'hy-edu-1',
      institution: 'Հայաստանի Ազգային Պոլիտեխնիկական Համալսարան',
      degree: 'Բակալավր — Կոմպյուտերային Ճարտարագիտություն',
      dates: '2015 – 2019',
      description: 'Մասնագիտացում ալգորիթմների, օպերացիոն համակարգերի և վեբ տեխնոլոգիաների ոլորտում:',
    },
  ],
  certifications: [
    {
      id: 'hy-cert-1',
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
    {
      id: 'hy-cert-2',
      name: 'Certified Professional Scrum Master (PSM I)',
      issuer: 'Scrum.org',
      date: '2022',
    },
  ],
  languages: [
    { language: 'Հայերեն', level: 'Մայրենի' },
    { language: 'Անգլերեն', level: 'Սահուն / Պրոֆեսիոնալ' },
    { language: 'Ռուսերեն', level: 'Ազատ' },
  ],
  additionalSections: [],
  sectionOrder: [
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'languages',
  ],
  hiddenSections: [],
};

export const sampleResume: Resume = {
  id: 'demo-sample-resume',
  meta: {
    title: 'PAARSAH SOROURI JAM — Software Engineer & Full-Stack Developer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Full-Stack', '.NET', 'Java', 'React', 'Sensor Processing', '3D Graphics', 'Remote'],
  },
  personal: {
    fullName: 'PAARSAH SOROURI JAM',
    headline:
      'Software Engineer | Full-Stack Developer | .NET / Java | React / Next.js | Flutter | Sensor Processing & 3D Visualization',
    location: 'Yerevan, Armenia',
    email: 'paarsah.sorouri@gmail.com',
    phone: '+374 93 067 011',
    website: 'https://github.com/PaarsahJam',
    github: 'https://github.com/PaarsahJam',
    linkedin: 'linkedin.com/in/paarsah-sorouri-jam-2892922a2',
  },
  summary:
    'Versatile and detail-oriented Software Engineer with extensive experience architecting modern full-stack web applications, cross-platform software, and high-performance engineering simulations. Skilled in C#, Java, TypeScript/JavaScript, React/Next.js, and Flutter, with specialized domain expertise in inertial sensor processing (AHRS/IMU), real-time 3D telemetry visualization, and data-intensive distributed backends. Proven track record in designing resilient RESTful/GraphQL APIs, implementing mathematical sensor fusion algorithms (EKF/MEKF), and building scalable user interfaces.',
  skills: [
    {
      category: 'Programming Languages',
      items: [
        'C#',
        'Java',
        'JavaScript / ES6+',
        'TypeScript',
        'Python',
        'Dart',
        'C/C++ — previous project experience',
      ],
    },
    {
      category: 'Web & Front-End Development',
      items: [
        'React.js',
        'Next.js',
        'Flutter',
        'HTML5',
        'CSS3',
        'Material UI',
        'Tailwind CSS',
        'Bootstrap',
        'Progressive Web Applications (PWA)',
        'Responsive UI development',
      ],
    },
    {
      category: 'Back-End & APIs',
      items: [
        'C# / .NET',
        'Java',
        'Node.js',
        'Express.js',
        'NestJS',
        'RESTful APIs',
        'Basic GraphQL',
        'JWT authentication',
        'Authentication providers and OAuth-based flows',
        'Business logic and service-layer development',
      ],
    },
    {
      category: 'State Management & Architecture',
      items: [
        'Riverpod',
        'Riverpod Generator',
        'Redux Toolkit',
        'TanStack Query',
        'Context API',
        'Feature-based architecture',
        'Clean architecture principles',
        'Dependency injection',
        'Repository / service patterns',
        'Modular application design',
      ],
    },
    {
      category: 'Databases & Persistence',
      items: [
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'SQLite',
        'Drift',
        'Prisma',
        'Drizzle',
        'TypeORM',
      ],
    },
    {
      category: 'Sensor Processing & Engineering',
      items: [
        'AHRS',
        'IMU processing',
        'Gyroscope / accelerometer / magnetometer data',
        'Sensor calibration',
        'Hard-Iron / Soft-Iron calibration',
        'Complementary Filters',
        'Extended Kalman Filter (EKF)',
        'Multiplicative Extended Kalman Filter (MEKF)',
        'Quaternion mathematics',
        'Euler angles',
        'Sensor data synchronization',
        'Offline sensor-data processing',
      ],
    },
    {
      category: 'Graphics & Visualization',
      items: [
        'OpenGL',
        'Nzy3d',
        'Avalonia',
        '.NET MAUI',
        '3D orientation visualization',
        'Engineering data visualization',
        'Diagnostic charts',
        'Real-time and offline data visualization',
      ],
    },
    {
      category: 'DevOps & Infrastructure',
      items: [
        'Git / GitHub',
        'Docker',
        'Kubernetes',
        'Linux / Ubuntu',
        'Windows',
        'macOS',
        'VMware Workstation',
        'VirtualBox',
        'Proxmox',
        'Basic server administration',
      ],
    },
    {
      category: 'Additional Technical Experience',
      items: [
        'Computer networking',
        'Cisco-based networks',
        'Computer hardware and maintenance',
        'Electronics',
        'Embedded-systems familiarity',
        'Binary data decoding',
        'Biomedical data processing',
        'Payment integration',
        'Stripe',
      ],
    },
  ],
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Software Engineer / AHRS & 3D Graphics Engineer',
      company: 'Aladdin Project / Specialized Sensor Systems',
      location: 'Yerevan, Armenia / Remote',
      startDate: '2023',
      endDate: '2025',
      description: [
        'Researched, architected, and engineered high-accuracy AHRS (Attitude and Heading Reference System) evaluation software for multi-axis inertial measurement units (IMUs).',
        'Designed and built a cross-platform desktop telemetry evaluation suite using C# (.NET), Avalonia UI, and .NET MAUI for continuous sensor monitoring and verification.',
        'Implemented real-time 3D sensor orientation rendering engine using OpenGL, visualizing full 6-DOF orientation, Euler angles, and quaternion-based attitude state.',
        'Developed and tuned sensor fusion pipelines utilizing Complementary Filters, Extended Kalman Filters (EKF), and Multiplicative EKF (MEKF) to eliminate gyro drift and acceleration noise.',
        'Engineered automated calibration routines for accelerometer bias, magnetometer distortion, and gyroscope drift compensation.',
        'Technologies: C#, .NET, Avalonia UI, .NET MAUI, OpenGL, Quaternions, EKF/MEKF, IMU Sensors, C/C++',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Full-Stack Software Engineer',
      company: 'Trackar Analytics Platform',
      location: 'Remote',
      startDate: '2021',
      endDate: '2023',
      description: [
        'Designed, built, and maintained modular full-stack web applications delivering real-time telemetry, user tracking analytics, and business insights.',
        'Developed responsive, high-performance front-end dashboards using React.js, Next.js, Material UI, and Tailwind CSS.',
        'Architected resilient backend microservices and high-throughput RESTful & GraphQL APIs utilizing Node.js (Express, Nest.js) and Java.',
        'Implemented end-to-end multi-provider authentication systems with JWT, Clerk, and Kinde, alongside secure role-based access control (RBAC).',
        'Integrated Stripe recurring payment and billing pipelines with automated invoice generation, webhook event handling, and tier upgrade flows.',
        'Structured and optimized relational and document databases across PostgreSQL, MySQL, and MongoDB using Prisma and Entity Framework.',
        'Technologies: React.js, Next.js, Java, Node.js, TypeScript, PostgreSQL, MongoDB, Prisma, Stripe, Tailwind CSS, Docker',
      ],
    },
    {
      id: 'exp-3',
      jobTitle: 'Remote Freelance Software Developer',
      company: 'Independent Engineering & Client Solutions',
      location: 'Remote',
      startDate: '2018',
      endDate: '2021',
      description: [
        'Engineered custom end-to-end web and mobile software solutions for diverse international clients and small businesses.',
        'Developed cross-platform mobile and web applications using Flutter, Dart, React.js, and TypeScript with focus on responsive layouts and fast load times.',
        'Designed backend APIs and data models in Node.js (Express) and C# ASP.NET Core with robust error handling and structured validation.',
        'Handled full software lifecycle from client requirements gathering and technical design to deployment, DNS configuration, and performance tuning.',
        'Technologies: TypeScript, React.js, Flutter, Dart, Node.js, C#, ASP.NET Core, MySQL, Docker, REST APIs',
      ],
    },
    {
      id: 'exp-4',
      jobTitle: 'Earlier Technical Experience',
      company: 'Applied Technical Systems & Freelance',
      location: 'Yerevan / Remote',
      startDate: '2016',
      endDate: '2018',
      description: [
        'Built foundational software utilities, accounting tooling, and hardware-interfaced data loggers in C/C++, C#, and Java.',
        'Implemented desktop graphical interfaces for database management and serial communication with embedded measurement hardware.',
        'Gained deep hands-on expertise in algorithm optimization, multithreading, and low-level data structures.',
        'Technologies: C/C++, C#, Java, SQL, Serial Port Communication, Windows Forms',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Accounting Management Application',
      description: 'Comprehensive desktop financial and inventory management system designed for double-entry bookkeeping, invoicing, ledger tracking, and automated financial report generation.\n• Key Engineering Work: Engineered scalable double-entry transactional accounting engine ensuring complete financial ledger consistency; built intuitive desktop user interface with advanced filtering, multi-currency support, and instant PDF invoice generation; designed automated backup routines to safeguard financial records.',
      technologies: ['C#', '.NET', 'SQL Server / SQLite', 'Entity Framework', 'Custom Reporting Engine', 'MVVM Architecture'],
    },
    {
      id: 'proj-2',
      name: 'ECG / BIOMEDICAL DATA PROCESSING APPLICATION',
      description: 'Specialized biomedical signal processing application engineered to ingest, filter, process, and visualize electro-cardiogram (ECG) telemetry in real time.\n• Key Engineering Work: Implemented real-time digital filtering algorithms (bandpass, notch, and baseline-wander removal) to clean noisy raw bio-signals; developed QRS complex detection and real-time heart-rate variability (HRV) calculation modules; rendered high-framerate interactive waveform graphs with zoom, pan, and annotation tools.',
      technologies: ['Java', 'C#', 'Digital Signal Processing (DSP)', 'Real-Time Canvas', 'Butterworth Filtering'],
    },
    {
      id: 'proj-3',
      name: 'MMS / AHRS SENSOR PROCESSING SYSTEM',
      description: 'End-to-end inertial measurement and attitude estimation suite for real-time motion capture, multi-sensor calibration, and 3D orientation rendering.\n• Key Engineering Work: Integrated live serial/UDP data streams from 6-DOF and 9-DOF IMU sensors; applied quaternion mathematical transformations to eliminate gimbal lock during continuous 3D rotation rendering; built customizable diagnostic panels plotting raw accelerometer, gyroscope, and filtered orientation data in real time.',
      technologies: ['C#', 'OpenGL', 'Avalonia UI', 'Quaternions', 'EKF/MEKF', 'Serial / UDP Telemetry', 'Mathematical Modeling'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Azad University',
      degree: 'Electronic Engineering Studies',
      dates: 'Coursework Completed',
      description: 'In-depth coursework in digital signal processing (DSP), circuit design, embedded microcontrollers, control systems, and engineering mathematics.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Software Developer Vocational Certification',
      issuer: 'Sharif University Training Center (ACECR)',
      date: 'Certified',
    },
    {
      id: 'cert-2',
      name: 'Advanced Java Programming',
      issuer: 'ACECR Sharif',
      date: '2021',
    },
    {
      id: 'cert-3',
      name: 'Advanced C# / .NET Programming',
      issuer: 'ACECR Sharif',
      date: '2022',
    },
  ],
  languages: [
    { language: 'English', level: 'Professional Working Proficiency / Advanced' },
    { language: 'Persian (Farsi)', level: 'Native' },
    { language: 'Armenian', level: 'Basic / Conversational' },
  ],
  additionalSections: [
    {
      id: 'sec-strengths',
      title: 'Technical Strengths',
      content: '• Sensor fusion algorithms, real-time data stream processing, and 3D orientational visualization\n• Full-stack architectural design spanning robust backend microservices, clean REST/GraphQL APIs, and modern responsive front-ends\n• Strong algorithmic problem-solving, math-intensive software engineering, and performance optimization\n• Cross-platform desktop and mobile engineering (.NET MAUI, Avalonia UI, Flutter)\n• High adaptability to new frameworks, clean code standards, and agile engineering workflows',
      order: 1,
    },
    {
      id: 'sec-training',
      title: 'Professional Training',
      content: '• Software Developer Vocational Certification — ACECR Sharif University Training Center (Comprehensive full-stack software development curriculum covering algorithms, data structures, enterprise architecture, Java, and database engineering)\n• Advanced Java Programming — ACECR Sharif University Training Center (2021)\n• Advanced C# / .NET Programming — ACECR Sharif University Training Center (2022)',
      order: 2,
    },
    {
      id: 'sec-availability',
      title: 'Availability & Work Authorization',
      content: '• Full-time Remote (Flexible timezone overlap across Americas, Europe, and Asia)\n• Open to international relocation and contract / full-time employment',
      order: 3,
    },
    {
      id: 'sec-references',
      title: 'References',
      content: '• Professional references and code samples available upon request.',
      order: 4,
    },
  ],
  sectionOrder: [
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'languages',
    'additional',
  ],
  hiddenSections: [],
};

export const laraMullerSampleResume: Resume = {
  id: 'lara-muller-ux-designer',
  meta: {
    title: 'Lara Müller — UX UI Designer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['UX/UI Design', 'Plum Duotone', 'Portfolio'],
  },
  personal: {
    fullName: 'Lara Müller',
    headline: 'UX UI Designer',
    location: 'Berlin, Germany',
    email: 'lara.muller@email.com',
    phone: '+49 30 6824 5179',
    website: 'portfolio-laramueller.com',
    github: '',
    linkedin: 'linkedin.com/in/lara-mueller',
    photo: {
      dataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      shape: 'square',
    },
  },
  summary:
    'Passionate about creating accessible experiences that make technology easier to use.\n\nCreative UX UI Designer with 6+ years of experience designing intuitive digital products for web and mobile platforms. Strong background in user research, wireframing, prototyping, and translating business needs into engaging user experiences.\n\nRecognized for improving usability, collaborating closely with cross-functional teams, and delivering polished design systems at scale.',
  skills: [
    {
      category: 'Design & Prototyping Skills',
      items: [
        'Wireframing',
        'Prototyping',
        'Figma',
        'Adobe XD',
        'Usability Testing',
        'Responsive Design',
      ],
    },
  ],
  experience: [
    {
      id: 'exp-lara-1',
      jobTitle: 'UX UI Designer',
      company: 'Novera Digital',
      location: 'Berlin, Germany',
      startDate: '2022',
      endDate: 'Present',
      description: [
        'Lead end-to-end design for SaaS product features.',
        'Improved onboarding, increasing activation by 18%.',
        'Partner with developers to ensure design quality.',
      ],
    },
    {
      id: 'exp-lara-2',
      jobTitle: 'UI Designer',
      company: 'Brightlane Studio',
      location: 'Berlin, Germany',
      startDate: '2019',
      endDate: '2022',
      description: [
        'Created responsive interfaces for e-commerce clients.',
        'Conducted usability tests and prioritized improvements.',
        'Delivered prototypes for stakeholder reviews and launches.',
      ],
    },
    {
      id: 'exp-lara-3',
      jobTitle: 'Junior UX Designer',
      company: 'PixelHaus Agency',
      location: 'Hamburg, Germany',
      startDate: '2017',
      endDate: '2019',
      description: [
        'Supported research sessions and user journey mapping.',
        'Assisted in creating wireframes for client websites.',
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 'edu-lara-1',
      institution: 'University of Applied Sciences Europe',
      degree: 'Master of Arts in Interaction Design',
      dates: '2015 – 2017',
      location: 'Berlin, Germany',
      description: '',
    },
    {
      id: 'edu-lara-2',
      institution: 'Hochschule Hannover',
      degree: 'Bachelor of Arts in Communication Design',
      dates: '2011 – 2015',
      location: 'Hannover, Germany',
      description: '',
    },
  ],
  certifications: [
    {
      id: 'cert-lara-1',
      name: 'Google UX Design Professional Certificate',
      issuer: 'Google',
      date: 'Certified',
    },
    {
      id: 'cert-lara-2',
      name: 'Nielsen Norman Group UX Certification',
      issuer: 'Nielsen Norman Group',
      date: 'Certified',
    },
    {
      id: 'cert-lara-3',
      name: 'Adobe Certified Professional',
      issuer: 'Adobe',
      date: 'Certified',
    },
  ],
  languages: [
    { language: 'German', level: 'Native / 5' },
    { language: 'English', level: 'Advanced / 4' },
    { language: 'French', level: 'Intermediate / 3' },
  ],
  additionalSections: [],
  sectionOrder: [
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'languages',
  ],
  hiddenSections: [],
};

export const fakeTemplateResume: Resume = {
  id: 'new-resume-template',
  meta: {
    title: 'New Resume',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Draft'],
  },
  personal: {
    fullName: 'Alex Morgan',
    headline: 'Senior Software Engineer & Architect',
    location: 'San Francisco, CA (Open to Remote)',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    website: 'https://alexmorgan.dev',
    github: 'github.com/alexmorgan-demo',
    linkedin: 'linkedin.com/in/alexmorgan-demo',
  },
  summary:
    'Results-driven Software Engineer with 5+ years of experience designing scalable web applications and cloud architectures. Passionate about modern frontend frameworks, performant backend microservices, and user-centered design.',
  skills: [
    {
      category: 'Core Engineering',
      items: ['TypeScript', 'JavaScript (ES6+)', 'React', 'Node.js', 'Python', 'HTML5/CSS3'],
    },
    {
      category: 'Frameworks & Tools',
      items: ['Next.js', 'Tailwind CSS', 'Express.js', 'PostgreSQL', 'Docker', 'Git / GitHub'],
    },
  ],
  experience: [
    {
      id: 'fake-exp-1',
      jobTitle: 'Senior Full-Stack Engineer',
      company: 'Apex Tech Solutions',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      description: [
        'Architected and deployed responsive client-facing web portals serving 50k+ active monthly users.',
        'Optimized RESTful API endpoints and database queries, reducing average latency by 35%.',
        'Mentored junior developers and instituted code review standards across a team of 8 engineers.',
      ],
    },
    {
      id: 'fake-exp-2',
      jobTitle: 'Software Developer',
      company: 'Vanguard Innovations',
      location: 'Austin, TX',
      startDate: '2019',
      endDate: '2022',
      description: [
        'Built interactive dashboard analytics components using React, Redux, and Tailwind CSS.',
        'Collaborated with product designers and backend engineers to launch key subscription features on schedule.',
      ],
    },
  ],
  projects: [
    {
      id: 'fake-proj-1',
      name: 'CloudMetrics Dashboard',
      description: 'Real-time infrastructure monitoring application with custom visual graphs and alert management.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      url: 'https://github.com/example/cloudmetrics',
    },
  ],
  education: [
    {
      id: 'fake-edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      dates: '2015 – 2019',
      description: 'Graduated with Honors. Focus on Algorithms, Operating Systems, and Web Technologies.',
    },
  ],
  certifications: [
    {
      id: 'fake-cert-1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  languages: [
    { language: 'English', level: 'Native / Fluent' },
    { language: 'Spanish', level: 'Intermediate' },
  ],
  additionalSections: [],
  sectionOrder: [
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'languages',
  ],
  hiddenSections: [],
};

