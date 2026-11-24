import type { Alumnus, Opportunity } from '../types';
import priyaAvatar from '../assets/images/alumni_priya_sharma_1792235141584.jpg';
import rohitAvatar from '../assets/images/alumni_rohit_verma_1792235142992.jpg';
import ananyaAvatar from '../assets/images/alumni_ananya_das_1792235143468.jpg';
import kabirAvatar from '../assets/images/alumni_kabir_mehta_1792235143607.jpg';
import heroCampusImage from '../assets/images/hero_campus.jpg';

export const HERO_CAMPUS_IMAGE = heroCampusImage;

export const DEMO_ALUMNI: Alumnus[] = [
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    avatar: priyaAvatar,
    role: 'Staff Software Engineer',
    company: 'Google',
    department: 'CSE',
    degree: 'B.Tech in Computer Science & Engineering',
    batchYear: 2018,
    location: 'Mountain View, CA / Hybrid',
    skills: ['Distributed Systems', 'Go', 'Kubernetes', 'Cloud Infrastructure', 'System Design', 'gRPC'],
    mentorshipTopics: ['System Design Prep', 'Transition to Big Tech', 'Navigating Staff+ Roles', 'Resume Review'],
    bio: 'Staff SWE at Google Core Systems. Previously at AWS and Microsoft. Active mentor for GLA University students pursuing distributed systems and high-scale backend engineering.',
    experienceYears: 8,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2024', title: 'Staff Software Engineer', organization: 'Google Cloud Infrastructure' },
      { year: '2021', title: 'Senior Software Engineer', organization: 'AWS Database Services' },
      { year: '2018', title: 'Software Engineer', organization: 'Microsoft Azure' },
      { year: '2018', title: 'B.Tech Graduate (Gold Medalist)', organization: 'GLA University' }
    ],
    adviceSnippet: 'Focus deeply on first principles in systems. A clean grasp of network protocols and concurrency models pays dividends for a decade.',
    matchScore: 98,
    matchReasons: ['Target company: Google', 'Domain: Distributed Systems & Backend', 'Offers 1-on-1 System Design prep'],
    featuredInHero: true
  },
  {
    id: 'rohit-verma',
    name: 'Dr. Rohit Verma',
    avatar: rohitAvatar,
    role: 'Staff Research Scientist',
    company: 'DeepMind',
    department: 'CSAM',
    degree: 'Ph.D. & B.Tech in CS & Applied Mathematics',
    batchYear: 2017,
    location: 'London, UK',
    skills: ['Deep Learning', 'PyTorch', 'Reinforcement Learning', 'Applied Math', 'Optimization', 'LLM Architectures'],
    mentorshipTopics: ['PhD Applications & Fellowships', 'AI Research Methodologies', 'Publishing at NeurIPS/ICLR', 'Math for ML'],
    bio: 'Conducting frontier research at DeepMind on multi-modal reasoning and RLHF. Published 14+ papers at NeurIPS, ICML, and CVPR. Passionate about guiding aspiring GLA University researchers.',
    experienceYears: 9,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2023', title: 'Staff Research Scientist', organization: 'Google DeepMind' },
      { year: '2020', title: 'Postdoctoral Fellow', organization: 'Oxford Applied Math' },
      { year: '2017', title: 'Ph.D. in CS & Applied Mathematics', organization: 'GLA University' }
    ],
    adviceSnippet: 'Great research begins by identifying high-leverage bottlenecks that others dismiss as trivial. Master the underlying linear algebra.',
    matchScore: 94,
    matchReasons: ['Domain: AI Research & Optimization', 'Ph.D. Guidance & Academic Publications', 'CSAM Foundation'],
    featuredInHero: true
  },
  {
    id: 'ananya-das',
    name: 'Ananya Das',
    avatar: ananyaAvatar,
    role: 'Principal Product Designer',
    company: 'Figma',
    department: 'HCD',
    degree: 'B.Tech in Computer Science & Design',
    batchYear: 2020,
    location: 'San Francisco, CA',
    skills: ['Design Systems', 'Figma Prototyping', 'User Research', 'Design Systems Architecture', 'Interaction Design', 'UI/UX'],
    mentorshipTopics: ['Portfolio Critique', 'UX Case Study Storytelling', 'Transitioning from Engineering to Design', 'Design Systems'],
    bio: 'Leading collaboration canvas tools at Figma. Former design lead at Stripe and Razorpay. Bridge between deep technical engineering constraints and empathetic human interface craft.',
    experienceYears: 6,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2024', title: 'Principal Product Designer', organization: 'Figma Canvas Team' },
      { year: '2022', title: 'Staff Designer', organization: 'Stripe Billing' },
      { year: '2020', title: 'Product Designer', organization: 'Razorpay Design' },
      { year: '2020', title: 'B.Tech CS & Design', organization: 'GLA University' }
    ],
    adviceSnippet: 'Your design portfolio should not be a gallery of pretty mockups—it must clearly articulate the trade-offs and behavioral hypotheses you tested.',
    matchScore: 91,
    matchReasons: ['HCD / Design specialization', 'Design Systems leadership', 'Portfolio critique availability'],
    featuredInHero: true
  },
  {
    id: 'kabir-mehta',
    name: 'Kabir Mehta',
    avatar: kabirAvatar,
    role: 'Co-Founder & CEO',
    company: 'Synthetix AI (Y Combinator S22)',
    department: 'ECE',
    degree: 'B.Tech in Electronics & Communication',
    batchYear: 2016,
    location: 'Bengaluru / San Francisco',
    skills: ['Startup Fundraising', 'Product Market Fit', 'Embedded AI', 'Edge Computing', 'B2B SaaS', 'Team Building'],
    mentorshipTopics: ['Early-Stage Founder Strategy', 'Applying to Y Combinator', 'Hardware-Software Product Strategy', 'Angel Investment'],
    bio: 'Serial entrepreneur and hardware-software hacker. Built Synthetix AI after 4 years at NVIDIA Embedded Systems. Raised $14M Series A from top Silicon Valley venture funds.',
    experienceYears: 10,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2022', title: 'Founder & CEO', organization: 'Synthetix AI (YC S22)' },
      { year: '2019', title: 'Senior Firmware & Edge AI Lead', organization: 'NVIDIA Jetson Team' },
      { year: '2016', title: 'Systems Engineer', organization: 'Texas Instruments' },
      { year: '2016', title: 'B.Tech ECE', organization: 'GLA University' }
    ],
    adviceSnippet: 'Talk to real customers from week one. Technical perfection is useless if you are solving an issue that nobody is willing to write a cheque for.',
    matchScore: 92,
    matchReasons: ['Venture founder experience', 'ECE to Tech Entrepreneurship pathway', 'Y Combinator mentorship'],
    featuredInHero: true
  },
  {
    id: 'tanvi-rao',
    name: 'Dr. Tanvi Rao',
    avatar: priyaAvatar, // fallback / high-res portrait
    role: 'Senior Computational Biologist',
    company: 'Genentech / Roche',
    department: 'CB',
    degree: 'M.Tech & Ph.D. in Computational Biology',
    batchYear: 2019,
    location: 'South San Francisco, CA',
    skills: ['Bioinformatics', 'Genomics', 'Structural Biology', 'Python', 'Nextflow', 'AlphaFold Workflows'],
    mentorshipTopics: ['Biotech Careers', 'Computational Biology Grad Admissions', 'Protein Structure ML', 'Cross-disciplinary Research'],
    bio: 'Pioneering structural drug discovery pipelines with machine learning at Genentech. Specializes in translating biological sequence data into target therapeutics.',
    experienceYears: 7,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2023', title: 'Senior Scientist', organization: 'Genentech' },
      { year: '2021', title: 'Postdoctoral Fellow', organization: 'Stanford Department of Bioengineering' },
      { year: '2019', title: 'M.Tech / Ph.D. Computational Biology', organization: 'GLA University' }
    ],
    adviceSnippet: 'The intersection of computational modeling and molecular medicine is one of the most intellectually rewarding fields in modern science.',
    matchScore: 89,
    matchReasons: ['Department: Computational Biology', 'Biotech industry insight', 'Graduate admissions mentorship'],
    featuredInHero: false
  },
  {
    id: 'aditya-nair',
    name: 'Aditya Nair',
    avatar: rohitAvatar,
    role: 'Staff Autopilot Hardware Engineer',
    company: 'Tesla',
    department: 'ECE',
    degree: 'B.Tech in Electronics & Communication',
    batchYear: 2019,
    location: 'Palo Alto, CA',
    skills: ['VLSI', 'Verilog', 'FPGA', 'Computer Architecture', 'Autonomous Sensors', 'Embedded Systems'],
    mentorshipTopics: ['Silicon & Semiconductor Roles', 'Mastering Hardware Engineering', 'US Master’s Applications', 'Embedded Interviews'],
    bio: 'Designing next-generation silicon acceleration modules for Tesla Full Self-Driving hardware. Passionate about physical hardware design and low-level computer architecture.',
    experienceYears: 7,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2023', title: 'Staff Hardware Engineer', organization: 'Tesla Autopilot HW' },
      { year: '2021', title: 'Silicon Design Engineer', organization: 'Apple Silicon Architecture' },
      { year: '2019', title: 'B.Tech in Electronics & Communication', organization: 'GLA University' }
    ],
    adviceSnippet: 'Never treat hardware like an abstraction. The physical constraints of silicon and thermal dissipation are where the most fascinating breakthroughs happen.',
    matchScore: 88,
    matchReasons: ['Hardware & Silicon engineering', 'Tesla & Apple industry experience', 'ECE core alumni network'],
    featuredInHero: false
  },
  {
    id: 'vikram-choudhary',
    name: 'Vikramaditya Choudhary',
    avatar: kabirAvatar,
    role: 'Quantitative Researcher',
    company: 'WorldQuant / Citadel Securities',
    department: 'CSAM',
    degree: 'B.Tech in CS & Applied Mathematics',
    batchYear: 2021,
    location: 'Singapore',
    skills: ['Stochastic Calculus', 'C++', 'Algorithmic Trading', 'Time Series Forecasting', 'Statistical Arbitrage', 'Python'],
    mentorshipTopics: ['Quant Finance Recruitment', 'Mathematical Modeling Interviews', 'Low-Latency C++', 'Derivatives Math'],
    bio: 'Developing predictive alphas and market-making strategies for global equities. Combines rigorous applied mathematical theory with low-latency algorithmic execution.',
    experienceYears: 5,
    availableForMentorship: false,
    pastMilestones: [
      { year: '2024', title: 'Quantitative Researcher', organization: 'WorldQuant' },
      { year: '2021', title: 'Quantitative Analyst', organization: 'Nomura Global Markets' },
      { year: '2021', title: 'B.Tech in CSAM', organization: 'GLA University' }
    ],
    adviceSnippet: 'Quantitative trading requires uncompromising rigor. Probability theory and statistical estimation must feel as natural to you as basic arithmetic.',
    matchScore: 87,
    matchReasons: ['CSAM / Quantitative Finance', 'Global financial markets expertise', 'Interview question breakdowns'],
    featuredInHero: false
  },
  {
    id: 'meera-sen',
    name: 'Meera Sen',
    avatar: ananyaAvatar,
    role: 'Senior Product Manager',
    company: 'Microsoft',
    department: 'CSE',
    degree: 'B.Tech in Computer Science',
    batchYear: 2017,
    location: 'Hyderabad, India',
    skills: ['Product Strategy', 'Developer Platforms', 'Data Analytics', 'Roadmapping', 'Agile Leadership', 'Enterprise SaaS'],
    mentorshipTopics: ['Transitioning from SWE to PM', 'Product Sense Interviews', 'Leading Without Authority', 'B2B Roadmaps'],
    bio: 'Product lead for Microsoft Azure Developer Tooling. Works at the intersection of developer experience, enterprise telemetry, and developer productivity.',
    experienceYears: 9,
    availableForMentorship: true,
    pastMilestones: [
      { year: '2022', title: 'Senior Product Manager', organization: 'Microsoft Azure Developer Platforms' },
      { year: '2019', title: 'Product Manager', organization: 'Adobe Cloud Systems' },
      { year: '2017', title: 'Software Engineer', organization: 'Oracle India' },
      { year: '2017', title: 'B.Tech CSE', organization: 'GLA University' }
    ],
    adviceSnippet: 'The best product managers are not idea generators—they are rigorous clarifiers of ambiguity who align cross-functional teams toward measurable user value.',
    matchScore: 85,
    matchReasons: ['Product Management path', 'Microsoft Azure leadership', 'SWE to PM career transitions'],
    featuredInHero: false
  }
];

