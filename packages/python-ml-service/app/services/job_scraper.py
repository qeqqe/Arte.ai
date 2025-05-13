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
            job_data = self.get_job_description(url)
            if not job_data or not job_data.get('description'):
                self.logger.error(f"No job description found for ID: {job_id}")
                raise ValueError("No job content found")
                
            self.logger.info(f"Successfully scraped job information for ID: {job_id}")
            return job_data
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
            
            job_description_selectors = [
                {"type": "class", "value": self.class_name},  # primary selector .show-more-less-html__markup
            ]
            
            organization_selectors = {
                "org_logo": {"type": "selector", "value": ".artdeco-entity-image.artdeco-entity-image--square-5"},
                "org_name": {"type": "selector", "value": ".topcard__org-name-link"},
                "work_location": {"type": "selector", "value": ".topcard__flavor.topcard__flavor--bullet"},
                "timestamp": {"type": "selector", "value": ".posted-time-ago__text"}
            }
            
            job_description = None
            primary_selector = {"type": "class", "value": self.class_name}  # show-more-less-html__markup
            
            elements = soup.find_all(class_=primary_selector["value"])
            if elements:
                self.logger.info(f"Found job description with primary selector: {primary_selector['value']}")
                job_description = elements[0].get_text(separator='\n', strip=True)
            
            # try other selectors
            if not job_description:
                for selector in job_description_selectors:
                    if selector["type"] == "class":
                        elements = soup.find_all(class_=selector["value"])
                    else:
                        elements = soup.select(selector["value"])
                    
                    if elements:
                        self.logger.info(f"Found job description with backup selector: {selector['value']}")
                        job_description = elements[0].get_text(separator='\n', strip=True)
                        break
            
            if not job_description:
                job_description = self._find_job_description_alternative_methods(soup)
            
            org_info = {}
            for info_type, selector in organization_selectors.items():
                try:
                    if selector["type"] == "class":
                        elements = soup.find_all(class_=selector["value"])
                    else:
                        elements = soup.select(selector["value"])
                    
                    if elements:
                        if info_type == "org_logo":
                            logo_url = self._extract_logo_url(elements[0], soup)
                            if logo_url:
                                org_info[info_type] = logo_url
                                self.logger.info(f"Found {info_type}: {logo_url[:50]}...")
                            else:
                                org_info[info_type] = ""
                                self.logger.warning(f"Could not extract logo URL")
                        else:
                            # for text content fields
                            org_info[info_type] = elements[0].get_text(strip=True)
                            self.logger.info(f"Found {info_type} with selector: {selector['value']}")
                except Exception as e:
                    self.logger.warning(f"Error extracting {info_type}: {str(e)}")
                    org_info[info_type] = ""
            
            result = {
                "md": job_description,  # for backward compatibility
                "description": job_description,
                "organization": {
                    "logo_url": org_info.get("org_logo", ""),
                    "name": org_info.get("org_name", ""),
                    "location": org_info.get("work_location", ""),
                },
                "posted_time_ago": org_info.get("timestamp", "")  # job post timestamp "2 weeks ago", "3 days ago"
            }
            
            return result
            
        except requests.RequestException as e:
            self.logger.error(f"Request error: {str(e)}")
            raise ValueError(f"Request error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Error extracting job description: {str(e)}")
            raise ValueError(f"Failed to extract job description: {str(e)}")
    
    def _extract_logo_url(self, element, soup):
        """Extract logo URL using direct, effective approach"""
        try:
            self.logger.info("Extracting logo URL")
            
            # linkedin-specific selectors in order of specificity
            selectors = [
                "img.artdeco-entity-image",
                "img.contextual-sign-in-modal__img",
                "img.lazy-loaded",
                "img[alt*='company']",
                "img[alt*='logo']"
            ]
            
            for selector in selectors:
                image = soup.select_one(selector)
                if image:
                    if image.get("src") and image.get("src").startswith("http"):
                        self.logger.info(f"Found logo URL with selector {selector}: {image.get('src')}")
                        return image.get("src")
                        
                    # fallback
                    elif image.get("data-delayed-url"):
                        self.logger.info(f"Found logo URL (delayed) with selector {selector}: {image.get('data-delayed-url')}")
                        return image.get("data-delayed-url")
            
            #  regex pattern as a fallback
            pattern_image = soup.find("img", attrs={"class": re.compile(r".*company-logo.*|.*logo.*|.*entity-image.*")})
            if pattern_image:
                if pattern_image.get("src") and pattern_image.get("src").startswith("http"):
                    self.logger.info(f"Found logo URL with regex pattern: {pattern_image.get('src')}")
                    return pattern_image.get("src")
                elif pattern_image.get("data-delayed-url"):
                    self.logger.info(f"Found logo URL (delayed) with regex pattern: {pattern_image.get('data-delayed-url')}")
                    return pattern_image.get("data-delayed-url")
            
            # last resort: just get any image
            all_images = soup.find_all("img")
            for img in all_images:
                if img.get("src") and img.get("src").startswith("http"):
                    self.logger.info(f"Using fallback image: {img.get('src')}")
                    return img.get("src")
                elif img.get("data-delayed-url"):
                    self.logger.info(f"Using fallback delayed image: {img.get('data-delayed-url')}")
                    return img.get("data-delayed-url")
            
            self.logger.warning("No logo URL found with any method")
            return ""
        except Exception as e:
            self.logger.error(f"Error in _extract_logo_url: {str(e)}")
            return ""
    def _find_job_description_alternative_methods(self, soup):
        """Try alternative methods to find job description"""
        job_description = None
        
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
            keywords = ["requirements", "responsibilities", "qualifications", "experience required", "skills"]
            for keyword in keywords:
                pattern = re.compile(keyword, re.IGNORECASE)
                elements = soup.find_all(text=pattern)
                if elements:
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
            # if no description found, dump HTML structure for debugging
            self.logger.error("Could not find job description with any method")
            structure_report = self._generate_structure_report(soup)
            self.logger.debug(f"HTML structure overview: {structure_report}")
            raise ValueError("Job description not found in HTML")
        
        return job_description
    
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
