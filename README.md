<h1 align="center">TEAM 58</h1>

<h3 align="center">Step by step basis (Will make sense for those actually working on it)</h3>

Currently the files and routes have been placed within **frontend** and **backend** the older files were moved into **older_files**

*There is no node module inside the files as its too big, so add node modules (npm i) into both backend and frontend repositories.*

<h4 align="center">cd into backend before building and starting the code. </h4>


**Issues (potential)**
- Insertion of several default values in db_schema.sql is commented for now as it creates some issue. So create a profile to login. **Try debugging this.**
- You may notice an error in building the code. Most of the error comes from the db. Run the following command in the terminal to view sql db issue. It manually executes schema file 

*sqlite3 backend/database.db < backend/db_schema.sql*
