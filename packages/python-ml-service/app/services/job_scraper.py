import requests
from bs4 import BeautifulSoup
import structlog
import traceback
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import re

logger = structlog.get_logger(__name__)

class JobScraper:
    def __init__(self):
        self.logger = logger.bind(service="JobScraper")
        self.class_name = "show-more-less-html__markup"
        self.base_url = "https://www.linkedin.com/jobs/view/"
        
        # Create session with retry capability
        self.session = requests.Session()
        retries = Retry(
            total=5,
            backoff_factor=0.1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        
    async def scrape(self, job_id: str):
        self.logger.info(f"Scraping job with ID: {job_id}")
        url = f"{self.base_url}{job_id}"
        
        try:
            job_text = self.get_job_description(url)
            if not job_text:
                self.logger.error(f"No job description found for ID: {job_id}")
                raise ValueError("No job content found")
                
            self.logger.info(f"Successfully scraped job description for ID: {job_id}, length: {len(job_text)}")
            return {"md": job_text}
        except Exception as e:
            self.logger.error(f"Error scraping job: {str(e)}")
            self.logger.error(traceback.format_exc())
            raise ValueError(f"Failed to scrape job: {str(e)}")
        
    def get_job_description(self, url):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            }
            
            self.logger.info(f"Making HTTP request to: {url}")
            response = self.session.get(url, headers=headers, timeout=30)
            
            if response.status_code != 200:
                self.logger.error(f"LinkedIn API returned status code: {response.status_code}")
                raise ValueError(f"Failed to fetch job page: HTTP {response.status_code}")
                
            html_content = response.text
            
            if not html_content or len(html_content) < 1000:
                self.logger.error(f"Received insufficient HTML content, length: {len(html_content or '')}")
                raise ValueError("Insufficient HTML content received")
            
            self.logger.info(f"Received HTML content successfully, length: {len(html_content)}")
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Expanded set of selectors to find the job description
            selectors = [
                {"type": "class", "value": self.class_name},  # Primary LinkedIn selector
                {"type": "selector", "value": ".description__text"},  # Alternative selector
                {"type": "selector", "value": ".job-description"},  # General job description
                {"type": "selector", "value": "div[class*='description']"},  # Any description div
                {"type": "selector", "value": "section.description"},  # Section with description class
                {"type": "selector", "value": ".jobs-description"},  # LinkedIn jobs description
                {"type": "selector", "value": ".jobs-description__content"},  # LinkedIn content
                {"type": "selector", "value": ".jobs-box__html-content"},  # LinkedIn box content
                {"type": "selector", "value": "[data-test-id='job-details']"},  # LinkedIn test ID
                {"type": "selector", "value": "[data-test-job-description]"}  # LinkedIn job description attribute
            ]
            
            job_description = None
            
            for selector in selectors:
                if selector["type"] == "class":
                    elements = soup.find_all(class_=selector["value"])
                else:
                    elements = soup.select(selector["value"])
                
                if elements:
                    self.logger.info(f"Found job description with selector: {selector['value']}")
                    job_description = elements[0].get_text(separator='\n', strip=True)
                    break
            
            if not job_description:
                self.logger.info("Direct selectors failed, attempting pattern-based search")
                potential_elements = soup.find_all(lambda tag: tag.name == "div" and 
                                                 tag.attrs.get('class') and 
                                                 any('job' in c.lower() for c in tag.attrs.get('class')) and
                                                 any('description' in c.lower() for c in tag.attrs.get('class')))
                
                if potential_elements:
                    self.logger.info(f"Found job description with pattern matching, element classes: {potential_elements[0].get('class')}")
                    job_description = potential_elements[0].get_text(separator='\n', strip=True)
            
            if not job_description:
                self.logger.info("Pattern matching failed, attempting text search approach")
                # Find sections with keywords typically found in job descriptions
                keywords = ["requirements", "responsibilities", "qualifications", "experience required", "skills"]
                for keyword in keywords:
                    pattern = re.compile(keyword, re.IGNORECASE)
                    elements = soup.find_all(text=pattern)
                    if elements:
                        # Get parent container of the keyword
                        parent = elements[0].parent
                        while parent and parent.name not in ['div', 'section'] and len(parent.get_text()) < 500:
                            parent = parent.parent
                        
                        if parent and len(parent.get_text()) > 200:
                            self.logger.info(f"Found job description via keyword '{keyword}'")
                            job_description = parent.get_text(separator='\n', strip=True)
                            break
            
            # Last resort: get the largest text block that might be the job description
            if not job_description:
                self.logger.info("All approaches failed, attempting to extract largest text block")
                text_blocks = []
                for tag in soup.find_all(['div', 'section']):
                    text = tag.get_text(strip=True)
                    if len(text) > 200:  # Minimum size for job description
                        text_blocks.append((len(text), text))
                
                if text_blocks:
                    text_blocks.sort(reverse=True)  # Sort by size
                    self.logger.info(f"Using largest text block as job description (size: {text_blocks[0][0]})")
                    job_description = text_blocks[0][1]
            
            if not job_description:
                # If still no description found, dump HTML structure for debugging
                self.logger.error("Could not find job description with any method")
                structure_report = self._generate_structure_report(soup)
                self.logger.debug(f"HTML structure overview: {structure_report}")
                raise ValueError("Job description not found in HTML")
            
            return job_description
            
        except requests.RequestException as e:
            self.logger.error(f"Request error: {str(e)}")
            raise ValueError(f"Request error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Error extracting job description: {str(e)}")
            raise ValueError(f"Failed to extract job description: {str(e)}")
    
    def _generate_structure_report(self, soup):
        """Generate a brief report of the HTML structure to help debug scraping issues"""
        structure = []
        
        # Look for key elements that might be interesting
        for tag_name in ['div', 'section']:
            elements = soup.find_all(tag_name, class_=lambda x: x and ('job' in x.lower() or 'description' in x.lower()))
            if elements:
                structure.append(f"Found {len(elements)} {tag_name} elements with job/description in class")
                for i, elem in enumerate(elements[:3]):  # Show first 3
                    structure.append(f"- {tag_name}#{i} classes: {elem.get('class')}, text length: {len(elem.text)}")
        
        # Also report any sections that have substantial text
        large_text_sections = []
        for tag in soup.find_all(['div', 'section']):
            text = tag.get_text(strip=True)
            if len(text) > 500:
                class_names = tag.get('class', [])
                large_text_sections.append((len(text), str(class_names)))
        
        large_text_sections.sort(reverse=True)
        if large_text_sections:
            structure.append("Largest text blocks:")
            for i, (size, classes) in enumerate(large_text_sections[:5]):  # Show top 5
                structure.append(f"- Block #{i}: {size} chars, classes: {classes}")
        
        return "; ".join(structure)
