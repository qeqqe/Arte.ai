from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from ..services.pdf_service import PDFService
from ..services.job_scraper import JobScraper
import logging
from fastapi.responses import JSONResponse

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
    async def parse_pdf(file: UploadFile = File(...)):
        if not file.filename.endswith('.pdf'):
            raise HTTPException(400, "File must be a PDF")
        
        content = await file.read()
        text = await pdf_service.extract_text(content)
        
        return {
            "text": text
        }

    @app.get("/scrape-job")
    async def scrape_job(jobId: str):
        if not jobId:
            return JSONResponse(
                status_code=400,
                content={"error": "Job ID is required"}
            )
        
        try:
            logger.info(f"Scraping job with ID: {jobId}")
            job_data = await job_scraper.scrape(jobId)
            return job_data
        except Exception as e:
            logger.error(f"Error scraping job: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to scrape job: {str(e)}"}
            )

    return app
