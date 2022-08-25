# Will Clegg's Social News API

## Requirements
### Environment Variables
As a minimum the PGDATABASE environment variable must be set on runtime so that the 'pg' Node module knows which database to connect to. Depending on your PSQL setup you may also need to set the: PGHOST, PGPORT, PGUSER and PGPASSWORD environment variables too. 

* Create a /test.env file and within it assign any of the above variables that you will require to connect to your **test** PSQL database
* Create a /development.env file and within it assign any of the above variables that you will require to connect to your **development** PSQL database

Please see the 'example env' file for an example of how you should construct your .env files. 

