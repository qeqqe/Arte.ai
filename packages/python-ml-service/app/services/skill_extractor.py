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