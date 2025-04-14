import requests
from bs4 import BeautifulSoup
import structlog
import traceback
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

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
            
            # Try multiple selectors in sequence to find job description
            selectors = [
                {"type": "class", "value": self.class_name},  # Primary LinkedIn selector
                {"type": "selector", "value": ".description__text"},  # Alternative selector 
                {"type": "selector", "value": ".job-description"},  # General job description
                {"type": "selector", "value": "div[class*='description']"}  # Any description div
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
                self.logger.error("Could not find job description with any selector")
                raise ValueError("Job description not found in HTML")
            
            return job_description
            
        except requests.RequestException as e:
            self.logger.error(f"Request error: {str(e)}")
            raise ValueError(f"Request error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Error extracting job description: {str(e)}")
            raise ValueError(f"Failed to extract job description: {str(e)}")
