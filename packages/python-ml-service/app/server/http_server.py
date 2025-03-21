from fastapi import FastAPI, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from ..services.pdf_service import PDFService
from ..services.skill_extractor import SkillExtractor
from ..services.job_scraper import JobScraper
from ..services.job_skill_extractor import JobPostingExtractor
import logging
import json

def create_app() -> FastAPI:
    app = FastAPI()
    pdf_service = PDFService()
    job_scraper = JobScraper()
    skill_extractor = SkillExtractor()
    job_extractor = JobPostingExtractor()  # Add the job extractor
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

    @app.post("/extract-skills")
    async def extract_skills(request: Request):
        try:
            data = await request.json()
            text = data.get("text")
            
            if not text:
                logger.error("No text field provided in request")
                raise HTTPException(400, "Text is required")
            
            try:
                # Try to parse the text as JSON if it's a string
                if isinstance(text, str):
                    try:
                        parsed_data = json.loads(text)
                        logger.info(f"Successfully parsed JSON string")
                        
                        # Create an extractor with all user stats
                        user_stats = {}
                        if "userGithubRepos" in parsed_data:
                            user_stats["userGithubRepos"] = parsed_data["userGithubRepos"]
                        if "leetCodeStat" in parsed_data:
                            user_stats["leetCodeStat"] = parsed_data["leetCodeStat"]
                        
                        extractor = SkillExtractor(user_stats=user_stats)
                        
                        # Get GitHub skills
                        github_skills = extractor.extract_skills_from_github()
                        logger.info(f"Extracted GitHub skills")
                        
                        # Get LeetCode assessment if available
                        leetcode_assessment = {}
                        if "leetCodeStat" in parsed_data and parsed_data["leetCodeStat"]:
                            leetcode_assessment = extractor.extract_pss_from_leetcode()
                            logger.info(f"Extracted LeetCode assessment: {leetcode_assessment}")
                        
                        # Return both skills and LeetCode assessment
                        return {
                            "skills": github_skills,
                            "leetcode": leetcode_assessment
                        }
                    except json.JSONDecodeError as je:
                        logger.warning(f"Not a valid JSON string: {str(je)}")
                
                # If not JSON or JSON parsing failed, treat as plain text
                threshold = float(data.get("threshold", 0.0))
                skills = skill_extractor.extract_skills_from_text(text, threshold)
                logger.info(f"Extracted {sum(len(skills_list) for category, skills_list in skills.items())} skills from plain text")
                return {"skills": skills}
                
            except Exception as e:
                logger.error(f"Error during skill extraction: {str(e)}", exc_info=True)
                raise HTTPException(500, f"Failed to extract skills: {str(e)}")
            
        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            raise HTTPException(400, "Invalid JSON in request body")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            raise HTTPException(500, f"Internal server error: {str(e)}")

    @app.post("/extract-job-skill")
    async def extract_job_skill(request: Request):
        """
        For extracting structured information and skills from job posting.
        """
        try:
            data = await request.json()
            job_text = data.get("text")
            
            if not job_text:
                raise HTTPException(400, "Job text is required")
            
            # process the job desc directly
            job_info = job_extractor.extract_job_info(str(job_text))
            
            skills_count = sum(len(skills) for category, skills in 
                            job_info.get("skills_categorized", {}).items())
            return job_info
        except json.JSONDecodeError:
            raise HTTPException(400, "Invalid JSON in request body")
        except Exception as e:
            raise HTTPException(500, f"Failed to extract job skills: {str(e)}")

    return app
