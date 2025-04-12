import requests
from bs4 import BeautifulSoup
import structlog
import time
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
            total=3,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        
    async def scrape(self, job_id: str):
        self.logger.info(f"Scraping job with ID: {job_id}")
        url = f"{self.base_url}{job_id}"
        try:
            job_text = self.get_job_description(url)
            self.logger.info(f"Successfully scraped job description for ID: {job_id}")
            return {"md": job_text}
        except Exception as e:
            self.logger.error("Error scraping job", error=str(e), job_id=job_id)
            raise
        
    def get_job_description(self, url):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            }
            
            self.logger.info(f"Sending request to URL: {url}")
            response = self.session.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                self.logger.error(f"Received non-200 status code: {response.status_code}")
                raise ValueError(f"Failed to fetch job page: HTTP {response.status_code}")
                
            html_content = response.text
            self.logger.info(f"Received HTML content, length: {len(html_content)}")
            
            soup = BeautifulSoup(html_content, 'html.parser')
            job_description = soup.find_all(class_=self.class_name)
            
            if not job_description:
                self.logger.error("No job description found in HTML")
                # Try alternative selectors
                job_description = soup.select(".description__text")
                
                if not job_description:
                    self.logger.error("No job description found with alternative selector")
                    raise ValueError("No job description found")
                    
            job_description_text = job_description[0].get_text()
            self.logger.info(f"Extracted job description, length: {len(job_description_text)}")
            return job_description_text
        except requests.RequestException as e:
            self.logger.error("Request error", error=str(e), url=url)
            raise ValueError(f"Request error: {str(e)}")
        except ValueError as e:
            self.logger.error("Value error", error=str(e), url=url)
            raise
        except Exception as e:
            self.logger.error("Unexpected error", error=str(e), url=url, exc_info=True)
            raise ValueError(f"Failed to scrape job: {str(e)}")
