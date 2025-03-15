import re
import json
import logging
from typing import Dict, List, Any, Optional, Union
from collections import defaultdict
from ..constants.skill_categories import get_skill_categories
from ..constants.skill_alias import get_canonical_skill_name, ALIAS_LOOKUP
from .skill_extractor import SkillExtractor

class JobPostingExtractor:
    """    
    This class processes raw job posting text and identifies key components like
    job title, company, location, skills required, responsibilities, and more.
    """
    
    def __init__(self):
        """Initialize the JobPostingExtractor."""
        self.logger = logging.getLogger(__name__)
        
        self.skill_extractor = SkillExtractor()
        
        # common section headers in job postings
        self.section_patterns = {
            "responsibilities": [
                r"responsibilities", r"duties", r"what you('ll| will) do", 
                r"role overview", r"job description", r"the role", r"your role",
                r"day to day", r"what you'll be doing"
            ],
            "requirements": [
                r"requirements", r"qualifications", r"what you('ll| will) need",
                r"what we('re| are) looking for", r"skills( required)?", r"skill sets?",
                r"basic qualifications", r"minimum qualifications", r"must have",
                r"required skills", r"required experience", r"you have"
            ],
            "preferred": [
                r"preferred( qualifications)?", r"nice to have", r"desired( skills)?",
                r"bonus( points)?", r"plus points", r"additional skills", r"preferred skills"
            ],
            "benefits": [
                r"benefits", r"perks", r"what we offer", r"what (we|you)('ll| will) get",
                r"compensation", r"package", r"why join", r"what's in it for you",
                r"we provide", r"why work (at|with) us"
            ],
            "about_company": [
                r"about( us| the company| the team)?", r"who we are", r"our company",
                r"company overview", r"our mission", r"our story"
            ],
            "application": [
                r"how to apply", r"application process", r"next steps", r"to apply"
            ]
        }
        
        # common job types pattern
        self.job_type_pattern = re.compile(
            r"\b(full[ -]?time|part[ -]?time|contract(or)?|freelance|temporary|permanent|"
            r"intern(ship)?|remote|hybrid|on[ -]?site|in[ -]?office)\b", 
            re.IGNORECASE
        )
        
        # experience level patterns
        self.experience_pattern = re.compile(
            r"\b(junior|entry[ -]?level|graduate|mid[ -]?level|senior|principal|lead|"
            r"staff|experienced|director|manager|associate|executive)\b", 
            re.IGNORECASE
        )
        
        # education patterns
        self.education_pattern = re.compile(
            r"\b(bachelor'?s?|master'?s?|phd|doctorate|mba|bsc|ba|bs|ms|msc|associate'?s? degree|"
            r"high school|secondary school|diploma|certification|degree)\b",
            re.IGNORECASE
        )
        
        # duration pattern
        self.duration_pattern = re.compile(
            r"\b(\d+)[\s-]?(day|week|month|year|yr)s?\b", 
            re.IGNORECASE
        )
        
        # salary pattern regex
        self.salary_pattern = re.compile(
            r"\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:[-–—to]+|and)\s*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(k|thousand|m|million|annum|annual|yearly|/yr|per year|/hour|hourly|/hr|per hour)",
            re.IGNORECASE
        )
        
        # deadline pattern
        self.deadline_pattern = re.compile(
            r"(?:deadline|apply by|close[sd]? on):\s?([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+,?\s+\d{4}|\d{1,2}/\d{1,2}/\d{2,4}|\d{4}-\d{2}-\d{2})",
            re.IGNORECASE
        )

    def extract_job_info(self, job_text: str) -> Dict[str, Any]:
        if not job_text:
            self.logger.warning("Empty job text provided")
            return {}
        
        try:
            job_text = self._clean_text(job_text)
            
            job_title = self._extract_job_title(job_text)
            company = self._extract_company(job_text)
            location = self._extract_location(job_text)
            
            sections = self._split_into_sections(job_text)
            
            job_type = self._extract_job_type(job_text)
            experience_level = self._extract_experience_level(job_text)
            salary_range = self._extract_salary(job_text)
            education = self._extract_education(sections)
            duration = self._extract_duration(job_text)
            deadline = self._extract_deadline(job_text)

            # extract section content
            description = self._extract_description(sections)
            responsibilities = sections.get("responsibilities", "")
            requirements = sections.get("requirements", "")
            preferred_skills = sections.get("preferred", "")
            benefits = sections.get("benefits", "")
            about_company = sections.get("about_company", "")
            how_to_apply = sections.get("application", "")

            # if (!specific sections) {try to extract the full text}
            if not requirements:
                requirements = self._extract_requirements_fallback(job_text)
            
            # extract using the SkillExtractor
            # for best results, analyze both requirements and preferred skills
            skill_text = requirements + " " + preferred_skills
            if not skill_text.strip():
                skill_text = job_text  # Fallback to full text if sections weren't found
                
            skills_data = self.skill_extractor.extract_skills_from_text(skill_text)
            required_skills = self._extract_required_skills(skill_text)
            
            job_info = {
                "job_title": job_title,
                "company": company,
                "location": location,
                "job_type": job_type,
                "experience_level": experience_level,
                "salary_range": salary_range,
                "duration": duration,
                "application_deadline": deadline,
                "education_requirements": education,
                "description": description,
                "responsibilities": self._text_to_bullet_points(responsibilities),
                "requirements": {
                    "text": self._text_to_bullet_points(requirements),
                    "skills": required_skills,
                },
                "preferred_qualifications": self._text_to_bullet_points(preferred_skills),
                "benefits": self._text_to_bullet_points(benefits),
                "about_company": about_company,
                "how_to_apply": how_to_apply,
                "skills_categorized": skills_data
            }
            
            return {k: v for k, v in job_info.items() if v}
            
        except Exception as e:
            self.logger.error(f"Error extracting job info: {str(e)}")
            return {"error": str(e), "raw_text": job_text}
    
    def _clean_text(self, text: str) -> str:
        """Clean the job text for better processing."""
        # replace multiple newlines with a single one
        text = re.sub(r'\n+', '\n', text)
        # replace multiple spaces with a single one
        text = re.sub(r'\s+', ' ', text)
        # remove HTML-like tags if present
        text = re.sub(r'<[^>]+>', '', text)
        return text.strip()
    
    def _extract_job_title(self, text: str) -> str:
        """Extract job title from text."""
        # try common patterns for job titles
        title_match = re.search(r'^(.*?)(:|–|-|at|\bat\b|\|)', text, re.IGNORECASE)
        if title_match:
            return title_match.group(1).strip()
            
        # try to find "Job Title:" pattern
        title_match = re.search(r'(?:job title|position|role):\s*(.*?)(?:\n|$)', text, re.IGNORECASE)
        if title_match:
            return title_match.group(1).strip()
        
        # if no match, return first line limited to reasonable length
        first_line = text.split('\n')[0][:100]
        return first_line.strip()
    
    def _extract_company(self, text: str) -> str:
        """Extract company name from text."""
        # look for company: pattern
        company_match = re.search(r'(?:company|employer|organization):\s*(.*?)(?:\n|$)', text, re.IGNORECASE)
        if company_match:
            return company_match.group(1).strip()
            
        # look for "at Company" pattern after job title
        company_match = re.search(r'(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&.,]+)(?:\n|$|\sin\s)', text)
        if company_match:
            return company_match.group(1).strip()
            
        # default to unknown
        return "Not specified"
    
    def _extract_location(self, text: str) -> str:
        """Extract job location from text."""
        # look for location: pattern
        location_match = re.search(r'(?:location|place|site|position location):\s*(.*?)(?:\n|$)', text, re.IGNORECASE)
        if location_match:
            return location_match.group(1).strip()
            
        # look for remote pattern
        if re.search(r'\bremote\b', text, re.IGNORECASE):
            return "Remote"
            
        # look for "in Location" pattern
        location_match = re.search(r'(?:in|at)\s+([A-Z][A-Za-z\s,]+)(?:\n|$|\sfor\s)', text)
        if location_match:
            return location_match.group(1).strip()
            
        return "Not specified"
    
    def _split_into_sections(self, text: str) -> Dict[str, str]:
        """
        Split the job posting text into different sections based on common headers.
        
        Returns a dictionary mapping section names to their content.
        """
        sections = defaultdict(str)
        
        # find all potential section headers
        headers = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower()
            for section_name, patterns in self.section_patterns.items():
                for pattern in patterns:
                    if re.search(r'\b' + pattern + r'\b', line_lower, re.IGNORECASE):
                        headers.append((i, section_name, line))
                        break
        
        # sort headers by their position
        headers.sort(key=lambda x: x[0])
        
        # extract content between headers
        for i in range(len(headers)):
            start_idx = headers[i][0] + 1
            end_idx = headers[i+1][0] if i+1 < len(headers) else len(lines)
            section_name = headers[i][1]
            
            # join lines for this section
            section_content = '\n'.join(lines[start_idx:end_idx]).strip()
            sections[section_name] = section_content
        
        return dict(sections)
    
    def _extract_job_type(self, text: str) -> List[str]:
        """Extract job type(s) from text."""
        job_types = []
        matches = self.job_type_pattern.findall(text.lower())
        
        for match in matches:
            # get the first item if the match is a tuple from capturing groups
            if isinstance(match, tuple):
                match = match[0]
            
            # normalize variations
            if "full" in match:
                job_types.append("Full-time")
            elif "part" in match:
                job_types.append("Part-time")
            elif "contract" in match:
                job_types.append("Contract")
            elif "freelance" in match:
                job_types.append("Freelance")
            elif "temp" in match:
                job_types.append("Temporary")
            elif "perm" in match:
                job_types.append("Permanent")
            elif "intern" in match:
                job_types.append("Internship")
            
            # work modes
            if "remote" in match:
                job_types.append("Remote")
            elif "hybrid" in match:
                job_types.append("Hybrid")
            elif "site" in match or "office" in match:
                job_types.append("On-site")
                
        # remove duplicates
        return list(set(job_types))
    
    def _extract_experience_level(self, text: str) -> str:
        """Extract experience level from text."""
        matches = self.experience_pattern.findall(text.lower())
        if not matches:
            return ""
        
        # count occurrences of each level
        level_counts = defaultdict(int)
        
        for match in matches:
            if "junior" in match or "entry" in match or "graduate" in match:
                level_counts["Entry-level"] += 1
            elif "mid" in match:
                level_counts["Mid-level"] += 1
            elif "senior" in match or "principal" in match or "lead" in match:
                level_counts["Senior"] += 1
            elif "director" in match or "executive" in match:
                level_counts["Executive"] += 1
            elif "manager" in match:
                level_counts["Manager"] += 1
        
        # return the most frequently mentioned level
        if level_counts:
            return max(level_counts.items(), key=lambda x: x[1])[0]
        return ""
    
    def _extract_salary(self, text: str) -> Dict[str, Any]:
        """Extract salary information from text."""
        salary_match = self.salary_pattern.search(text)
        if not salary_match:
            return {}
            
        try:
            min_salary = salary_match.group(1).replace(',', '')
            max_salary = salary_match.group(2).replace(',', '')
            
            # try to convert to numeric
            min_salary_num = float(min_salary)
            max_salary_num = float(max_salary)
            
            period = salary_match.group(3).lower()
            
            if 'k' in period or 'thousand' in period:
                min_salary_num *= 1000
                max_salary_num *= 1000
                period = 'yearly'
            elif 'm' in period or 'million' in period:
                min_salary_num *= 1000000
                max_salary_num *= 1000000
                period = 'yearly'
                
            if any(x in period for x in ['annum', 'annual', 'yearly', '/yr', 'per year']):
                period = 'yearly'
            elif any(x in period for x in ['hour', '/hr', '/hour']):
                period = 'hourly'
            else:
                period = 'yearly'  # default
            
            return {
                "min": int(min_salary_num),
                "max": int(max_salary_num),
                "period": period,
                "currency": "USD"  # default
            }
        except Exception as e:
            self.logger.warning(f"Failed to parse salary: {e}")
            return {}
    
    def _extract_education(self, sections: Dict[str, str]) -> List[str]:
        """Extract education requirements."""
        # look in requirements section first
        text = sections.get("requirements", "")
        if not text:
            # fall back to full text
            text = " ".join(sections.values())
            
        edu_matches = self.education_pattern.findall(text)
        if not edu_matches:
            return []
            
        # normalize education matches
        normalized = []
        for match in edu_matches:
            match_lower = match.lower()
            if any(x in match_lower for x in ['bachelor', 'bsc', 'ba', 'bs']):
                normalized.append("Bachelor's degree")
            elif any(x in match_lower for x in ['master', 'msc', 'ms']):
                normalized.append("Master's degree")
            elif any(x in match_lower for x in ['phd', 'doctorate']):
                normalized.append("PhD")
            elif 'mba' in match_lower:
                normalized.append("MBA")
            elif any(x in match_lower for x in ['associate', 'diploma']):
                normalized.append("Associate degree/Diploma")
            elif any(x in match_lower for x in ['high school', 'secondary']):
                normalized.append("High School diploma")
            elif 'certification' in match_lower:
                normalized.append("Professional certification")
            elif 'degree' in match_lower:
                normalized.append("Degree (unspecified)")
                
        # remove duplicates
        return list(set(normalized))
    
    def _extract_duration(self, text: str) -> str:
        """Extract job duration for temporary positions."""
        duration_match = self.duration_pattern.search(text)
        if not duration_match:
            return ""
            
        number = duration_match.group(1)
        unit = duration_match.group(2).lower()
        
        # normalize unit to full word
        if unit.startswith('d'):
            unit = "days"
        elif unit.startswith('w'):
            unit = "weeks"
        elif unit.startswith('m'):
            unit = "months"
        elif unit.startswith('y') or unit.startswith('yr'):
            unit = "years"
            
        return f"{number} {unit}"
    
    def _extract_deadline(self, text: str) -> str:
        """Extract application deadline if mentioned."""
        deadline_match = self.deadline_pattern.search(text)
        if deadline_match:
            return deadline_match.group(1)
        return ""
    
    def _extract_description(self, sections: Dict[str, str]) -> str:
        """Extract or generate a job description summary."""
        # if we have an explicit job description section, use that
        if sections.get("responsibilities"):
            return sections.get("responsibilities").split('\n')[0]
            
        # otherwise, try to construct one from the beginning of the text
        first_section = next(iter(sections.values())) if sections else ""
        if first_section:
            # get first paragraph (up to 3 sentences or 300 chars)
            sentences = first_section.split('.')
            description = '.'.join(sentences[:min(3, len(sentences))])
            if len(description) > 300:
                description = description[:300] + "..."
            return description
            
        return ""
    
    def _extract_requirements_fallback(self, text: str) -> str:
        """Attempt to extract requirements section if section identification failed."""
        # try to find paragraphs containing requirement-like keywords
        requirement_indicators = [
            r"required", r"must have", r"minimum", r"qualification", 
            r"experience with", r"familiar with", r"proficient in",
            r"knowledge of", r"ability to"
        ]
        
        pattern = r"(" + r"|".join(requirement_indicators) + r")"
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        requirements = []
        for match in matches:
            # get the paragraph containing this match
            start = text.rfind('\n', 0, match.start()) + 1
            if start < 0:
                start = 0
            end = text.find('\n', match.end())
            if end < 0:
                end = len(text)
                
            paragraph = text[start:end].strip()
            if paragraph and len(paragraph) > 10:
                requirements.append(paragraph)
                
        return "\n".join(requirements)
    
    def _extract_required_skills(self, text: str) -> List[str]:
        """Extract a flat list of required skills."""
        skills_by_category = self.skill_extractor.extract_skills_from_text(text)
        
        # flatten the skills from all categories
        all_skills = []
        for category_skills in skills_by_category.values():
            all_skills.extend(category_skills)
            
        # add any explicitly mentioned "proficiency in X" or "experience with Y"
        proficiency_pattern = re.compile(
            r"(?:proficiency|experience|familiar|knowledge)(?:\s+\w+){0,2}\s+(?:in|with|of)\s+([A-Za-z0-9+# ]{3,30})",
            re.IGNORECASE
        )
        
        for match in proficiency_pattern.finditer(text):
            skill = match.group(1).strip()
            # get canonical name for the skill
            canonical_skill = get_canonical_skill_name(skill)
            if canonical_skill and canonical_skill not in all_skills:
                all_skills.append(canonical_skill)
                
        return sorted(list(set(all_skills)))
    
    def _text_to_bullet_points(self, text: str) -> List[str]:
        """Convert text into bullet points."""
        if not text:
            return []
            
        # split by common bullet point indicators
        bullet_pattern = re.compile(r'(?:^|\n)(?:\s*[-•*+]\s*|\s*\d+[.)\]]\s*|\s*[A-Za-z][.)\]]\s*)', re.MULTILINE)
        
        # if there are existing bullet points, use them
        if bullet_pattern.search(text):
            bullets = bullet_pattern.split(text)
            # remove empty bullets and clean up
            return [b.strip() for b in bullets if b.strip()]
            
        # otherwise, split by sentences or newlines
        if '.' in text:
            bullets = [s.strip() + '.' for s in text.split('.') if s.strip()]
        else:
            bullets = [line.strip() for line in text.split('\n') if line.strip()]
            
        return bullets

    def extract_skills_from_job(self, job_text: str) -> Dict[str, List[str]]:
        """
        Extract only skills from job posting text, using the skill categories system.
        
        Args:
            job_text: Raw job posting text
            
        Returns:
            Dictionary of skills categorized by domain
        """
        if not job_text:
            return {}
            
        try:
            # first extract job info to identify requirements sections
            job_info = self.extract_job_info(job_text)
            
            # if we successfully extracted structured requirements
            if job_info.get("requirements") and job_info["requirements"].get("text"):
                # focus on requirements section for better precision
                requirements_text = " ".join(job_info["requirements"]["text"])
                if job_info.get("preferred_qualifications"):
                    requirements_text += " " + " ".join(job_info["preferred_qualifications"])
                    
                # extract skills from focused text
                return self.skill_extractor.extract_skills_from_text(requirements_text)
            else:
                # fall back to extracting from full text
                return self.skill_extractor.extract_skills_from_text(job_text)
                
        except Exception as e:
            self.logger.error(f"Error extracting skills from job: {str(e)}")
            return {}
