import os
import pickle
import numpy as np
from typing import Dict, List, Set, Tuple
import torch
from transformers import AutoModel, AutoTokenizer
from sklearn.metrics.pairwise import cosine_similarity


class SkillExtractor: 
    """
    Extracts skills from text using embeddings and a lightweight classifier.
    Uses a hybrid approach: transformer for embeddings + lightweight classifier.
    """
    
    def __init__(self):
        models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        self.embeddings_path = os.path.join(models_dir, 'skill_embeddings.pkl')
        self.classifier_path = os.path.join(models_dir, 'skill_classifier.pkl')
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
        self.model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2").to(self.device)
        
        if os.path.exists(self.embeddings_path):
            with open(self.embeddings_path, 'rb') as f:
                self.skill_embeddings = pickle.load(f)
        else:
            self.skill_embeddings = None
            
    def _initialize_skill_embeddings(self) -> Dict[str, np.ndarray]:
        common_skills = {
    # languages & scripting
    "languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "Rust", "Ruby",
        "PHP", "Kotlin", "Swift", "Objective-C", "R", "MATLAB", "Bash", "PowerShell"
    ],
    # frontend frameworks & libraries
    "frontend": [
        "React", "Angular", "Vue", "Svelte", "Next.js", "Nuxt.js", "HTML", "CSS", "SCSS",
        "Tailwind", "Bootstrap", "Material UI", "Ant Design"
    ],
    # backend frameworks & architectures
    "backend": [
        "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot",
        "ASP.NET", "Ruby on Rails", "Laravel", "Phoenix", "Elixir"
    ],
    # databases & data stores
    "databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Cassandra",
        "Firebase", "Oracle", "Prisma", "Drizzle", "SQL", "NoSQL"
    ],
    # devOps & infrastructure
    "devops": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "GitHub Actions", "Jenkins",
        "Travis CI", "CircleCI", "Terraform", "Ansible"
    ],
    # AI, machine learning & data processing
    "ai_ml": [
        "TensorFlow", "PyTorch", "scikit-learn", "Keras", "NLTK", "SpaCy", "Machine Learning",
        "Deep Learning", "Pandas", "NumPy"
    ],
    # mobile development frameworks
    "mobile": [
        "React Native", "Flutter", "Swift", "Kotlin", "Objective-C", "Xamarin", "Ionic", "Lynx"
    ],
    # testing & quality assurance
    "testing": [
        "Jest", "Mocha", "Chai", "Selenium", "Cypress", "JUnit", "pytest", "RSpec"
    ],
    # additional skills & architectural patterns
    "others": [
        "GraphQL", "RESTful APIs", "gRPC", "Microservices", "WebSockets", "Agile",
        "Scrum", "TDD", "BDD", "UX/UI Design", "DevSecOps"
    ]
}
        embeddings = {}
        for category, skills in common_skills.items():
            for skill in skills:
                tokenized_input = self.tokenizer(skill, return_tensors='pt', padding=True, truncation=True).to(self.device)
                with torch.no_grad():
                    embedding = self.model(**tokenized_input).last_hidden_state.mean(dim=1).cpu().numpy()
                embeddings[skill] = embedding
                
    def _get_text_embedding(self, text: str) -> np.ndarray:
        """generate embedding for a piece of text"""
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
        return embedding
    
    def extract_skills(self, text: str, threshold: float = 0.75) -> List[Tuple[str, float]]:
         """
        Extract skills from text with confidence scores.
        
        Args:
            text: The text to extract skills from
            threshold: Similarity threshold for skill matching
            
        Returns:
            List of (skill, confidence) tuples
        """
        
        text_embedding = self._get_text_embedding(text)
        
        if self.skill_embeddings is None:
            self.skill_embeddings = self._initialize_skill_embeddings()
            with open(self.embeddings_path, 'wb') as f:
                pickle.dump(self.skill_embeddings, f)
        skill_names = list(self.skill_embeddings.keys())
        skill_vectors = np.array(list(self.skill_embeddings.values()))
        similarities = cosine_similarity(text_embedding, skill_vectors)
        similar_skills = []
        for i, skill in enumerate(skill_names):
            if similarities[0][i] >= threshold:
                similar_skills.append((skill, similarities[0][i]))  
        return similar_skills

        