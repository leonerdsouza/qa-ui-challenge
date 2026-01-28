# QA UI Automation Challenge

## Setup

### Database
- Create SQLite DB: `sqlite3 db/seed.db < db/init.sql`

### API
- Node.js:

cd api
npm install express sqlite3 cors swagger-ui-express js-yaml
node server.js

- Runs on `http://localhost:3000`
- Swagger UI: `http://localhost:3000/swagger`

### UI
- Open `ui/index.html` in browser
- UI communicates with API

### Tests
- Candidate may use any automation framework (Cypress/Playwright/Selenium)
- Automate: login, dashboard, create/edit/delete tasks
- Validate UI ↔ API ↔ DB

### Diagram

          +-------------------+
          |   Automation      |
          (Cypress/Playwright/|
          |   Selenium etc.)  |
          +---------+---------+
                    |
     Validate data  |   Execute UI actions
                    v
          +-------------------+
          |        UI         |
          |  (index.html,     |
          |   dashboard.html, |
          |   task_form.html) |
          +---------+---------+
                    |
   Calls API / Fetch data
                    v
          +-------------------+
          |        API        |
          |  (server.js)      |
          |  Swagger/OpenAPI  |
          +---------+---------+
                    |
       Query / Update DB
                    v
          +-------------------+
          |        DB         |
          |   SQLite (seeded) |
          +-------------------+
		  
### Deliverables		  

- Automation framework / tests
- README explaining setup & test strategy
- Optional negative tests and observations
- At least one full run report

### Note

E2E tests should validate consistency across all three layers: the UI must reflect the API and DB accurately.

Bonus points for handling negative scenarios, API errors, or duplicated/missing data.

Here’s your chance to be creative and proactive, you are free to discard all of the provided files and propose something entirely new (that I can install/public) or you could expand the solution taking the provided files as a starting point. Maybe add more pages? More styles and therefore E2E validations with the new elements? More endpoints and E2E automation flows? 


### TESTS ####
With node.js installed: npm init playwright@latest within the automation folder

Inside the automation -> src -> tests folder and with  the application running, run:

npx playwright test three-layer-validation.spec.ts --headed
npx playwright test negative-tests.spec.ts --headed

To generate the report you can use:
npx playwright test three-layer-validation.spec.ts --reporter=html,line  
npx playwright test negative-tests.spec.ts --reporter=html,line  

The UI one it is failing, because through the UI I was not able to add tasks, only through DB and API, I left the test failing to show that I tried to implement it.
