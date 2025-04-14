# Arte.ai - Your Personal Skill Gap Analyzer

Ever wonder how your skills stack up against the requirements of your dream job? Arte.ai is here to help!

Arte.ai analyzes your personal data (like your resume, github, leetcode) and compares it against job postings you're interested in. Using Natural Language Processing (NLP), it identifies the key skills required for the role and highlights where you shine and where there might be gaps.

Think of it as your personal career advisor, giving you a clear picture of your standing in the job market and visualizing what skills you might need to develop to land that perfect position.

## Features (Planned)

- **User Data Input:** Upload your resume or manually input your skills and experience.
- **Job Posting Analysis:** Paste job descriptions or provide URLs for analysis.
- **Skill Gap Identification:** Compares your profile against job requirements using NLP.
- **Visualization:** Presents the analysis in an easy-to-understand visual format (e.g., charts, lists).
- **Actionable Insights:** Suggests areas for skill development.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/qeqqe/Arte.ai.git
    cd Skill-Gap-Analyzer
    ```
2.  **Set-up Environment variable**
    - Rename the `.env.example` to `.env` and enter your variables
3.  **Run:**
    ```bash
    docker compose up
    ```
    _(Make sure you have docker & docker-compose installed)_

## Usage

1.  **Authenticate:** Log in to the application using your GitHub account.
2.  **Onboard & Connect Data:** Follow the onboarding steps to connect your data sources, such as uploading your resume, linking your GitHub profile, or connecting your LeetCode account. This helps Arte.ai understand your current skills and experience.
3.  **Analyze a Job:** Find a job posting on LinkedIn that interests you and copy its URL (e.g., `https://www.linkedin.com/jobs/view/0123456789`).
4.  **Submit & View Results:** Paste the LinkedIn job URL into Arte.ai. The application will analyze the job description against your profile and present you with a skill gap analysis, showing how you match up and where you can improve.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs, feature requests, or suggestions.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.
