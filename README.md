# Will Clegg's News API

//TODO complete

Dev environment - Fairly comprehensive data
Test environment - Limited data for testing 

## Requirements
### Environment Variables
As a minimum the PGDATABASE environment variable must be set on runtime so that the 'pg' Node module knows which database to connect to. Depending on your PSQL setup you may also need to set the: PGHOST, PGPORT, PGUSER and PGPASSWORD environment variables too. 

Assuming that you will have both a development environment and a test environment, you should:

* Create a /test.env file which and assign any of the above variable for your test environment.
* Create a /development.env file and assign of the above variables the PGDATABASE environment variable for your dev environment. 