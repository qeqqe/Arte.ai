import logging
import asyncio
from typing import Dict, Optional
from crawl4ai import AsyncWebCrawler

class JobScraper:
    """
    A service class to scrape job details from LinkedIn using crawl4ai.
    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def scrape(self, job_id: str, max_retries: int = 3, timeout: int = 30) -> Dict[str, Optional[str]]:
        """
        Scrape a LinkedIn job posting by ID and return the content in markdown format.
        
        Args:
            job_id: The LinkedIn job ID to scrape
            max_retries: Maximum number of retry attempts
            timeout: Timeout in seconds for the scraping operation
            
        Returns:
            Dict containing markdown content and status
        """
        if not job_id or not isinstance(job_id, str):
            self.logger.error(f"Invalid job ID provided: {job_id}")
            return {"md": None, "status": "error", "message": "Invalid job ID provided"}
 
        url = f"https://www.linkedin.com/jobs/view/{job_id}"
        
        retry_count = 0
        while retry_count < max_retries:
            try:
                self.logger.info(f"Attempting to scrape job ID: {job_id}")
                
                async with AsyncWebCrawler() as crawler:
                    # create a task with timeout
                    task = asyncio.create_task(crawler.arun(url=url))
                    result = await asyncio.wait_for(task, timeout=timeout)
                
                if not result or not result.markdown:
                    self.logger.warning(f"No content found for job ID: {job_id}")
                    return {"md": None, "status": "error", "message": "No content found"}
                
                self.logger.info(f"Successfully scraped job ID: {job_id}")
                return {"md": result.markdown, "status": "success", "message": None}
                
            except asyncio.TimeoutError:
                retry_count += 1
                self.logger.warning(f"Timeout while scraping job ID: {job_id}. Retry {retry_count}/{max_retries}")
            except Exception as e:
                self.logger.error(f"Error scraping job ID {job_id}: {str(e)}")
                return {"md": None, "status": "error", "message": str(e)}
                
        self.logger.error(f"Failed to scrape job ID after {max_retries} attempts: {job_id}")
        return {"md": None, "status": "error", "message": f"Failed after {max_retries} attempts"}
