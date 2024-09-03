<h1 align="center">TEAM 58</h1>

<h3 align="center">🔴🚨 Live SMart website: <a href="https://smart-k1xu.onrender.com/">SMart</a> 🚨🔴</h3>
<h5 align="center"><em>(Do note that it can take up to 1 minute to load as it is a sample site)</em> </h5>

<br>

<h3 align="center">How to run the code</h3>

- The Web application is split into **frontend** and **backend**.

- Download both **backend** and **frontend** into a single repository
- cd into **backend**
  
- Run the following commands 
  - npm i (Install the node package modules)
  - npm i express-session (Install express sessions)
  - npm run build-db (Build the database)
  - npm run (To run the program)
    
**Issues (potential)**
- You may notice an error in building the code. Most of the error comes from the db. Run the following command in the terminal to view sql db issue. It manually executes schema file
  - *sqlite3 backend/database.db < backend/db_schema.sql*


<h3 align="center"> 🚨This branch is used for Website hosting </h3>

- ⚙️ **Render** is used to host the Backend repository

- 🖥️ **Vercel** is used to host the Frontend repository

**DO NOTE:**
- ❗LIVE SITE: The free server on render uses ephemeral storage for the filesystem. As such any changes made during runtime will not be preserved while deployed and the SQLite database might be reset 
  
- It may take up to 1 minute to load the website.



