import requests
from bs4 import BeautifulSoup
import structlog

logger = structlog.get_logger(__name__)

class JobScraper:
    def __init__(self):
        self.logger = logger.bind(service="JobScraper")
        self.class_name = "show-more-less-html__markup"
        self.base_url = "https://www.linkedin.com/jobs/view/"
        
    async def scrape(self, job_id: str):
        self.logger.info(f"Scraping job with ID: {job_id}")
        url = f"{self.base_url}{job_id}"
        try:
            job_text = self.get_job_description(url)
            return {"md": job_text}
        except Exception as e:
            self.logger.error("Error scraping job", error=str(e), job_id=job_id)
            raise
        
    def get_job_description(self, url):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            html_content = requests.get(url, headers=headers)
            soup = BeautifulSoup(html_content.text, 'html.parser')
            job_description = soup.find_all(class_=self.class_name)
            if not job_description:
                raise ValueError("No job description found")
            job_description_text = job_description[0].get_text()
            return job_description_text
        except requests.RequestException as e:
            self.logger.error("Request error", error=str(e))
            raise
        except ValueError as e:
            self.logger.error("Value error", error=str(e))
            raise
        except Exception as e:
            self.logger.error("Unexpected error", error=str(e))
            raise
