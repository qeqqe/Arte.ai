from typing import Dict, List, Any, Optional
import numpy as np
from .skill_extractor import SkillExtractor
from sentence_transformers import SentenceTransformer
class SkillAnalyzer:

    def __init__(self):
        self.skill_extractor = SkillExtractor()
        
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
        
        self.job_roles = {
            "Frontend Developer": {
                "key_skills": ["React", "Angular", "Vue", "Svelte", "JavaScript", "HTML", "CSS", "TypeScript", "SCSS", "Tailwind", "Ant Design", "Next.js", "Nuxt.js", "Bootstrap", "Material UI"],
                "algo_importance": 0.3                  
            },
            "Backend Developer": {
                "key_skills": ["Node.js", "Django", "Flask", "Ruby on Rails", "Express", "Spring Boot", "ASP.NET", "NestJS", "Laravel", "Phoenix", "Elixir"],
                "algo_importance": 0.7                  
            },
            "Full Stack Developer": {
                "key_skills": ["Node.js", "React", "Django", "Flask", "Java", "C#", "Go", "Ruby", "PHP", "JavaScript", "TypeScript"],
                "algo_importance": 0.7                  
            },
            "Data Scientist": {
                "key_skills": ["Python", "R", "TensorFlow", "PyTorch"],
                "algo_importance": 0.8                  
            },
            "DevOps Engineer": {
                "key_skills": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Terraform", "Ansible"],
                "algo_importance": 0.6
            },
            "Mobile Developer": {
                "key_skills": ["React Native", "Flutter", "Swift", "Kotlin", "Lynx"],
                "algo_importance": 0.6                  
            },
            "Data Engineer": {
                "key_skills": ["Python", "SQL", "Spark", "Kafka"],
                "algo_importance": 0.8                  
            },
            "Machine Learning Engineer": {
                "key_skills": ["Python", "TensorFlow", "PyTorch", "scikit-learn", "Deep Learning", "Machine Learning", "Data Processing", "Pandas", "NumPy"],
                "algo_importance": 0.9                  
            },
            "Cloud Engineer": {
                "key_skills": ["AWS", "Azure", "GCP", "Terraform"],
                "algo_importance": 0.95                  
            },
            "Game Developer": {
                "key_skills": ["C#", "Unity", "Unreal Engine"],
                "algo_importance": 0.85                  
            },
            "Security Engineer": {
                "key_skills": ["Penetration Testing", "Vulnerability Assessment"],
                "algo_importance": 0.75                  
            },
            "UI/UX Designer": {
                "key_skills": ["Figma", "Sketch", "Adobe XD"],
                "algo_importance": 0.65                  
            },
            "QA Engineer": {
                "key_skills": ["Selenium", "Cypress", "JUnit"],
                "algo_importance": 0.55                  
            },
            "Network Engineer": {
                "key_skills": ["Cisco", "Juniper", "Network Security"],
                "algo_importance": 0.45                  
            },
            "Business Analyst": {
                "key_skills": ["Data Analysis", "SQL", "Excel"],
                "algo_importance": 0.35                  
            },
            "Project Manager": {
                "key_skills": ["Agile", "Scrum", "Kanban"],
                "algo_importance": 0.25                  
            }
        }
        
    def analyze_skills(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
            Analyze the user's skills and recommend job roles based on their skills.
            
            Args:
                user_data (Dict[str, Any]): User data containing skills and experience.
                
            Returns:
                Dict[str, Any]: Recommended job roles and their corresponding skill scores.
        """ 
        skills = {}
        
        # 1. Process GitHub repositories
        if "userGithubRepos" in user_data and user_data["userGithubRepos"]:
            for repo in user_data["userGithubRepos"]:
                repo_skills = self.skill_extractor.extract_skills_from_repo(repo)
                for skill, score in repo_skills.items():
                    skills[skill] = max(skills.get(skill, 0), score)
        
        # 2. Process LeetCode stats
        algo_proficiency = 0
        if "leetCodeStat" in user_data and user_data["leetCodeStat"]:
            algo_proficiency = self._calculate_algo_proficiency(user_data["leetCodeStat"])
            skills["algorithms"] = algo_proficiency
        
        # 3. Process resume if available
        if "resume" in user_data and user_data["resume"]:
            resume_skills = self.skill_extractor.extract_skills(user_data["resume"])
            for skill, score in resume_skills:
                skills[skill] = max(skills.get(skill, 0), score)
        
        # 4. Calculate job readiness scores
        job_categories = self._calculate_job_readiness(skills, algo_proficiency)
        
        # 5. Calculate technical proficiency by category
        tech_proficiency = self._calculate_technical_proficiency(skills)
        
        # 6. Identify strengths and gaps
        strengths, missing_skills = self._identify_strengths_and_gaps(skills)
        
        # 7. Generate recommendations
        recommendations = self._generate_recommendations(skills, job_categories)
        
        # 8. Calculate overall readiness score
        overall_score = self._calculate_overall_readiness(skills, job_categories)
        
        # Return comprehensive analysis
        return {
            "overallReadinessScore": overall_score,
            "skills": skills,
            "jobCategories": job_categories,
            "technicalProficiency": tech_proficiency,
            "missingCriticalSkills": missing_skills,
            "strengthAreas": strengths,
            "recommendations": recommendations
        }
        
    def _calculate_algo_proficiency(self, leetcode_stats: Dict[str, Any]) -> float:
        """
            Calculate the algorithm proficiency based on LeetCode stats.
            
            Args:
                leetcode_stats (Dict[str, Any]): LeetCode statistics.
                
            Returns:
                float: Algorithm proficiency score.
        """
        # Placeholder for actual calculation
        if not leetcode_stats.get("totalSolved"):
            return 0
        
        easy_weight = 1
        medium_weight = 2.5
        hard_weight = 4
        
        easy = leetcode_stats.get("easySolved", 0) or 0
        medium = leetcode_stats.get("mediumSolved", 0) or 0
        hard = leetcode_stats.get("hardSolved", 0) or 0
        total = leetcode_stats.get("totalQuestions", 0) or 0
        
        weighted_score = easy * easy_weight + medium * medium_weight + hard * hard_weight
        total_weighted_possible = total * medium_weight  # Using medium as baseline
        
        percentage = min(1.0, weighted_score / total_weighted_possible) if total_weighted_possible > 0 else 0
        return percentage * 10
    def _calculate_job_readiness(self, skills: Dict[str, float], algo_proficiency: float) -> List[Dict[str, Any]]:
        """Calculate readiness for different job roles"""
        job_categories = []
        
        for job_title, requirements in self.job_roles.items():
            key_skills = requirements["key_skills"]
            algo_importance = requirements["algo_importance"]
            
            # Calculate skill match score
            skill_scores = []
            relevant_skills = {}
            
            for skill in key_skills:
                if skill in skills:
                    score = skills[skill]
                    skill_scores.append(score)
                    relevant_skills[skill] = score
                else:
                    skill_scores.append(0)
                    relevant_skills[skill] = 0
            
            # Calculate average skill score
            avg_skill_score = sum(skill_scores) / len(skill_scores) if skill_scores else 0
            
            # Calculate final readiness score with algorithm weight
            readiness_score = (avg_skill_score * (1 - algo_importance) + 
                              algo_proficiency * algo_importance)
            
            # Generate recommendations
            recommendations = []
            for skill in key_skills:
                if skill not in skills or skills[skill] < 5:
                    recommendations.append(f"Learn or improve {skill}")
            
            job_categories.append({
                "name": job_title,
                "readinessScore": readiness_score,
                "skills": relevant_skills,
                "recommendations": recommendations
            })
        
        # Sort by readiness score
        job_categories.sort(key=lambda x: x["readinessScore"], reverse=True)
        return job_categories
    
    def _calculate_technical_proficiency(self, skills: Dict[str, float]) -> Dict[str, float]:
        """Calculate proficiency in different technical categories"""
        proficiency = {}
        
        for category, category_skills in self.skill_categories.items():
            relevant_skills = [skills.get(skill, 0) for skill in category_skills if skill in skills]
            if relevant_skills:
                proficiency[category] = sum(relevant_skills) / len(relevant_skills)
            else:
                proficiency[category] = 0
        
        return proficiency
    
    def _identify_strengths_and_gaps(self, skills: Dict[str, float]) -> tuple:
        """Identify strength areas and skill gaps"""
        strengths = [skill for skill, score in skills.items() if score >= 8]
        
        # Identify critical skills that might be missing
        critical_skills = ["javascript", "python", "sql", "algorithms", "system design"]
        missing_skills = [skill for skill in critical_skills if skill not in skills or skills[skill] < 4]
        
        return strengths, missing_skills
    
    def _generate_recommendations(self, skills: Dict[str, float], job_categories: List[Dict[str, Any]]) -> List[str]:
        """Generate personalized learning recommendations"""
        recommendations = []
        
        # Get the top job category match
        if job_categories:
            top_job = job_categories[0]
            recommendations.append(f"Focus on improving skills for {top_job['name']} role")
            
            # Add top 3 skill recommendations from that job category
            for rec in top_job["recommendations"][:3]:
                recommendations.append(rec)
        
        # Add general recommendations based on skill levels
        if "algorithms" in skills and skills["algorithms"] < 5:
            recommendations.append("Improve algorithm problem-solving skills with more LeetCode practice")
        
        # Recommend diversification if too specialized
        tech_categories_with_skills = 0
        for category, skills_list in self.skill_categories.items():
            if any(skill in skills for skill in skills_list):
                tech_categories_with_skills += 1
        
        if tech_categories_with_skills <= 2:
            recommendations.append("Diversify your skill set across more technology categories")
        
        return recommendations
    
    def _calculate_overall_readiness(self, skills: Dict[str, float], job_categories: List[Dict[str, Any]]) -> float:
        """Calculate an overall market readiness score"""
        if not skills:
            return 0
        
        # Base score from skill breadth and depth
        avg_skill_score = sum(skills.values()) / len(skills)
        skill_count_factor = min(1, len(skills) / 10)  # Cap at 10 skills
        
        # Factor in best job category match
        job_match_score = job_categories[0]["readinessScore"] if job_categories else 0
        
        # Weighted average (60% skills, 40% job match)
        overall_score = 0.6 * (avg_skill_score * skill_count_factor * 10) + 0.4 * job_match_score
        
        return min(10, overall_score)  # Cap at 10