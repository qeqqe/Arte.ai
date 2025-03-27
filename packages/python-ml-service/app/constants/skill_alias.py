def get_skill_aliases():
    """
    Returns a mapping of skill aliases to their canonical names.
    The structure is { canonical_name: [list of aliases] }
    """
    return {
        # Base languages
        "javascript": ["js", "java script", "java-script", "java_script", "ecmascript", "es6", "es2015+", "ecma"],
        "typescript": ["ts", "type script", "type-script", "type_script", "tscript", "typed js", "typed javascript"],
        "python": ["py", "python3", "python2", "py3", "py2", "cpython", "pypy", "python programming"],
        "java": ["jdk", "jre", "j2ee", "java se", "java ee", "jvm language", "java language"],
        "c#": ["csharp", "c sharp", "c-sharp", "dotnet c#", "net c#", "csharp dotnet", "cs"],
        "c++": ["cpp", "c plus plus", "cplusplus", "c-plus-plus", "c++11", "c++14", "c++17", "c++20"],
        "go": ["golang", "go lang", "go-lang", "go language"],
        "rust": ["rust lang", "rust language", "rustlang", "rust-lang", "rustc"],
        "ruby": ["rb", "ruby lang", "ruby language", "ruby on rails language", "ror language"],
        "php": ["php language", "hypertext preprocessor", "php7", "php8"],
        "kotlin": ["kt", "kotlin-lang", "kotlin lang", "kotlin jvm"],
        "swift": ["swift lang", "swift language", "apple swift", "ios swift"],
        "r": ["r lang", "r language", "rlang", "r-project", "r statistics", "r stats"],
        "matlab": ["matrix laboratory", "matrix lab", "mathworks matlab"],
        "bash": ["shell", "shell scripting", "unix shell", "bash scripting", "shell script", "sh"],
        "powershell": ["posh", "ps1", "pwsh", "power shell", "power-shell", "windows powershell"],
        
        # JavaScript ecosystem - Frontend frameworks
        "react": ["reactjs", "react.js", "react js", "react-js", "react_js", "react dom", "react library"],
        "angular": ["angularjs", "angular.js", "angular js", "angular-js", "angular_js", "ng", "ng2+", "angular 2+"],
        "vue": ["vuejs", "vue.js", "vue js", "vue-js", "vue_js", "vue3", "vue2", "vuejs framework"],
        "svelte": ["sveltejs", "svelte.js", "svelte js", "svelte-js", "svelte_js", "svelte kit", "sveltekit"],
        "nextjs": ["next.js", "next js", "next-js", "next_js", "next", "react next", "next react", "vercel next"],
        "nuxtjs": ["nuxt.js", "nuxt js", "nuxt-js", "nuxt_js", "nuxt", "vue nuxt", "nuxt vue"],
        "html": ["html5", "hypertext markup language", "markup", "html markup"],
        "css": ["cascading style sheets", "stylesheets", "styles", "css3", "web styles"],
        "scss": ["sass", "sassy css", "syntactically awesome stylesheets", "css preprocessor"],
        "tailwind": ["tailwindcss", "tailwind css", "tailwind-css", "tailwind_css", "utility css", "utility-first"],
        "bootstrap": ["twitter bootstrap", "bs", "bootstrap5", "bootstrap4", "bootstrap css", "bootstrap framework"],
        "materialui": ["material ui", "material-ui", "material_ui", "mui", "material design", "mdc"],
        "antdesign": ["ant design", "ant-design", "ant_design", "antd", "ant", "ant ui"],
        
        # JavaScript ecosystem - Backend frameworks
        "nodejs": ["node.js", "node js", "node-js", "node_js", "node", "server javascript", "server js"],
        "express": ["expressjs", "express.js", "express js", "express-js", "express_js", "express framework"],
        "nestjs": ["nest.js", "nest js", "nest-js", "nest_js", "nest", "typescript nest", "nest typescript"],
        "fastapi": ["fast-api", "fast api", "fast_api", "fastapi python", "python fastapi"],
        "django": ["django-framework", "djangoframework", "django framework", "python django"],
        "flask": ["flask-framework", "flask framework", "python flask", "flask python"],
        "springboot": ["spring boot", "spring-boot", "spring_boot", "spring framework", "spring mvc"],
        "aspnet": ["asp.net", "asp net", "asp-net", "asp_net", "asp dot net", "asp.net core", "asp.net mvc"],
        "rubyonrails": ["ruby on rails", "rails", "ror", "ruby rails"],
        "laravel": ["laravel framework", "laravel php", "php laravel"],
        
        # Databases
        "postgresql": ["postgres", "postgre", "psql", "pg", "pgsql", "postgres sql", "postgres database"],
        "mysql": ["my-sql", "my sql", "mysql db", "mysql database", "mariadb", "maria db", "maria-db"],
        "mongodb": ["mongo", "mongo db", "mongo-db", "mongodb database", "nosql database", "document database"],
        "redis": ["redis db", "redis-db", "redis database", "redis cache", "in-memory database"],
        "elasticsearch": ["elastic", "elastic search", "elastic-search", "es", "elk", "elastic stack"],
        "sqlite": ["sqlite3", "sql lite", "sql-lite", "sqlite database", "embedded database"],
        "prisma": ["prisma orm", "prisma-orm", "prisma db", "prisma.io"],
        "drizzle": ["drizzle orm", "drizzle-orm", "drizzleorm"],
        "firebase": ["firebase db", "firebase-db", "firestore", "firebase firestore", "google firebase"],
        "supabase": ["supabase db", "supabase-db", "supabase postgres", "postgres supabase"],
        
        # DevOps & Cloud
        "aws": ["amazon web services", "amazon-web-services", "amazon cloud", "aws cloud", "ec2", "s3"],
        "azure": ["microsoft azure", "ms azure", "azure cloud", "azure services", "azure devops"],
        "gcp": ["google cloud", "google cloud platform", "google-cloud", "gce", "google compute engine"],
        "docker": ["docker container", "containerization", "docker engine", "docker image", "docker file"],
        "kubernetes": ["k8s", "kube", "kuber", "k8", "kubernetes orchestration", "container orchestration"],
        "terraform": ["tf", "terraform iac", "hashicorp terraform", "terraform config", "infrastructure as code"],
        "ci/cd": ["cicd", "ci-cd", "ci cd", "continuous integration", "continuous delivery", "continuous deployment"],
        "githubactions": ["github actions", "github-actions", "gh actions", "gha", "github workflows"],
        "jenkins": ["jenkins ci", "jenkins pipeline", "jenkins automation", "jenkins server"],
        
        # AI/ML
        "tensorflow": ["tf", "tensor flow", "tensor-flow", "tensor_flow", "google tensorflow", "tensorflow 2"],
        "pytorch": ["torch", "py torch", "py-torch", "python torch", "facebook pytorch", "meta pytorch"],
        "scikit-learn": ["sklearn", "scikit learn", "sci-kit learn", "scikit_learn", "scikit", "sklearn python"],
        "machinelearning": ["machine learning", "machine-learning", "ml", "statistical learning", "predictive modeling"],
        "deeplearning": ["deep learning", "deep-learning", "dl", "neural networks", "deep neural networks"],
        "llms": ["large language models", "llm", "language model", "gpt", "bert", "foundation models"],
        "huggingface": ["hugging face", "hugging-face", "hf", "transformers library", "transformers"],
        "pandas": ["pd", "python pandas", "data frames", "pandas dataframe", "pandas library"],
        "numpy": ["np", "numerical python", "num py", "numerical computing", "numeric python"],
        
        # Mobile development
        "reactnative": ["react native", "react-native", "react_native", "rn", "react native mobile"],
        "flutter": ["flutter sdk", "flutter framework", "dart flutter", "flutter mobile", "flutter app"],
        "ios": ["iphone os", "apple ios", "ios development", "ios programming", "iphone development"],
        "android": ["android sdk", "android development", "android programming", "android app"],
        
        # Testing frameworks
        "jest": ["jest js", "jest testing", "jest test", "facebook jest", "js jest", "jest framework"],
        "cypress": ["cypress io", "cypress testing", "cypress test", "cy", "cy.io", "e2e testing"],
        "selenium": ["selenium webdriver", "selenium testing", "selenium automation", "browser automation"],
        "pytest": ["py.test", "py-test", "python test", "python-test", "pytest framework"],
        
        # Architectural patterns  
        "graphql": ["gql", "graph-ql", "graph ql", "graph query language", "facebook graphql"],
        "rest": ["restful", "rest api", "restful api", "rest-api", "representational state transfer"],
        "grpc": ["g-rpc", "g rpc", "google rpc", "grpc protocol", "google remote procedure call"],
        "microservices": ["micro services", "micro-services", "μservices", "microservice architecture"],
        "ddd": ["domain driven design", "domain-driven design", "domain-driven-design", "domain modeling"],
        
        # New technologies & frameworks
        "webassembly": ["wasm", "web assembly", "web-assembly"],
        "remix": ["remixjs", "remix.js", "remix js", "remix-js", "remix_js", "remix-run"],
        "qwik": ["qwik js", "qwik.js", "qwikjs", "qwik framework", "builder.io qwik"],
        "astro": ["astro js", "astro.js", "astrojs", "astro framework", "astro ssg"],
        "solidjs": ["solid.js", "solid js", "solid-js", "solid_js", "solid framework"],
        "deno": ["deno runtime", "deno js", "deno typescript", "secure runtime"],
        "bun": ["bun js", "bun.js", "bunjs", "bun runtime", "bun package manager"],
        
        # Blockchain & Web3
        "ethereum": ["eth", "ether", "ethereum blockchain", "ethereum network"],
        "solidity": ["solidity language", "sol", "ethereum solidity", "smart contract language"],
        "web3": ["web 3", "web3js", "web3.js", "ethereum javascript api", "web3 api"],
        "nft": ["non-fungible token", "non fungible token", "nfts", "digital collectibles"],
        "defi": ["decentralized finance", "defi protocol", "decentralised finance"],
        
        # Game Development
        "unity": ["unity3d", "unity engine", "unity game engine", "unity technologies"],
        "unrealengine": ["unreal", "unreal 4", "unreal 5", "ue4", "ue5", "epic games engine"],
        "godot": ["godot engine", "godot game engine", "open source game engine"],
        
        # Methodology & processes
        "agile": ["agile methodology", "agile development", "agile scrum", "agile process"],
        "scrum": ["scrum methodology", "scrum master", "scrum framework", "scrum process", "agile scrum"],
        "tdd": ["test driven development", "test-driven-development", "test driven dev", "test first"],
        "bdd": ["behavior driven development", "behaviour driven development", "cucumber", "gherkin"],
        
        # Security
        "devsecops": ["dev sec ops", "dev-sec-ops", "developer security operations", "security as code"],
        "oauth": ["oauth2", "oauth 2.0", "open authentication", "authorization framework"],
        "jwt": ["json web token", "json web tokens", "jwt auth", "token auth"],
        
        # Infrastructure patterns
        "serverless": ["faas", "function as a service", "lambda", "cloud functions", "serverless computing"],
        "observability": ["o11y", "observable systems", "telemetry", "monitoring and logging"],

        # UI/UX Design tools
        "figma": ["figma design", "figma tool", "figma app", "figma prototype"],
        "sketch": ["sketch app", "sketch design", "sketch tool", "bohemian sketch"],
        "adobexd": ["adobe xd", "xd", "adobe experience design"],

        # Data Engineering
        "apachekafka": ["kafka", "apache kafka", "kafka streams", "kafka connect"],
        "apachespark": ["spark", "apache spark", "pyspark", "spark streaming"],
        "apacheairflow": ["airflow", "apache airflow", "airflow dag"],
        "dbt": ["data build tool", "dbt core", "analytics engineering"],

        # Cloud Services
        "s3": ["aws s3", "simple storage service", "amazon s3", "s3 bucket"],
        "ec2": ["aws ec2", "elastic compute cloud", "amazon ec2", "ec2 instance"]
    }

def build_alias_lookup():
    """
    Builds a flattened lookup dictionary mapping all aliases to their canonical names.
    This makes lookups faster during skill extraction.
    """
    lookup = {}
    aliases = get_skill_aliases()
    
    # First add all canonical names (lowercase) mapping to themselves
    for canonical in aliases:
        lookup[canonical.lower()] = canonical.lower()
    
    # Then add all aliases mapping to their canonical names
    for canonical, alias_list in aliases.items():
        for alias in alias_list:
            lookup[alias.lower()] = canonical.lower()
    
    return lookup

# Pre-build the lookup table
ALIAS_LOOKUP = build_alias_lookup()

def get_canonical_skill_name(skill):
    """
    Get the canonical name of a skill from any alias.
    
    Args: 
        skill: The skill name or alias to normalize
        
    Returns:
        The canonical skill name, or the original if no match found
    """
    if not skill:
        return skill
    
    # Try to find in the lookup table
    return ALIAS_LOOKUP.get(skill.lower(), skill)