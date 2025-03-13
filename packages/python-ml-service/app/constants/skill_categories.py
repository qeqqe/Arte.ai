def get_skill_categories():
    return {
        # languages & scripting 
        "languages": [
            "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "Rust", "Ruby",
            "PHP", "Kotlin", "Swift", "Objective-C", "R", "MATLAB", "Bash", "PowerShell",
            "Scala", "Dart", "Clojure", "Haskell", "Perl", "Lua", "Julia", "Groovy", "F#",
            "Assembly", "COBOL", "Fortran", "Lisp", "Prolog", "Erlang", "Elixir", "OCaml",
            "C", "Apex", "Solidity", "WebAssembly", "ABAP", "VBA", "Delphi"
        ],

        # frontend frameworks & libraries 
        "frontend": [
            "React", "Angular", "Vue", "Svelte", "Next.js", "Nuxt.js", "HTML", "CSS", "SCSS",
            "Tailwind", "Bootstrap", "Material UI", "Ant Design", "Chakra UI", "Ember.js",
            "Alpine.js", "Solid.js", "Preact", "Lit", "Stencil", "Stimulus", "jQuery",
            "Redux", "MobX", "Zustand", "Jotai", "Recoil", "Emotion", "Styled Components",
            "Radix UI", "Framer Motion", "Three.js", "D3.js", "Chart.js", "Gatsby", "Astro",
            "Remix", "Qwik", "WebGL", "PWA", "HTMX", "Web Components", "Shadow DOM", 
            "Webpack", "Vite", "Parcel", "esbuild", "Rollup", "Babel"
        ],

        # UI/UX design 
        "design": [
            "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin", "Protopie", "Framer", 
            "Wireframing", "User Research", "Accessibility", "WCAG", "Color Theory", 
            "Typography", "Design Systems", "Motion Design", "Interaction Design",
            "Information Architecture", "Usability Testing", "A/B Testing", "Photoshop",
            "Illustrator", "User Personas", "Journey Mapping"
        ],

        # backend frameworks & architectures 
        "backend": [
            "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot",
            "ASP.NET", "Ruby on Rails", "Laravel", "Phoenix", "Elixir", "Gin", "Echo",
            "Fiber", "Actix", "Rocket", "Axum", "Beego", "Symfony", "Slim", "CakePHP",
            "Strapi", "Adonis.js", "Meteor", "Sails.js", "Koa", "Hapi", "Deno", "Bun",
            "Quarkus", "Micronaut", "Play Framework", "Vert.x", "Serverless", "AWS Lambda",
            "Azure Functions", "Google Cloud Functions", "Cloudflare Workers"
        ],

        # databases & data stores 
        "databases": [
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Cassandra",
            "Firebase", "Oracle", "Prisma", "Drizzle", "SQL", "NoSQL", "DynamoDB", "CouchDB",
            "Neo4j", "InfluxDB", "MariaDB", "Microsoft SQL Server", "Supabase", "PlanetScale",
            "Fauna", "Cockroach DB", "TimescaleDB", "RethinkDB", "ArangoDB", "Couchbase",
            "H2", "ClickHouse", "SingleStore", "Pinecone", "Weaviate", "Milvus", "QdrantDB",
            "Snowflake", "BigQuery", "Redshift", "S3", "MinIO", "Google Cloud Storage", 
            "Blob Storage", "Firestore", "GraphDB", "TigerGraph", "RDF", "SPARQL"
        ],

        # data engineering & analytics 
        "data_engineering": [
            "Apache Spark", "Apache Kafka", "Apache Airflow", "Databricks", "dbt", "ETL", "ELT",
            "Data Warehousing", "Data Modeling", "Data Pipelines", "Hadoop", "Hive", "Pig",
            "Apache Beam", "Luigi", "Prefect", "Dagster", "Apache NiFi", "Flink", "Snowplow",
            "Talend", "Matillion", "Fivetran", "Stitch", "PowerBI", "Tableau", "Looker",
            "Metabase", "Redash", "Superset", "Grafana", "Kibana", "Data Governance", "MDM"
        ],

        # devOps & infrastructure 
        "devops": [
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "GitHub Actions", "Jenkins",
            "Travis CI", "CircleCI", "Terraform", "Ansible", "Puppet", "Chef", "Salt", 
            "Prometheus", "Grafana", "ELK Stack", "Datadog", "New Relic", "AppDynamics",
            "Dynatrace", "PagerDuty", "Splunk", "OpenTelemetry", "GitLab CI", "ArgoCD",
            "Flux CD", "Helm", "Kustomize", "Istio", "Linkerd", "Consul", "Vault", "Vagrant",
            "Packer", "Pulumi", "CloudFormation", "Serverless Framework", "CDK", "Podman",
            "Envoy", "NGINX", "HAProxy", "Traefik", "Kong", "OpenStack", "Digital Ocean",
            "Linode", "OVH", "GitOps", "Infrastructure as Code", "Site Reliability Engineering"
        ],

        # cybersecurity 
        "security": [
            "Penetration Testing", "OWASP", "Security Auditing", "Vulnerability Assessment",
            "Threat Modeling", "Encryption", "Authentication", "Authorization", "OAuth", "OIDC",
            "JWT", "Kerberos", "SAML", "SSO", "SIEM", "SOC", "Splunk", "IDS/IPS", "Firewall",
            "WAF", "DAST", "SAST", "IAST", "RASP", "DevSecOps", "SecOps", "Compliance",
            "GDPR", "HIPAA", "PCI-DSS", "ISO 27001", "SOC 2", "Zero Trust", "PKI",
            "Secure Coding", "Cryptography", "Wireshark", "Burp Suite", "Metasploit",
            "Nessus", "Snyk", "SonarQube", "Network Security", "Cloud Security"
        ],

        # AI, machine learning & data processing 
        "ai_ml": [
            "TensorFlow", "PyTorch", "scikit-learn", "Keras", "NLTK", "SpaCy", "Machine Learning",
            "Deep Learning", "Pandas", "NumPy", "Hugging Face", "Transformers", "BERT", "GPT",
            "LLM", "RAG", "Computer Vision", "NLP", "Neural Networks", "CNN", "RNN", "LSTM",
            "Transfer Learning", "Reinforcement Learning", "Supervised Learning", "Unsupervised Learning",
            "Data Mining", "Feature Engineering", "Model Deployment", "MLOps", "MLflow",
            "Data Annotation", "TensorBoard", "Weights & Biases", "JAX", "OpenCV", "DVC",
            "XGBoost", "LightGBM", "CatBoost", "SciPy", "Matplotlib", "Seaborn", "Plotly",
            "Jupyter", "Generative AI", "Diffusion Models", "Stable Diffusion", "OpenAI",
            "Vector Databases", "Language Models", "Prompt Engineering", "Fine-tuning"
        ],

        # mobile development frameworks 
        "mobile": [
            "React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Jetpack Compose", 
            "Objective-C", "Xamarin", "Ionic", "Capacitor", "Cordova", "Android SDK",
            "iOS Development", "KMM", "Mobile Design Patterns", "Progressive Web Apps",
            "React Native Navigation", "Expo", "Mobile Testing", "TestFlight", "App Store Connect",
            "Google Play Console", "Push Notifications", "Mobile Analytics", "Mobile Security",
            "Mobile Authentication", "Biometric Authentication", "ARKit", "ARCore",
            "Core ML", "TensorFlow Lite", "React Native Reanimated", "NativeScript"
        ],

        # testing & quality assurance 
        "testing": [
            "Jest", "Mocha", "Chai", "Selenium", "Cypress", "JUnit", "pytest", "RSpec",
            "Playwright", "WebdriverIO", "TestNG", "XCTest", "Espresso", "Appium",
            "Cucumber", "Gherkin", "Jasmine", "Karma", "Vitest", "Enzyme",
            "Testing Library", "Mock Service Worker", "Storybook", "Visual Regression Testing",
            "Load Testing", "JMeter", "k6", "Gatling", "Postman", "Performance Testing",
            "A/B Testing", "Chaos Engineering", "Mutation Testing", "Snapshot Testing",
            "Test Automation", "TDD", "BDD", "Contract Testing", "Pact", "SonarQube"
        ],

        # blockchain & web3 
        "blockchain": [
            "Ethereum", "Solidity", "Smart Contracts", "Web3.js", "Ethers.js", "Hardhat",
            "Truffle", "Foundry", "EVM", "Solana", "Rust", "Anchor", "NFTs", "DeFi",
            "Blockchain", "Cryptocurrency", "Bitcoin", "Chainlink", "IPFS", "Filecoin",
            "Metamask", "Wallet Connect", "ERC-20", "ERC-721", "Layer 2", "Optimism",
            "Arbitrum", "Zero-knowledge Proofs", "DAOs", "Tokenomics", "Consensus Mechanisms",
            "Polkadot", "Substrate", "Cosmos", "IBC", "Hyperledger"
        ],

        # game development 
        "gamedev": [
            "Unity", "Unreal Engine", "Godot", "Phaser", "Three.js", "WebGL", "PlayCanvas",
            "Game Design", "Level Design", "Character Design", "Animation", "Rigging",
            "Shader Programming", "Physics Engines", "Collision Detection", "Pathfinding",
            "Game UI", "Game Audio", "Game Backend", "Multiplayer", "Networking", "Game AI",
            "Mobile Games", "Console Development", "PC Gaming", "Browser Games", "VR Development",
            "AR Development", "Game Testing", "Game Analytics", "Monetization", "GameFi"
        ],

        # IoT & embedded systems 
        "iot_embedded": [
            "Arduino", "Raspberry Pi", "ESP32", "ESP8266", "Microcontrollers", "Embedded C",
            "Embedded C++", "RTOS", "FreeRTOS", "Zephyr", "MQTT", "CoAP", "Zigbee", "Z-Wave",
            "Bluetooth LE", "LoRaWAN", "Thread", "Matter", "Home Assistant", "ESPHome",
            "Tasmota", "Node-RED", "IoT Security", "Firmware Development", "PCB Design",
            "Digital Signal Processing", "Sensor Networks", "Industrial IoT", "Edge Computing",
            "Embedded Linux", "FPGA", "ARM", "AVR", "PIC", "STM32", "Circuit Design", "Prototyping"
        ],

        # additional skills & architectural patterns 
        "others": [
            "GraphQL", "RESTful APIs", "gRPC", "Microservices", "WebSockets", "Agile",
            "Scrum", "TDD", "BDD", "UX/UI Design", "DevSecOps", "Event-Driven Architecture",
            "CQRS", "Event Sourcing", "Domain-Driven Design", "Clean Architecture", "Hexagonal Architecture",
            "Monorepo", "Polyrepo", "Project Management", "Technical Writing", "Documentation",
            "Mentoring", "Leadership", "System Design", "Distributed Systems", "High Availability",
            "Fault Tolerance", "Resilience", "Technical Debt Management", "API Design",
            "API Gateway", "Message Queues", "RabbitMQ", "Kafka", "NATS", "Pub/Sub",
            "Monoliths", "Service Mesh", "Observability", "Monitoring", "Logging",
            "Internationalization", "Localization", "Accessibility (a11y)", "SEO",
            "Web Vitals", "Performance Optimization", "Authentication", "Authorization"
        ]
    }