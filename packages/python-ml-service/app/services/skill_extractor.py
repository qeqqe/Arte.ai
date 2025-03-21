import json
import re
import logging
from collections import defaultdict
from typing import Dict, List, Set
from ..constants.skill_categories import get_skill_categories
from ..constants.skill_alias import get_canonical_skill_name, build_alias_lookup, ALIAS_LOOKUP

class SkillExtractor:
    
    def __init__(self, user_stats=None):
        """
        Initialize the SkillExtractor with user stats if provided.
        
        Args:
            user_stats: User statistics data as a string (JSON) or dict
        """
        self.logger = logging.getLogger(__name__)
        
        # common skills and aliases
        self.skill_categories = get_skill_categories()
        self.alias_lookup = ALIAS_LOOKUP  # pre built lookup table for performance
        
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
            
        # Compile regex patterns for skill detection using the canonical names
        self.category_patterns = {}
        self.all_skills_pattern = self._build_all_skills_pattern()
        
        for category, skills in self.skill_categories.items():
            # Create regex patterns that match whole words only
            patterns = [r'\b' + re.escape(skill) + r'\b' for skill in skills]
            self.category_patterns[category] = re.compile('|'.join(patterns), re.IGNORECASE)
    
    def _build_all_skills_pattern(self):
        """
        Build a regex pattern that matches any skill from any category.
        This is more efficient than checking each category separately.
        """
        all_skills = set()
        for skills in self.skill_categories.values():
            all_skills.update([skill.lower() for skill in skills])
            
        # Also add key aliases that might be important to catch
        for canonical, aliases in self.alias_lookup.items():
            all_skills.add(canonical.lower())
            
        # Create the pattern with word boundaries
        patterns = [r'\b' + re.escape(skill) + r'\b' for skill in all_skills]
        return re.compile('|'.join(patterns), re.IGNORECASE)
  

  
    def extract_pss_from_leetcode(self) -> Dict[str, any]:
        """
        Extract problem-solving skills from user's LeetCode statistics.
        
        Returns:
            A dictionary containing a numerical rating (0-100) and a qualitative assessment
            of the user's problem-solving skills based on LeetCode performance.
        """
        try:
            leetcode_stats = self.user_stats.get("leetCodeStat", {})
            if not leetcode_stats:
                return {}
                
            total_solved = leetcode_stats.get("totalSolved", 0)
            total_questions = leetcode_stats.get("totalQuestions", 0)
            easy_solved = leetcode_stats.get("easySolved", 0)
            medium_solved = leetcode_stats.get("mediumSolved", 0)
            hard_solved = leetcode_stats.get("hardSolved", 0)
            acceptance_rate = leetcode_stats.get("acceptanceRate", 0) / 100   
            ranking = leetcode_stats.get("ranking", 0)
            
            # handle edge cases to avoid division by 0
            if total_questions == 0 or ranking == 0:
                return {"rating": 0, "level": "Unknown", "details": leetcode_stats}
            
            # Use logarithmic weightings for different difficulty levels
            # Easy: 1, Medium: 3, Hard: 6
            weighted_solved = (easy_solved * 1) + (medium_solved * 3) + (hard_solved * 6)
            
            # Component 1: problem difficulty & volume score (0-50 points)
            # use logarithmic scaling to value early problems more
            # this means first 100-200 problems give significant gains, then diminishing returns
            log_base = 1.1  # Adjusting this affects how quickly gains diminish
            difficulty_scale = 30 * (1 - (1 / (log_base ** (weighted_solved / 100))))
            
            # add bonus for having significant numbers of medium and hard problems
            medium_ratio = medium_solved / max(1, total_solved)
            hard_ratio = hard_solved / max(1, total_solved)
            difficulty_bonus = (medium_ratio * 10) + (hard_ratio * 15)
            
            difficulty_score = min(50, difficulty_scale + difficulty_bonus)
            
            # Component 2:problem-solving breadth (0-20 points)
            # recognize that solving even 5-7% of all LeetCode problems is significant
            # use logarithmic scaling that rewards solving up to ~500 problems
            percentage_solved = total_solved / max(1, total_questions)
            breadth_scale = 20 * (1 - (1 / (log_base ** (total_solved / 50))))
            breadth_score = min(20, breadth_scale)
            
            # Component 3: solution quality (0-15 points)
            # higher acceptance rate = better solution quality
            quality_score = min(15, acceptance_rate * 15)
            
            # Component 4: Community Standing (0-15 points)
            # top 50K is already quite good, world-class would be top 5K
            estimated_total_users = 5000000
            # logarithmic scaling for ranking
            if ranking <= 5000:
                standing_score = 15  # top 5K users get full score
            elif ranking <= 50000:
                standing_score = 12 + (3 * (1 - (ranking - 5000) / 45000))
            elif ranking <= 200000:
                standing_score = 8 + (4 * (1 - (ranking - 50000) / 150000))
            else:
                standing_score = 8 * (1 - min(1, (ranking - 200000) / 800000))
            
            # Final Score Calculation (0-100)
            final_score = round(difficulty_score + breadth_score + quality_score + standing_score)
            
            # more realistic skill level determination
            if final_score >= 85:
                level = "Expert"
            elif final_score >= 70:
                level = "Advanced"
            elif final_score >= 50:
                level = "Intermediate"
            elif final_score >= 30:
                level = "Beginner"
            else:
                level = "Novice"
                
            # ensure level is appropriate for total problems solved
            # someone who solved 500+ problems shouldn't be below advanced regardless of other factors
            if total_solved >= 500 and level not in ["Advanced", "Expert"]:
                level = "Advanced"
                # adjust score if necessary
                if final_score < 70:
                    final_score = 70  # min score for Advanced
            elif total_solved >= 300 and level not in ["Intermediate", "Advanced", "Expert"]:
                level = "Intermediate"
                if final_score < 50:
                    final_score = 50  # min score for Intermediate
            elif total_solved >= 100 and level == "Novice":
                level = "Beginner"
                if final_score < 30:
                    final_score = 30  # min score for Beginner
            
            return {
                "rating": final_score,
                "level": level,
                "details": {
                    "totalSolved": total_solved,
                    "totalQuestions": total_questions,
                    "easySolved": easy_solved,
                    "mediumSolved": medium_solved,
                    "hardSolved": hard_solved,
                    "acceptanceRate": acceptance_rate * 100,  
                    "ranking": ranking,
                    "components": {
                        "difficultyScore": round(difficulty_score, 2),
                        "breadthScore": round(breadth_score, 2),
                        "qualityScore": round(quality_score, 2),
                        "standingScore": round(standing_score, 2)
                    }
                }
            }
        
        except Exception as e:
            self.logger.error(f"Error extracting LeetCode stats: {str(e)}")
            return {"rating": 0, "level": "Error", "error": str(e)}
    
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
            if not text:
                return {}
                
            found_skills = defaultdict(set)
            
            # First pass: use the combined pattern to find all potential skills
            matches = self.all_skills_pattern.findall(text)
            
            # Process each match
            for match in matches:
                # Get canonical name for the skill
                canonical_skill = get_canonical_skill_name(match)
                
                # Simple confidence scoring - could be enhanced with ML/NLP in production
                confidence = min(1.0, (len(canonical_skill) / 10) + 0.2)  # Base confidence on length with a minimum
                
                # Skip if below threshold
                if confidence < threshold:
                    continue
                    
                # Find which category this skill belongs to
                self._categorize_skill(canonical_skill, found_skills)
            
            # Convert sets to lists for JSON serialization and sort alphabetically
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
                    canonical_lang = get_canonical_skill_name(lang)
                    self._categorize_skill(canonical_lang, found_skills)

                # Extract from repository topics
                for topic in repo.get("repositoryTopics", []):
                    # Handle hyphenated topics and other separators
                    for separator in ['-', '_', ' ', '.']:
                        if separator in topic:
                            for subtopic in topic.split(separator):
                                if len(subtopic) > 2:  # Skip very short fragments
                                    canonical_topic = get_canonical_skill_name(subtopic)
                                    self._categorize_skill(canonical_topic, found_skills)
                    
                    # Also check the topic as a whole
                    canonical_topic = get_canonical_skill_name(topic)
                    self._categorize_skill(canonical_topic, found_skills)
                
                # Extract from description
                if repo.get("description"):
                    # Use the all skills pattern for efficiency
                    matches = self.all_skills_pattern.findall(repo["description"])
                    for match in matches:
                        canonical_skill = get_canonical_skill_name(match)
                        self._categorize_skill(canonical_skill, found_skills)
                            
                # Extract from primary language
                if repo.get("primaryLanguage"):
                    canonical_lang = get_canonical_skill_name(repo["primaryLanguage"])
                    self._categorize_skill(canonical_lang, found_skills)
            
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
        canonical_skill = get_canonical_skill_name(skill)
        categorized = False

        # Check each category to see if the skill belongs there
        for category, skills_list in self.skill_categories.items():
            skills_lower = [s.lower() for s in skills_list]
            if canonical_skill.lower() in skills_lower:
                found_skills[category].add(canonical_skill)
                categorized = True
                break
        
        # Special case handling for skills that might appear in multiple categories
        if canonical_skill in ["kotlin", "swift"]:
            # These are both languages and used in mobile development
            found_skills["languages"].add(canonical_skill)
            found_skills["mobile"].add(canonical_skill)
            categorized = True
        
        elif canonical_skill in ["rust"]:
            # Rust is both a language and used in blockchain (for Solana)
            if "blockchain" in self.skill_categories:
                found_skills["languages"].add(canonical_skill)
                found_skills["blockchain"].add(canonical_skill)
                categorized = True
                
        elif canonical_skill in ["tensorflow", "pytorch"]:
            # AI libraries that have mobile versions
            found_skills["ai_ml"].add(canonical_skill)
            found_skills["mobile"].add(canonical_skill + " mobile")
            categorized = True
                
        # If the skill doesn't match any category, add it to 'others'
        if not categorized:
            found_skills["others"].add(canonical_skill)
    
    def get_skill_categories_for_skill(self, skill: str) -> List[str]:
        """
        Get all categories that a given skill belongs to.
        
        Args:
            skill: The skill name to find categories for
            
        Returns:
            List of category names where the skill is found
        """
        if not skill:
            return []
            
        canonical_skill = get_canonical_skill_name(skill)
        categories = []
        
        for category, skills_list in self.skill_categories.items():
            if canonical_skill.lower() in [s.lower() for s in skills_list]:
                categories.append(category)
                
        return categories
    
    def merge_skill_results(self, *skill_dicts) -> Dict[str, List[str]]:
        """
        Merge multiple skill dictionaries into one.
        
        Args:
            *skill_dicts: Dictionaries of categorized skills
            
        Returns:
            Combined dictionary of categorized skills with duplicates removed
        """
        merged = defaultdict(set)
        
        for skill_dict in skill_dicts:
            for category, skills in skill_dict.items():
                merged[category].update(skills)
        
        # Convert sets to sorted lists
        return {category: sorted(list(skills)) for category, skills in merged.items()}
    
    def analyze_github_and_text(self, text: str = None) -> Dict[str, List[str]]:
        """
        Perform a comprehensive skill analysis by combining GitHub and text extraction.
        
        Args:
            text: Optional additional text to analyze
            
        Returns:
            Combined dictionary of categorized skills
        """
        github_skills = self.extract_skills_from_github()
        
        if text:
            text_skills = self.extract_skills_from_text(text)
            return self.merge_skill_results(github_skills, text_skills)
        else:
            return github_skills