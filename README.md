<h1 align="center">TEAM 58</h1>

🛑<span style="font-size: 3em;">**LIVE WEBSITE (Do note it may take up to 1 minute to load):**</span> [SMart](https://smart-k1xu.onrender.com/) 🔴


<h3 align="center">Step by step basis (Will make sense for those working on it)</h3>

- Currently the files and routes have been placed within **frontend** and **backend** the older files were moved into **older_files**

- *There is no node module inside the files as it is too big, add node modules (npm i) into both backend and frontend repositories.*

<h4 align="center">cd into backend before building and starting the code. </h4>


**Issues (potential)**
- You may notice an error in building the code. Most of the error comes from the db. Run the following command in the terminal to view sql db issue. It manually executes schema file

- LIVE SITE: The free server on render uses ephemeral storage for the filesystem. As such any changes made during runtime will not be preserved while deployed and the SQLite database might be reset 


*sqlite3 backend/database.db < backend/db_schema.sql*