export const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Distributed Systems Software Engineer Intern (Summer 2027)',
    company: 'Google Cloud',
    type: 'Internship',
    department: 'CSE / CSAM',
    location: 'Bengaluru / Hyderabad',
    compensation: '₹1,40,000 / month + housing support',
    deadline: 'Nov 30, 2026',
    postedByAlumniName: 'Priya Sharma',
    postedByAlumniBatch: 'CSE 2018',
    skills: ['Distributed Systems', 'Go', 'Kubernetes', 'Algorithms'],
    description: 'Work with the Google Cloud Storage team designing multi-region consensus primitives and low-latency blob storage engines. Alumnus Priya Sharma provides internal referral support for short-listed GLA University candidates.'
  },
  {
    id: 'opp-2',
    title: 'Research Scientist Fellowship in Foundation Models',
    company: 'Google DeepMind',
    type: 'Research',
    department: 'CSAM / CSE',
    location: 'London, UK / Hybrid',
    compensation: '£78,000 / year + research allowance',
    deadline: 'Dec 15, 2026',
    postedByAlumniName: 'Dr. Rohit Verma',
    postedByAlumniBatch: 'CSAM 2017',
    skills: ['PyTorch', 'Reinforcement Learning', 'Applied Math', 'Transformers'],
    description: 'Join a frontier research pod investigating long-horizon reasoning and reinforcement learning from human feedback. Candidates with strong mathematical grounding from GLA University are strongly encouraged to apply.'
  },
  {
    id: 'opp-3',
    title: 'Product Design Intern — Canvas & Interaction',
    company: 'Figma',
    type: 'Internship',
    department: 'HCD',
    location: 'Remote / San Francisco',
    compensation: '$52 / hour + hardware stipend',
    deadline: 'Dec 05, 2026',
    postedByAlumniName: 'Ananya Das',
    postedByAlumniBatch: 'HCD 2020',
    skills: ['Figma Prototyping', 'Design Systems', 'User Research', 'Design Systems Architecture'],
    description: 'Help craft the next generation of collaborative canvas tools. Looking for students with high craft fidelity, systems thinking, and an understanding of front-end constraints.'
  },
  {
    id: 'opp-4',
    title: 'Founding Silicon & FPGA Acceleration Engineer',
    company: 'Synthetix AI (YC S22)',
    type: 'Full-Time',
    department: 'ECE / CSE',
    location: 'Bengaluru, India',
    compensation: '₹32 - 45 LPA + 0.75% Equity',
    deadline: 'Rolling / Priority for GLA University',
    postedByAlumniName: 'Kabir Mehta',
    postedByAlumniBatch: 'ECE 2016',
    skills: ['Verilog', 'FPGA', 'Embedded C', 'Hardware-Software Co-Design'],
    description: 'Build edge-inference hardware acceleration for autonomous robotics and vision. Work directly with Y Combinator alumni founders in our Bengaluru R&D lab.'
  },
  {
    id: 'opp-5',
    title: 'Computational Biology Research Assistant (Structural Genomics)',
    company: 'Genentech Biomolecular Discovery Lab',
    type: 'Research',
    department: 'CB',
    location: 'South San Francisco, CA / Remote Cohort',
    compensation: '$4,800 / month',
    deadline: 'Jan 10, 2027',
    postedByAlumniName: 'Dr. Tanvi Rao',
    postedByAlumniBatch: 'CB 2019',
    skills: ['Bioinformatics', 'Structural Biology', 'AlphaFold Workflows', 'Python'],
    description: 'Collaborate with scientists analyzing deep learning predictions of multi-protein complex docking for oncology target discovery.'
  },
  {
    id: 'opp-6',
    title: 'Winter Mentorship Cohort: High-Frequency Trading & Systems',
    company: 'WorldQuant Alumni Syndicate',
    type: 'Mentorship Cohort',
    department: 'CSAM / CSE',
    location: 'Virtual / Weekly Sessions',
    compensation: 'Free Student Cohort (Sponsored by Alumni)',
    deadline: 'Nov 18, 2026',
    postedByAlumniName: 'Vikramaditya Choudhary',
    postedByAlumniBatch: 'CSAM 2021',
    skills: ['C++', 'Stochastic Calculus', 'Probability Theory', 'Data Structures'],
    description: 'An intensive 6-week mentorship track reviewing statistical arbitrage, stochastic processes, and practical low-latency C++ interview questions.'
  }
];

