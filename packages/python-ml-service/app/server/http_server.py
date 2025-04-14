from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from ..services.pdf_service import PDFService
from ..services.job_scraper import JobScraper
import logging
import traceback
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
            logger.error("Missing jobId parameter")
            return JSONResponse(
                status_code=400,
                content={"error": "Job ID is required"}
            )
        
        try:
            logger.info(f"Processing scrape request for job ID: {jobId}")
            job_data = await job_scraper.scrape(jobId)
            
            if not job_data or not job_data.get("md"):
                logger.error(f"Empty job data returned for job ID: {jobId}")
                return JSONResponse(
                    status_code=404,
                    content={"error": "No job content found"}
                )
            
            logger.info(f"Successfully retrieved job data for ID: {jobId}, content length: {len(job_data['md'])}")
            return job_data
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error processing job ID {jobId}: {error_msg}")
            logger.error(traceback.format_exc())
            
            # Return error without any dummy data
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to scrape job: {error_msg}"}
            )

    return app
