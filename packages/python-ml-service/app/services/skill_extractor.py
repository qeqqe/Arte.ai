import json
import re
import logging
from collections import defaultdict
from typing import Dict, List, Set, Union, Optional, Any

class SkillExtractor:
    
    def __init__(self, user_stats=None):
        """
        Initialize the SkillExtractor with user stats if provided.
        
        Args:
            user_stats: User statistics data as a string (JSON) or dict
        """
        self.logger = logging.getLogger(__name__)
        
        # Define common skills across different categories
        self.skill_categories = {
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
        
        # Process user stats if provided
        if user_stats:
            if isinstance(user_stats, str):
                try:
                    self.user_stats = json.loads(user_stats)
                except json.JSONDecodeError:
                    self.logger.error("Failed to parse user stats JSON")
                    self.user_stats = {}
            else:
                self.user_stats = user_stats
        else:
            self.user_stats = {}
            
        # Compile regex patterns for skill detection
        self.category_patterns = {}
        for category, skills in self.skill_categories.items():
            # Create regex patterns that match whole words only
            patterns = [r'\b' + re.escape(skill) + r'\b' for skill in skills]
            self.category_patterns[category] = re.compile('|'.join(patterns), re.IGNORECASE)
    
    def extract_skills_from_text(self, text: str, threshold: float = 0.0) -> Dict[str, List[str]]:
        """
        Extract skills from plain text with a confidence threshold.
        
        Args:
            text: The text to extract skills from
            threshold: Confidence threshold for skill extraction (0.0 to 1.0)
            
        Returns:
            Dictionary of categorized skills
        """
        try:
            found_skills = defaultdict(set)
            
            # Process text against all category patterns
            for category, pattern in self.category_patterns.items():
                matches = pattern.findall(text)
                for match in matches:
                    skill_name = match.lower()
                    # Apply a simple confidence measure - could be improved in production
                    confidence = len(skill_name) / 20  # Example: longer skill names get higher confidence
                    if confidence >= threshold:
                        found_skills[category].add(skill_name)
            
            # Convert sets to lists for JSON serialization
            return {category: sorted(list(skills)) for category, skills in found_skills.items()}
        
        except Exception as e:
            self.logger.error(f"Error extracting skills from text: {str(e)}")
            return {}
    
    def extract_skills_from_github(self) -> Dict[str, List[str]]:
        """
        Extract skills from user's GitHub repositories.
        
        Returns:
            Dictionary of categorized skills
        """
        try:
            found_skills = defaultdict(set)
            
            # Process user's GitHub repos
            for repo in self.user_stats.get("userGithubRepos", []):
                # Extract from languages
                for lang in repo.get("languages", {}):
                    self._categorize_skill(lang.lower(), found_skills)

                # Extract from repository topics
                for topic in repo.get("repositoryTopics", []):
                    # Handle hyphenated topics
                    for subtopic in topic.split('-'):
                        self._categorize_skill(subtopic.lower(), found_skills)
                
                # Extract from description
                if repo.get("description"):
                    for category, pattern in self.category_patterns.items():
                        matches = pattern.findall(repo["description"].lower())
                        for match in matches:
                            self._categorize_skill(match.lower(), found_skills)
                            
                # Extract from primary language
                if repo.get("primaryLanguage"):
                    self._categorize_skill(repo["primaryLanguage"].lower(), found_skills)
            
            # Convert sets to lists for JSON serialization
            return {category: sorted(list(skills)) for category, skills in found_skills.items()}
        
        except Exception as e:
            self.logger.error(f"Error extracting skills from GitHub data: {str(e)}")
            return {}
    
    def _categorize_skill(self, skill: str, found_skills: Dict[str, Set[str]]) -> None:
        """
        Categorize a skill into the appropriate category.
        
        Args:
            skill: The skill to categorize
            found_skills: Dictionary of categorized skills to update
        """
        if not skill:
            return
            
        skill = skill.lower()
        categorized = False

        # Special case handling
        if skill in ["scss", "css", "html"]:
            found_skills["frontend"].add(skill)
            categorized = True
        
        # Normal categorization
        for category, skills in self.skill_categories.items():
            if skill in [s.lower() for s in skills]:
                found_skills[category].add(skill)
                categorized = True
                
        if not categorized:
            # If the skill doesn't match any category, add it to 'others'
            found_skills["others"].add(skill)