export const NETWORK_NODES = [
  { id: 'glau', label: 'GLA University', type: 'hub', x: 450, y: 220, color: '#F5F5F7', radius: 24, info: 'Alma Mater Central Hub · 5 Academic Branches' },
  { id: 'cse', label: 'CSE Department', type: 'dept', x: 280, y: 130, color: '#9FA6B2', radius: 18, info: 'Computer Science & Engineering · 1,200+ Alumni' },
  { id: 'csam', label: 'CSAM Department', type: 'dept', x: 620, y: 130, color: '#9FA6B2', radius: 18, info: 'CS & Applied Mathematics · High-Rigor Research & Quant' },
  { id: 'ece', label: 'ECE Department', type: 'dept', x: 260, y: 310, color: '#9FA6B2', radius: 18, info: 'Electronics & Communication · Silicon, Robotics, Edge AI' },
  { id: 'hcd', label: 'HCD Department', type: 'dept', x: 640, y: 310, color: '#9FA6B2', radius: 18, info: 'Human-Centered Design · Product Craft & Systems' },
  { id: 'cb', label: 'CB Department', type: 'dept', x: 450, y: 70, color: '#9FA6B2', radius: 18, info: 'Computational Biology · Genomics & Molecular AI' },

  // Alumni Nodes
  { id: 'alumni-priya', label: 'Priya Sharma (Google)', type: 'alumni', x: 140, y: 80, color: '#E4E7EE', radius: 14, info: 'Staff SWE @ Google · GLAU CSE 2018' },
  { id: 'alumni-rohit', label: 'Dr. Rohit Verma (DeepMind)', type: 'alumni', x: 760, y: 80, color: '#E4E7EE', radius: 14, info: 'Staff Scientist @ DeepMind · GLAU CSAM 2017' },
  { id: 'alumni-ananya', label: 'Ananya Das (Figma)', type: 'alumni', x: 770, y: 360, color: '#E4E7EE', radius: 14, info: 'Principal Designer @ Figma · GLAU HCD 2020' },
  { id: 'alumni-kabir', label: 'Kabir Mehta (Synthetix)', type: 'alumni', x: 130, y: 360, color: '#E4E7EE', radius: 14, info: 'Founder & CEO @ Synthetix AI · GLAU ECE 2016' },
  { id: 'alumni-tanvi', label: 'Dr. Tanvi Rao (Genentech)', type: 'alumni', x: 450, y: 20, color: '#E4E7EE', radius: 14, info: 'Senior Scientist @ Genentech · GLAU CB 2019' },

  // Company & Destination Nodes
  { id: 'comp-google', label: 'Google / DeepMind', type: 'company', x: 80, y: 190, color: '#64748B', radius: 16, info: 'Top destination for GLA University Distributed Systems & AI' },
  { id: 'comp-silicon', label: 'Silicon Valley Startups', type: 'company', x: 220, y: 440, color: '#64748B', radius: 16, info: 'YC alumni founders and early-stage venture leaders' },
  { id: 'comp-figma', label: 'Figma & Design Studios', type: 'company', x: 820, y: 240, color: '#64748B', radius: 16, info: 'Product design & design systems leaders' },
  { id: 'comp-quant', label: 'WorldQuant & Trading', type: 'company', x: 680, y: 440, color: '#64748B', radius: 16, info: 'Quantitative research & high frequency trading' }
];

export const NETWORK_EDGES = [
  { source: 'glau', target: 'cse' },
  { source: 'glau', target: 'csam' },
  { source: 'glau', target: 'ece' },
  { source: 'glau', target: 'hcd' },
  { source: 'glau', target: 'cb' },

  { source: 'cse', target: 'alumni-priya' },
  { source: 'csam', target: 'alumni-rohit' },
  { source: 'hcd', target: 'alumni-ananya' },
  { source: 'ece', target: 'alumni-kabir' },
  { source: 'cb', target: 'alumni-tanvi' },

  { source: 'alumni-priya', target: 'comp-google' },
  { source: 'alumni-rohit', target: 'comp-google' },
  { source: 'alumni-kabir', target: 'comp-silicon' },
  { source: 'alumni-ananya', target: 'comp-figma' },
  { source: 'csam', target: 'comp-quant' },
  { source: 'ece', target: 'comp-silicon' }
];
