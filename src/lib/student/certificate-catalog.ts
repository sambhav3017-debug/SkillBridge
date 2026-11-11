import type { GlobalCertificate } from "./certificate-types";

export const GLOBAL_CERTIFICATES: GlobalCertificate[] = [
  // AI & Machine Learning
  {
    id: "deeplearning-ml-specialization",
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI & Stanford Online",
    platform: "Coursera",
    badgeType: "Specialization Certificate",
    domain: "AI & Machine Learning",
    difficulty: "Beginner",
    duration: "3 months (9 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / $49/mo with Coursera Plus",
    rating: 4.9,
    reviewsCount: 18500,
    enrolledStudentsCount: "680K+ enrolled",
    badgeAccentColor: "from-blue-600 to-indigo-600",
    skillsCovered: ["Supervised Learning", "Neural Networks", "Logistic Regression", "Decision Trees", "Unsupervised Learning", "Recommender Systems"],
    careerRelevance: ["Machine Learning Engineer", "AI Researcher", "Data Scientist"],
    resumeValueBullets: [
      "Mastered foundational ML algorithms under Andrew Ng with hands-on NumPy and Scikit-Learn implementations",
      "Engineered multi-class classification and gradient boosting pipelines for real-world predictive datasets"
    ],
    officialUrl: "https://www.coursera.org/specializations/machine-learning-introduction",
    isPopular: true,
    isFree: false,
    syllabus: [
      { title: "Supervised Machine Learning: Regression and Classification", duration: "3 weeks", description: "Linear regression, gradient descent, logistic regression, and cost function minimization." },
      { title: "Advanced Learning Algorithms", duration: "4 weeks", description: "Multi-layer perceptrons, TensorFlow implementations, decision trees, random forests, and XGBoost." },
      { title: "Unsupervised Learning, Recommenders, Reinforcement Learning", duration: "3 weeks", description: "K-means clustering, anomaly detection, PCA, and collaborative filtering systems." }
    ]
  },
  {
    id: "deeplearning-deep-learning-specialization",
    title: "Deep Learning Specialization",
    issuer: "DeepLearning.AI",
    platform: "Coursera",
    badgeType: "Specialization Certificate",
    domain: "AI & Machine Learning",
    difficulty: "Intermediate",
    duration: "4 months (8 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.9,
    reviewsCount: 134000,
    enrolledStudentsCount: "1.2M+ enrolled",
    badgeAccentColor: "from-purple-600 to-indigo-700",
    skillsCovered: ["Deep Neural Networks", "Backpropagation", "CNNs", "RNNs", "Transformers", "Hyperparameter Tuning"],
    careerRelevance: ["Deep Learning Engineer", "Computer Vision Specialist", "NLP Engineer"],
    resumeValueBullets: [
      "Built and trained complex CNN and Transformer architectures using TensorFlow and Keras",
      "Formulated optimization strategies including Adam, batch normalization, and dropout regularization"
    ],
    officialUrl: "https://www.coursera.org/specializations/deep-learning",
    isPopular: true,
    syllabus: [
      { title: "Neural Networks and Deep Learning", duration: "4 weeks", description: "Vectorized forward propagation and mathematical backpropagation from scratch in Python." },
      { title: "Improving Deep Neural Networks: Hyperparameter Tuning, Regularization", duration: "3 weeks", description: "Weight initialization, L2 regularization, RMSprop, Adam, and gradient checking." },
      { title: "Structuring Machine Learning Projects", duration: "2 weeks", description: "Error analysis, train/dev/test distributions, and transfer learning workflows." },
      { title: "Convolutional Neural Networks", duration: "4 weeks", description: "Residual networks (ResNets), YOLO object detection, neural style transfer." },
      { title: "Sequence Models & Attention", duration: "4 weeks", description: "LSTMs, GRUs, Beam Search, Attention mechanism, and Transformer self-attention." }
    ]
  },
  {
    id: "google-cloud-genai-learning-path",
    title: "Generative AI Fundamentals Skill Badge",
    issuer: "Google Cloud",
    platform: "Google Cloud Skills Boost",
    badgeType: "Skill Badge",
    domain: "AI & Machine Learning",
    difficulty: "Beginner",
    duration: "2 weeks (3 hrs/week)",
    pricing: "Free",
    priceDetail: "100% Free on Google Cloud Skills Boost",
    rating: 4.8,
    reviewsCount: 39000,
    enrolledStudentsCount: "420K+ completed",
    badgeAccentColor: "from-blue-500 to-emerald-500",
    skillsCovered: ["Large Language Models", "Attention Mechanism", "Generative AI", "Responsible AI", "Prompt Engineering"],
    careerRelevance: ["Generative AI Engineer", "AI Solutions Architect", "Full Stack AI Developer"],
    resumeValueBullets: [
      "Earned official Google Cloud verifiable digital badge covering Transformer attention and prompt design principles",
      "Demonstrated core competency in deploying foundation models on Vertex AI and evaluating safety guardrails"
    ],
    officialUrl: "https://www.cloudskillsboost.google/course_templates/556",
    isPopular: true,
    isFree: true,
    syllabus: [
      { title: "Introduction to Generative AI", duration: "1 day", description: "What Generative AI is, how it is used, and how it differs from traditional machine learning methods." },
      { title: "Introduction to Large Language Models", duration: "1 day", description: "What LLMs are, the use cases where they can be applied, and how prompt tuning works." },
      { title: "Introduction to Responsible AI", duration: "1 day", description: "Understanding Google's 7 AI principles and how to implement ethical AI governance." }
    ]
  },
  {
    id: "nvidia-fundamentals-deep-learning",
    title: "Fundamentals of Deep Learning Certificate",
    issuer: "NVIDIA Deep Learning Institute (DLI)",
    platform: "NVIDIA",
    badgeType: "Vendor Certification",
    domain: "AI & Machine Learning",
    difficulty: "Intermediate",
    duration: "1 day (8 hours)",
    pricing: "Paid",
    priceDetail: "$90 USD / Free for eligible academic students",
    rating: 4.8,
    reviewsCount: 8200,
    enrolledStudentsCount: "95K+ engineers",
    badgeAccentColor: "from-emerald-600 to-green-700",
    skillsCovered: ["PyTorch", "GPU Acceleration", "Computer Vision", "Natural Language Processing", "Transfer Learning"],
    careerRelevance: ["HPC Engineer", "Computer Vision Specialist", "AI Systems Engineer"],
    resumeValueBullets: [
      "Trained GPU-accelerated neural networks on cloud-based NVIDIA DGX systems using PyTorch",
      "Engineered automated pipelines for end-to-end dataset preprocessing, transfer learning, and production inference"
    ],
    officialUrl: "https://www.nvidia.com/en-us/training/instructor-led-workshops/fundamentals-of-deep-learning/",
    syllabus: [
      { title: "Accelerating Neural Network Training with CUDA", duration: "3 hours", description: "Deploying high-throughput deep models on NVIDIA Tensor Core GPUs." },
      { title: "Advanced Computer Vision with Pre-trained Models", duration: "3 hours", description: "Fine-tuning ResNet backbones and evaluating mAP across dense image sets." },
      { title: "Assessment and Certification Lab", duration: "2 hours", description: "Independent hands-on GPU coding challenge required to earn the accredited NVIDIA certificate." }
    ]
  },

  // Data Science & Analytics
  {
    id: "google-data-analytics-cert",
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Data Science & Analytics",
    difficulty: "Beginner",
    duration: "6 months (10 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.8,
    reviewsCount: 148000,
    enrolledStudentsCount: "2.1M+ enrolled",
    badgeAccentColor: "from-amber-500 to-red-500",
    skillsCovered: ["SQL Queries", "Spreadsheets", "Data Cleaning", "Tableau Visualizations", "R Programming", "Metadata Analysis"],
    careerRelevance: ["Junior Data Analyst", "Business Intelligence Associate", "Operations Analyst"],
    resumeValueBullets: [
      "Completed rigorous 8-course Google program covering SQL data extraction, cleansing, and validation",
      "Created interactive executive Tableau dashboards and reproducible R Markdown analytics reports"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/google-data-analytics",
    isPopular: true,
    syllabus: [
      { title: "Foundations: Data, Data, Everywhere", duration: "3 weeks", description: "Data ecosystems, analytical thinking, metrics, and tools used by professional analysts." },
      { title: "Ask Questions to Make Data-Driven Decisions", duration: "3 weeks", description: "Problem scoping, stakeholder management, and spreadsheet modeling." },
      { title: "Prepare Data for Exploration", duration: "4 weeks", description: "Data types, structures, bias prevention, database normalization, and SQL basics." },
      { title: "Process Data from Dirty to Clean", duration: "4 weeks", description: "Integrity validation, SQL transformations (JOIN, CASE, CTE), and data verification." },
      { title: "Analyze Data to Answer Questions", duration: "4 weeks", description: "Aggregations, subqueries, and statistical summaries for business problem solving." },
      { title: "Share Data Through the Art of Visualization", duration: "4 weeks", description: "Design principles, Tableau stories, and dashboard delivery." }
    ]
  },
  {
    id: "ibm-data-science-professional-cert",
    title: "IBM Data Science Professional Certificate",
    issuer: "IBM",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Data Science & Analytics",
    difficulty: "Beginner",
    duration: "5 months (10 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Free IBM SkillsBuild track",
    rating: 4.7,
    reviewsCount: 68000,
    enrolledStudentsCount: "1.4M+ enrolled",
    badgeAccentColor: "from-blue-700 to-cyan-600",
    skillsCovered: ["Python", "Pandas", "NumPy", "SQL", "Scikit-Learn", "Matplotlib", "Jupyter Notebooks", "Machine Learning"],
    careerRelevance: ["Data Scientist", "Data Analyst", "Machine Learning Associate"],
    resumeValueBullets: [
      "Applied Python scientific stack (Pandas, NumPy, Scikit-Learn) to build predictive classification models",
      "Developed end-to-end Capstone project analyzing SpaceX Falcon 9 first stage landing predictions"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/ibm-data-science",
    isPopular: true,
    syllabus: [
      { title: "What is Data Science?", duration: "2 weeks", description: "Data science in business, methodologies, and cognitive computing concepts." },
      { title: "Tools for Data Science", duration: "3 weeks", description: "JupyterLab, Git, GitHub, RStudio, and IBM Watson Studio setup." },
      { title: "Python for Data Science, AI & Development", duration: "4 weeks", description: "Python data structures, file I/O, Pandas dataframes, and REST API calls." },
      { title: "Databases and SQL for Data Science with Python", duration: "4 weeks", description: "Relational database querying, working with real datasets in Cloud SQL." },
      { title: "Data Visualization with Python", duration: "3 weeks", description: "Matplotlib, Seaborn, Folium maps, and Dash web applications." },
      { title: "Machine Learning with Python", duration: "5 weeks", description: "Regression, classification, clustering, recommendation engines, and model evaluation." }
    ]
  },
  {
    id: "datacamp-data-analyst-associate",
    title: "Data Analyst Associate Certification (DAAC)",
    issuer: "DataCamp",
    platform: "DataCamp",
    badgeType: "Vendor Certification",
    domain: "Data Science & Analytics",
    difficulty: "Intermediate",
    duration: "2 months (6 hrs/week)",
    pricing: "Paid",
    priceDetail: "Included in DataCamp Premium ($25/mo)",
    rating: 4.8,
    reviewsCount: 12500,
    enrolledStudentsCount: "110K+ certified",
    badgeAccentColor: "from-emerald-500 to-teal-600",
    skillsCovered: ["Exploratory Data Analysis", "Statistical Hypothesis Testing", "SQL Aggregations", "Business Analytics"],
    careerRelevance: ["Data Analyst", "Analytics Engineer", "Product Analyst"],
    resumeValueBullets: [
      "Passed rigorous timed practical SQL exam and peer-reviewed business analysis case study",
      "Performed statistical hypothesis tests and customer cohort retention analysis"
    ],
    officialUrl: "https://www.datacamp.com/certification/data-analyst",
    syllabus: [
      { title: "Data Management in SQL", duration: "2 weeks", description: "Writing performant queries with window functions and multi-table joins." },
      { title: "Exploratory Analysis & Visualization", duration: "3 weeks", description: "Distributions, correlations, identifying outliers, and narrative chart creation." },
      { title: "Statistical Experimentation & Testing", duration: "2 weeks", description: "A/B test design, p-values, confidence intervals, and power analysis." }
    ]
  },

  // Web Development
  {
    id: "meta-frontend-developer-cert",
    title: "Meta Front-End Developer Professional Certificate",
    issuer: "Meta",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Web Development",
    difficulty: "Beginner",
    duration: "7 months (6 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.7,
    reviewsCount: 31000,
    enrolledStudentsCount: "480K+ enrolled",
    badgeAccentColor: "from-blue-600 to-sky-500",
    skillsCovered: ["React.js", "JavaScript (ES6+)", "CSS3 & Responsive UI", "Version Control (Git)", "Jest Unit Testing", "UX Design Principles"],
    careerRelevance: ["Front-End Engineer", "React Developer", "UI Software Engineer"],
    resumeValueBullets: [
      "Built multi-page responsive single-page applications utilizing React hooks, state management, and semantic HTML5",
      "Authored automated unit test suites using Jest and React Testing Library to guarantee component reliability"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
    isPopular: true,
    syllabus: [
      { title: "Introduction to Front-End Development", duration: "3 weeks", description: "Core web protocols, DOM anatomy, HTML tags, and modern CSS layout." },
      { title: "Programming with JavaScript", duration: "4 weeks", description: "Data types, functional programming, OOP, JSON, and asynchronous fetch APIs." },
      { title: "Version Control with Git", duration: "3 weeks", description: "Git CLI commands, branching strategies, merge conflicts, and GitHub workflows." },
      { title: "HTML and CSS in Depth", duration: "4 weeks", description: "Flexbox, CSS Grid, media queries, CSS variables, and accessibility (a11y) standards." },
      { title: "React Basics", duration: "4 weeks", description: "JSX, components, props, state, event handling, and conditional rendering." },
      { title: "Advanced React", duration: "4 weeks", description: "Custom hooks, context API, useReducer, client-side routing, and Jest testing." }
    ]
  },
  {
    id: "meta-backend-developer-cert",
    title: "Meta Back-End Developer Professional Certificate",
    issuer: "Meta",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Web Development",
    difficulty: "Intermediate",
    duration: "8 months (6 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.7,
    reviewsCount: 22000,
    enrolledStudentsCount: "310K+ enrolled",
    badgeAccentColor: "from-indigo-600 to-violet-700",
    skillsCovered: ["Python", "Django", "REST APIs", "MySQL", "Database Normalization", "Docker Basics", "Authentication"],
    careerRelevance: ["Back-End Engineer", "API Developer", "Full Stack Developer"],
    resumeValueBullets: [
      "Engineered secure, JWT-authenticated REST APIs using Django REST Framework and relational MySQL databases",
      "Designed normalized database schemas with optimized foreign key relationships and index structures"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/meta-back-end-developer",
    syllabus: [
      { title: "Introduction to Back-End Development", duration: "3 weeks", description: "Client-server architecture, HTTP headers, status codes, and server environments." },
      { title: "Python Programming Foundations", duration: "4 weeks", description: "OOP, modular design, exception handling, and automated unit testing." },
      { title: "Version Control & Git", duration: "3 weeks", description: "Branch management, pull requests, and CI/CD basics." },
      { title: "Databases & SQL in Django", duration: "5 weeks", description: "SQL querying, schema design, Django ORM models, and database migrations." },
      { title: "Django Web Framework", duration: "5 weeks", description: "Views, URL routing, template rendering, and form validation." },
      { title: "APIs & Web Services", duration: "4 weeks", description: "RESTful architecture, serializers, viewsets, authentication tokens, and rate limiting." }
    ]
  },
  {
    id: "freecodecamp-full-stack",
    title: "Full Stack Developer Certification",
    issuer: "freeCodeCamp",
    platform: "freeCodeCamp",
    badgeType: "Course Completion Certificate",
    domain: "Web Development",
    difficulty: "Beginner",
    duration: "300 hours self-paced",
    pricing: "Free",
    priceDetail: "100% Free & Open-Source Non-profit",
    rating: 4.9,
    reviewsCount: 890000,
    enrolledStudentsCount: "4M+ learners",
    badgeAccentColor: "from-amber-600 to-orange-600",
    skillsCovered: ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "MongoDB"],
    careerRelevance: ["Full Stack Developer", "Software Engineer", "Web Developer"],
    resumeValueBullets: [
      "Completed 5 verified capstone web projects to earn official non-profit accreditation",
      "Architected MERN full stack applications with real-time database transactions and responsive design"
    ],
    officialUrl: "https://www.freecodecamp.org/learn",
    isPopular: true,
    isFree: true,
    syllabus: [
      { title: "Responsive Web Design Certification", duration: "300 hours", description: "HTML5 semantic markup, CSS flexbox, CSS grid, and mobile-first design." },
      { title: "JavaScript Algorithms & Data Structures", duration: "300 hours", description: "ES6+, OOP, functional programming, basic algorithms, and intermediate debugging." },
      { title: "Front End Development Libraries", duration: "300 hours", description: "Bootstrap, SASS, jQuery, React, and Redux." },
      { title: "Back End Development and APIs", duration: "300 hours", description: "Node.js, Express, MongoDB, Mongoose, and microservices." }
    ]
  },

  // Cloud & DevOps
  {
    id: "aws-cloud-practitioner",
    title: "AWS Certified Cloud Practitioner (CLF-C02)",
    issuer: "Amazon Web Services",
    platform: "AWS Skill Builder",
    badgeType: "Vendor Certification",
    domain: "Cloud & DevOps",
    difficulty: "Beginner",
    duration: "1 - 2 months (5 hrs/week)",
    pricing: "Paid",
    priceDetail: "$100 USD Exam fee / Free official learning path on AWS Skill Builder",
    rating: 4.8,
    reviewsCount: 165000,
    enrolledStudentsCount: "1.5M+ certified",
    badgeAccentColor: "from-amber-500 to-yellow-600",
    skillsCovered: ["Cloud Concepts", "AWS Security & Compliance", "EC2 & S3", "IAM", "CloudWatch", "Billing & Pricing Models"],
    careerRelevance: ["Cloud Architect Associate", "Cloud Support Specialist", "DevOps Trainee"],
    resumeValueBullets: [
      "Passed industry-standard AWS credential validating comprehensive knowledge of cloud architecture and shared responsibility",
      "Configured IAM roles, VPC network policies, and serverless compute instances adhering to AWS Well-Architected Framework"
    ],
    officialUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    isPopular: true,
    syllabus: [
      { title: "Cloud Concepts & Global Infrastructure", duration: "2 weeks", description: "Regions, Availability Zones, Edge Locations, and economics of cloud computing." },
      { title: "Security and Compliance", duration: "2 weeks", description: "AWS IAM, Security Groups, encryption at rest/transit, and compliance standards." },
      { title: "Core AWS Cloud Technologies & Services", duration: "3 weeks", description: "Compute (EC2, Lambda), Storage (S3, EBS), Databases (RDS, DynamoDB), and Networking (VPC)." },
      { title: "Billing, Pricing, and Governance", duration: "1 week", description: "Cost Explorer, AWS Budgets, support plans, and resource tagging strategies." }
    ]
  },
  {
    id: "aws-solutions-architect-associate",
    title: "AWS Certified Solutions Architect – Associate (SAA-C03)",
    issuer: "Amazon Web Services",
    platform: "AWS Skill Builder",
    badgeType: "Vendor Certification",
    domain: "Cloud & DevOps",
    difficulty: "Intermediate",
    duration: "2 - 3 months (8 hrs/week)",
    pricing: "Paid",
    priceDetail: "$150 USD Exam fee / Free training resources",
    rating: 4.9,
    reviewsCount: 210000,
    enrolledStudentsCount: "1.1M+ certified",
    badgeAccentColor: "from-orange-500 to-amber-600",
    skillsCovered: ["Resilient Architectures", "High-Performing Architectures", "VPC Subnetting", "Auto Scaling & ALB", "Aurora & DynamoDB"],
    careerRelevance: ["Solutions Architect", "Cloud Engineer", "DevOps Engineer"],
    resumeValueBullets: [
      "Validated enterprise capability to architect highly available, fault-tolerant, and cost-optimized AWS distributed systems",
      "Formulated disaster recovery and multi-region deployment topologies with automated Route 53 failover"
    ],
    officialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    isPopular: true,
    syllabus: [
      { title: "Design Secure Architectures", duration: "3 weeks", description: "Identity federation, AWS KMS encryption, secure VPC interconnects, and security auditing." },
      { title: "Design Resilient Architectures", duration: "3 weeks", description: "Multi-AZ databases, decouple applications with SQS/SNS, and auto-scaling workloads." },
      { title: "Design High-Performing Architectures", duration: "3 weeks", description: "Elasticache caching layers, CloudFront CDN edge delivery, and high-throughput EBS volumes." },
      { title: "Design Cost-Optimized Architectures", duration: "2 weeks", description: "Spot instances, S3 lifecycle transitions, and right-sizing server infrastructure." }
    ]
  },
  {
    id: "google-cloud-associate-cloud-engineer",
    title: "Google Cloud Associate Cloud Engineer (ACE)",
    issuer: "Google Cloud",
    platform: "Google Cloud Skills Boost",
    badgeType: "Vendor Certification",
    domain: "Cloud & DevOps",
    difficulty: "Intermediate",
    duration: "2 - 3 months (7 hrs/week)",
    pricing: "Paid",
    priceDetail: "$125 USD Exam fee / Learning path free on Skills Boost with credits",
    rating: 4.8,
    reviewsCount: 45000,
    enrolledStudentsCount: "350K+ certified",
    badgeAccentColor: "from-blue-500 to-cyan-500",
    skillsCovered: ["Google Kubernetes Engine (GKE)", "Compute Engine", "Cloud Run", "Cloud IAM", "gcloud CLI", "Cloud Operations (Monitoring & Logging)"],
    careerRelevance: ["Cloud Engineer", "GCP Specialist", "Platform Engineer"],
    resumeValueBullets: [
      "Demonstrated ability to deploy, manage, and configure enterprise solutions across Google Cloud Platform",
      "Orchestrated containerized microservices on GKE and automated resource provisioning using gcloud CLI and Terraform"
    ],
    officialUrl: "https://cloud.google.com/learn/certification/cloud-engineer",
    isPopular: true,
    syllabus: [
      { title: "Setting up a Cloud Solution Environment", duration: "2 weeks", description: "Setting up cloud projects and accounts, managing billing, and configuring IAM permissions." },
      { title: "Planning and Configuring a Cloud Solution", duration: "3 weeks", description: "Pricing calculator estimation, Compute Engine VMs, Google Kubernetes Engine clusters." },
      { title: "Deploying and Implementing a Cloud Solution", duration: "3 weeks", description: "Cloud Run serverless containers, BigQuery datasets, Cloud Storage buckets, and Cloud Pub/Sub." },
      { title: "Ensuring Successful Operation and Access", duration: "2 weeks", description: "Cloud Monitoring alerts, viewing diagnostic logs, and managing service accounts." }
    ]
  },
  {
    id: "microsoft-azure-fundamentals-az900",
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "Microsoft",
    platform: "Microsoft Learn",
    badgeType: "Vendor Certification",
    domain: "Cloud & DevOps",
    difficulty: "Beginner",
    duration: "1 month (5 hrs/week)",
    pricing: "Paid",
    priceDetail: "$99 USD Exam / 100% Free interactive modules on Microsoft Learn",
    rating: 4.8,
    reviewsCount: 190000,
    enrolledStudentsCount: "2M+ certified",
    badgeAccentColor: "from-blue-600 to-sky-700",
    skillsCovered: ["Azure Architecture", "Virtual Machines", "Azure Cosmos DB", "Azure RBAC", "Azure Cost Management", "Zero Trust Security"],
    careerRelevance: ["Azure Cloud Administrator", "IT Systems Analyst", "Solutions Consultant"],
    resumeValueBullets: [
      "Earned foundational Microsoft accreditation verifying knowledge of Azure core compute, network, and security services",
      "Implemented role-based access control (Azure RBAC) and Microsoft Entra ID authentication frameworks"
    ],
    officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
    isPopular: true,
    isFree: false,
    syllabus: [
      { title: "Describe Cloud Concepts", duration: "1 week", description: "IaaS vs PaaS vs SaaS, high availability, disaster recovery, and operational expenditures." },
      { title: "Describe Azure Architecture and Services", duration: "2 weeks", description: "Azure resource groups, virtual networks, VPN gateways, Blob storage, and Azure SQL." },
      { title: "Describe Azure Management and Governance", duration: "1 week", description: "Azure Policy, Azure Arc, Cost Management budgets, and Service Health telemetry." }
    ]
  },
  {
    id: "docker-certified-associate",
    title: "Docker Certified Associate (DCA)",
    issuer: "Mirantis / Docker",
    platform: "Docker Training",
    badgeType: "Vendor Certification",
    domain: "Cloud & DevOps",
    difficulty: "Intermediate",
    duration: "2 months (6 hrs/week)",
    pricing: "Paid",
    priceDetail: "$195 USD Examination fee",
    rating: 4.7,
    reviewsCount: 18000,
    enrolledStudentsCount: "85K+ certified",
    badgeAccentColor: "from-cyan-600 to-blue-600",
    skillsCovered: ["Containerization", "Dockerfile Optimization", "Docker Swarm", "Docker Compose", "Multi-stage Builds", "Storage Volumes"],
    careerRelevance: ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Infrastructure Engineer"],
    resumeValueBullets: [
      "Packaged and shipped high-performance microservices utilizing multi-stage Docker builds and minimal Alpine images",
      "Configured multi-container production environments with healthchecks, volume persistence, and isolated bridge networks"
    ],
    officialUrl: "https://www.docker.com/community/certifications/",
    syllabus: [
      { title: "Orchestration & Container Lifecycles", duration: "2 weeks", description: "Managing Swarm services, state reconciliation, rolling updates, and rollback routines." },
      { title: "Image Creation, Management, and Registry", duration: "2 weeks", description: "Dockerfile best practices, layer caching, Docker Hub, and security scanning." },
      { title: "Installation, Configuration, and Storage", duration: "2 weeks", description: "Docker daemon tuning, bind mounts, volume drivers, and storage plugin configuration." }
    ]
  },

  // Cybersecurity
  {
    id: "google-cybersecurity-cert",
    title: "Google Cybersecurity Professional Certificate",
    issuer: "Google",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Cybersecurity",
    difficulty: "Beginner",
    duration: "6 months (7 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / CompTIA Security+ dual discount",
    rating: 4.8,
    reviewsCount: 38000,
    enrolledStudentsCount: "350K+ enrolled",
    badgeAccentColor: "from-emerald-600 to-teal-700",
    skillsCovered: ["Linux Command Line", "SQL for Security", "Python Automation", "SIEM (Splunk)", "IDS/IPS (Suricata)", "NIST Framework", "Network Security"],
    careerRelevance: ["Cybersecurity Analyst", "SOC Analyst Tier 1", "Information Security Specialist"],
    resumeValueBullets: [
      "Analyzed threat vectors and triage security incident alerts using Splunk SIEM and Suricata intrusion detection systems",
      "Scripted automated log parsing and vulnerability scanning routines in Python and Linux bash"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/google-cybersecurity",
    isPopular: true,
    syllabus: [
      { title: "Foundations of Cybersecurity", duration: "3 weeks", description: "Historical threat attacks, security ethics, and the CISSP eight domains." },
      { title: "Play It Safe: Manage Security Risks", duration: "4 weeks", description: "NIST Cybersecurity Framework, threats, vulnerabilities, and incident response planning." },
      { title: "Connect and Protect: Networks and Network Security", duration: "4 weeks", description: "TCP/IP, subnetting, firewalls, VPNs, and packet inspection using Wireshark." },
      { title: "Tools of the Trade: Linux and SQL", duration: "4 weeks", description: "Bash shell navigation, user file permissions, and SQL queries to investigate user login events." },
      { title: "Assets, Threats, and Vulnerabilities", duration: "4 weeks", description: "Threat modeling, malware classifications, cryptographic hash functions, and public key crypto." },
      { title: "Sound the Alarm: Detection and Response", duration: "4 weeks", description: "SIEM log analysis in Splunk and alert triage in Chronicle." }
    ]
  },
  {
    id: "cisco-network-security-support",
    title: "Cisco Certified Support Technician (CCST) Cybersecurity",
    issuer: "Cisco",
    platform: "Cisco Networking Academy",
    badgeType: "Vendor Certification",
    domain: "Cybersecurity",
    difficulty: "Beginner",
    duration: "2 months (5 hrs/week)",
    pricing: "Free",
    priceDetail: "Courseware 100% Free on NetAcad / Certification Exam $125",
    rating: 4.7,
    reviewsCount: 14000,
    enrolledStudentsCount: "180K+ learners",
    badgeAccentColor: "from-teal-600 to-cyan-700",
    skillsCovered: ["Network Defense", "Threat Analysis", "Endpoint Security", "Cryptography", "Cisco Packet Tracer"],
    careerRelevance: ["Junior Security Specialist", "Help Desk Technician", "Network Support Associate"],
    resumeValueBullets: [
      "Completed Cisco official curriculum in endpoint protection, security policies, and incident mitigation",
      "Simulated enterprise perimeter firewall topologies and access control lists (ACLs) in Packet Tracer"
    ],
    officialUrl: "https://www.netacad.com/courses/cybersecurity/ccst-cybersecurity",
    isFree: true,
    syllabus: [
      { title: "Security Principles & Concepts", duration: "2 weeks", description: "Confidentiality, Integrity, Availability (CIA triad), and threat landscapes." },
      { title: "Network and Endpoint Security", duration: "3 weeks", description: "Wired and wireless network vulnerabilities, malware types, and anti-malware measures." },
      { title: "Vulnerability Assessment and Incident Handling", duration: "3 weeks", description: "Identifying security gaps, triage steps, and disaster recovery fundamentals." }
    ]
  },

  // Software Engineering & CS
  {
    id: "harvard-cs50-intro-computer-science",
    title: "CS50's Introduction to Computer Science",
    issuer: "Harvard University",
    platform: "edX",
    badgeType: "University Certificate",
    domain: "Software Engineering & CS",
    difficulty: "Intermediate",
    duration: "12 weeks (10 - 15 hrs/week)",
    pricing: "Free",
    priceDetail: "100% Free Course Access & Free Harvard Certificate",
    rating: 4.9,
    reviewsCount: 92000,
    enrolledStudentsCount: "5.4M+ enrolled",
    badgeAccentColor: "from-rose-600 to-red-700",
    skillsCovered: ["C Programming", "Memory Management (Pointers)", "Algorithms (Binary Search, Merge Sort)", "Data Structures (Linked Lists, Hash Tables, Trees)", "Python", "SQL", "Flask"],
    careerRelevance: ["Software Engineer", "Systems Programmer", "Backend Engineer"],
    resumeValueBullets: [
      "Completed rigorous Harvard university coursework implementing foundational algorithms, pointers, and memory allocation in C",
      "Constructed efficient hash tables and binary search trees optimizing computational complexity from O(n) to O(1)"
    ],
    officialUrl: "https://pll.harvard.edu/course/cs50-introduction-computer-science",
    isPopular: true,
    isFree: true,
    syllabus: [
      { title: "Week 0: Computational Thinking & Scratch", duration: "1 week", description: "Algorithms, loops, conditional statements, and binary abstraction." },
      { title: "Weeks 1 - 3: C Programming, Arrays, & Algorithmic Complexity", duration: "3 weeks", description: "Compiling, variables, scopes, arrays, asymptotic notation, linear & binary search, sorting." },
      { title: "Weeks 4 - 5: Pointers, Dynamic Memory, & Data Structures", duration: "2 weeks", description: "Hexadecimal, pointer arithmetic, malloc, free, valgrind, linked lists, hash tables, and tries." },
      { title: "Weeks 6 - 8: Python, SQL, & Web Development", duration: "3 weeks", description: "Python syntax, regex, database transactions, HTTP protocols, HTML/CSS, and Flask microframework." },
      { title: "Weeks 9 - 10: Capstone Project Delivery", duration: "2 weeks", description: "Independent software engineering project peer-reviewed by Harvard teaching fellows." }
    ]
  },
  {
    id: "mit-computational-thinking-python",
    title: "Introduction to Computer Science and Programming Using Python (6.00.1x)",
    issuer: "Massachusetts Institute of Technology (MIT)",
    platform: "edX",
    badgeType: "University Certificate",
    domain: "Software Engineering & CS",
    difficulty: "Intermediate",
    duration: "9 weeks (14 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / $99 for verified certificate",
    rating: 4.8,
    reviewsCount: 41000,
    enrolledStudentsCount: "1.3M+ enrolled",
    badgeAccentColor: "from-red-700 to-rose-800",
    skillsCovered: ["Python 3", "Algorithmic Complexity (Big O)", "Recursion", "Object-Oriented Programming", "Search and Sorting"],
    careerRelevance: ["Software Engineer", "Quantitative Developer", "Algorithm Specialist"],
    resumeValueBullets: [
      "Formal academic training from MIT in algorithmic decomposition, recursive computation, and asymptotic Big-O bounds",
      "Engineered object-oriented models implementing test-driven debugging and exception handling paradigms"
    ],
    officialUrl: "https://www.edx.org/learn/computer-science/massachusetts-institute-of-technology-introduction-to-computer-science-and-programming-using-python",
    isPopular: true,
    syllabus: [
      { title: "Computational Thinking & Python Basics", duration: "2 weeks", description: "Branching, iteration, strings, and approximation methods." },
      { title: "Functions, Scoping, and Abstraction", duration: "2 weeks", description: "Function specifications, decomposition, recursion, and tuples." },
      { title: "Testing, Debugging, and Exceptions", duration: "2 weeks", description: "Black-box testing, glass-box testing, assertions, and defensive programming." },
      { title: "Algorithmic Complexity & Classes", duration: "3 weeks", description: "Big O notation, inheritance, generator expressions, and search algorithms." }
    ]
  },

  // Mobile App Development
  {
    id: "meta-android-developer-cert",
    title: "Meta Android Developer Professional Certificate",
    issuer: "Meta",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "Mobile App Development",
    difficulty: "Beginner",
    duration: "8 months (7 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.7,
    reviewsCount: 9400,
    enrolledStudentsCount: "120K+ enrolled",
    badgeAccentColor: "from-emerald-500 to-green-600",
    skillsCovered: ["Kotlin", "Jetpack Compose", "Android Studio", "Room Database", "Coroutines", "MVVM Architecture"],
    careerRelevance: ["Android Engineer", "Mobile Software Developer", "Kotlin Developer"],
    resumeValueBullets: [
      "Created modern declarative Android user interfaces utilizing Jetpack Compose and Kotlin Coroutines for async data flows",
      "Architected clean MVVM applications with local caching via Room SQLite ORM and REST API integrations"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/meta-android-developer",
    syllabus: [
      { title: "Introduction to Android Mobile Application Development", duration: "4 weeks", description: "Android lifecycle, Android Studio setup, and mobile layout essentials." },
      { title: "Programming in Kotlin", duration: "4 weeks", description: "Kotlin syntax, null safety, lambdas, higher-order functions, and collections." },
      { title: "Android UI with Jetpack Compose", duration: "5 weeks", description: "State hoisting, composables, modifiers, Material 3 theming, and animations." },
      { title: "Data Storage and Network Interactivity", duration: "5 weeks", description: "Room DB, Retrofit networking, JSON deserialization, and repository patterns." }
    ]
  },
  {
    id: "google-flutter-development-cert",
    title: "Flutter & Dart Complete Guide Certification",
    issuer: "Google Developers / Academind",
    platform: "Udemy",
    badgeType: "Course Completion Certificate",
    domain: "Mobile App Development",
    difficulty: "Beginner",
    duration: "42 hours of video (2 months)",
    pricing: "Paid",
    priceDetail: "~$15 USD on sale / Lifetime access with Certificate",
    rating: 4.7,
    reviewsCount: 78000,
    enrolledStudentsCount: "260K+ enrolled",
    badgeAccentColor: "from-sky-500 to-blue-600",
    skillsCovered: ["Flutter SDK", "Dart Language", "State Management (Bloc / Provider)", "Firebase Integration", "Native Device Features"],
    careerRelevance: ["Flutter Developer", "Cross-Platform Mobile Engineer", "Full Stack Mobile Specialist"],
    resumeValueBullets: [
      "Engineered cross-platform iOS and Android apps using single-codebase Flutter SDK and BLoC state management",
      "Integrated native hardware APIs (camera, geolocation, push notifications) and real-time Firebase backend"
    ],
    officialUrl: "https://flutter.dev/learn",
    isPopular: true,
    syllabus: [
      { title: "Dart Language Fundamentals", duration: "1 week", description: "Object-oriented programming, sound null safety, and asynchronous futures in Dart." },
      { title: "Flutter Widgets & UI Engineering", duration: "3 weeks", description: "Stateless vs Stateful widgets, layout trees, themes, and custom gestures." },
      { title: "App Architecture & State Management", duration: "2 weeks", description: "Provider, Riverpod, and BLoC patterns for decoupled scalable codebases." },
      { title: "Publishing to Google Play & Apple App Store", duration: "1 week", description: "App signing, asset bundling, and release build optimization." }
    ]
  },

  // UI/UX & Product Design
  {
    id: "google-ux-design-cert",
    title: "Google UX Design Professional Certificate",
    issuer: "Google",
    platform: "Coursera",
    badgeType: "Professional Certificate",
    domain: "UI/UX & Product Design",
    difficulty: "Beginner",
    duration: "6 months (10 hrs/week)",
    pricing: "Free Audit",
    priceDetail: "Free audit available / Financial aid available",
    rating: 4.8,
    reviewsCount: 89000,
    enrolledStudentsCount: "1.1M+ enrolled",
    badgeAccentColor: "from-purple-500 to-pink-500",
    skillsCovered: ["Figma", "User Research", "Wireframing & Prototyping", "Usability Studies", "Accessibility Standards", "Design Systems"],
    careerRelevance: ["UI/UX Designer", "Product Designer", "User Researcher"],
    resumeValueBullets: [
      "Designed and tested 3 end-to-end interactive mobile and web prototypes in Figma based on qualitative user research",
      "Conducted usability studies and synthesized heuristic evaluations to improve task completion rates"
    ],
    officialUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
    isPopular: true,
    syllabus: [
      { title: "Foundations of User Experience (UX) Design", duration: "4 weeks", description: "Design thinking, user-centered design, and accessibility considerations." },
      { title: "Start the UX Design Process: Empathize, Define, and Ideate", duration: "4 weeks", description: "User personas, journey maps, and problem statements." },
      { title: "Build Wireframes and Low-Fidelity Prototypes", duration: "4 weeks", description: "Storyboarding, paper wireframes, and digital wireframes in Figma." },
      { title: "Conduct UX Research and Test Early Concepts", duration: "4 weeks", description: "Planning research studies, collecting feedback, and affinity diagramming." },
      { title: "Create High-Fidelity Designs and Prototypes in Figma", duration: "4 weeks", description: "Visual design principles, component libraries, color palettes, and motion." }
    ]
  }
];

export const CERTIFICATE_DOMAINS = [
  "All Domains",
  "AI & Machine Learning",
  "Data Science & Analytics",
  "Web Development",
  "Cloud & DevOps",
  "Cybersecurity",
  "Software Engineering & CS",
  "Mobile App Development",
  "UI/UX & Product Design"
] as const;

export const CERTIFICATE_PLATFORMS = [
  "All Platforms",
  "Coursera",
  "Google Cloud Skills Boost",
  "AWS Skill Builder",
  "Microsoft Learn",
  "edX",
  "freeCodeCamp",
  "DataCamp",
  "Cisco Networking Academy",
  "NVIDIA",
  "Udemy"
] as const;
