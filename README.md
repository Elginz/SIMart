<h1 align="center">TEAM 58</h1>

<h3 align="center">🔴🚨 Live SMart website: <a href="https://smart-k1xu.onrender.com/">SMart</a> 🚨🔴</h3>
<h5 align="center"><em>(Do note that it can take up to 1 minute to load)</em> </h5>

<br>

<h3 align="center">How to run the code</h3>

- Currently the files and routes have been placed within **frontend** and **backend** the older files were moved into **older_files**

- *There is no node module inside the files as it is too big, add node modules (npm i) into both backend and frontend repositories.*

<h4 align="center">cd into backend before building and starting the code. </h4>


**Issues (potential)**
- You may notice an error in building the code. Most of the error comes from the db. Run the following command in the terminal to view sql db issue. It manually executes schema file

- ❗LIVE SITE: The free server on render uses ephemeral storage for the filesystem. As such any changes made during runtime will not be preserved while deployed and the SQLite database might be reset 


*sqlite3 backend/database.db < backend/db_schema.sql*
