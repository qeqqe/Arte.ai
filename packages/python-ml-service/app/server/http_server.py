from fastapi import FastAPI, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from ..services.pdf_service import PDFService
from ..services.job_scraper import JobScraper
import logging

def create_app() -> FastAPI:
    app = FastAPI()
    pdf_service = PDFService()
    job_scraper = JobScraper()
    logger = logging.getLogger(__name__)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    @app.post("/parse-pdf")
    async def parse_pdf(file: UploadFile):
        if not file.filename.endswith('.pdf'):
            raise HTTPException(400, "File must be a PDF")
        
        content = await file.read()
        text = await pdf_service.extract_text(content)
        
        return {
            "text": text
        }

    @app.get("/scrape-job")
    async def scrape_job(request: Request):
        query_params = dict(request.query_params)
        logger.info(f"Received request with query params: {query_params}")
        
        # Extract jobId from query parameters
        jobId = query_params.get('jobId')
        logger.info(f"Extracted job ID: {jobId}")
        
        if not jobId:
            logger.error("No job ID provided in request")
            raise HTTPException(400, "Job ID is required")
        
        try:
            logger.info(f"Calling job_scraper.scrape with job ID: {jobId}")
            job_data = await job_scraper.scrape(jobId)
            logger.info(f"Scraper returned: {job_data}")
            return job_data
        except Exception as e:
            logger.error(f"Error scraping job: {str(e)}")
            raise HTTPException(500, f"Failed to scrape job: {str(e)}")

    return app
