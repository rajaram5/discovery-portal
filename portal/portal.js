/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

// load dependencies
const express = require("express")
var http = require('http');
const https = require('https');
const dotenv = require("dotenv").config();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require("path")
const morgan = require("morgan")
const cors = require("cors")
const fetch = require("node-fetch")
const helmet = require("helmet")

// class that holds an express web-server application and its' configuration
class Application {
  constructor() {
    this.app = express()

    if (this.keycloak) {
        console.warn("Trying to init Keycloak again!")
    } 
    else {
        console.log("Initializing Keycloak...")
        this.keycloak = require('./portal/config/keycloak-config.js').initKeycloak()
    }
    this.app.use(this.keycloak.middleware({ logout: '/logout' }))

    this.app.use(helmet())
    this.app.use(morgan("dev"))
    this.app.use(cors())
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/discovery', express.static("./portal"))
    this.app.use('/', express.static("./public"))

    // add GET route that handles a search request
    this.app.get("/search", async (request, response, next) => {
      try {
        const requestedSearch = request.query.disease
        const selectedSources = JSON.parse(request.query.sources)
        let token = ''
        if(request.query.token) {
          token = request.query.token
        }
        let selectedTypes = []
        if(request.query.types) {
          selectedTypes = JSON.parse(request.query.types)
        }
        let selectedCountries = []
        if(request.query.countries) {
          selectedCountries = JSON.parse(request.query.countries)
        }
        let gender = ''
        if(request.query.genders) {
          gender = request.query.genders
        }

        let query = ''
        let dataArray = []
        let data = {}
        for (let catalogue of selectedSources) {
          if(catalogue.catalogueName === 'Orphanet-FDP' 
          || catalogue.catalogueName === 'Cellosaurus' 
          || catalogue.catalogueName === 'Wikipathways' 
          || catalogue.catalogueName === 'hpscReg') {
            query = `${catalogue.catalogueAddress}?code=http://www.orpha.net/ORDO/Orphanet_${requestedSearch}`
            const dbResponse = await fetch(query, {
              headers: {
                'Accept': 'application/json'
              }});
            let contentTemp = await dbResponse.json()
            if(contentTemp.length > 0 && contentTemp[0]['resourceResponses']) {
              data = {
                name: catalogue.catalogueName,
                content: contentTemp[0],
              };
              dataArray.push(data);
            }
          }
          else if (catalogue.catalogueName === 'Leicester-ERN-Network' && token) {
            let body = ''
            if(gender != 'null') {
              body = {
                "meta": {
                    "apiVersion": "2.0"
                },
                "query": {
                    "filters": [
                        {
                            "id": `ORPHA:${requestedSearch}`,
                            "includeDescendantTerms": true,
                            "similarity": "exact",
                            "scope": "individuals"
                        },
                        {
                            "id": "gender",
                            "operator": "=",
                            "value": gender
                        }                    
                    ]
                }
              }
            }
            else {
              body = {
                "meta": {
                    "apiVersion": "2.0"
                },
                "query": {
                    "filters": [
                        {
                            "id": `ORPHA:${requestedSearch}`,
                            "includeDescendantTerms": true,
                            "similarity": "exact",
                            "scope": "individuals"
                        }                   
                    ]
                }
              }
            }
            const response = await fetch(`${catalogue.catalogueAddress}individuals`, {
              method: 'post',
	            body: JSON.stringify(body),
	            headers: {'Content-Type': 'application/json', 'auth-token': token}
            })
            let contentTemp = await response.json()
            data = {
              name: catalogue.catalogueName,
              content: contentTemp["resultSets"]
            }
            dataArray.push(data);
          }
          else if (catalogue.catalogueName === 'Orphanet' || catalogue.catalogueName === 'BBMRI-Eric') {
            query = this.buildQuery(catalogue.catalogueAddress, requestedSearch, selectedTypes, selectedCountries);
            const dbResponse = await fetch(query);
            if(dbResponse.status >= 200 && dbResponse.status < 400) {
              let contentTemp = await dbResponse.json()
              if(contentTemp.resourceResponses.length > 0) {
                data = {
                  name: catalogue.catalogueName,
                  content: contentTemp,
                };
                dataArray.push(data);
              }
            }
          }
        }
        response.json(dataArray);
      } catch (exception) {
        console.error(
          "Error in portal:portal.js:app.get(/search): ",
          exception
        );
      }
    })

    // add GET route that handles a ping request
    this.app.get("/pingCatalogue", async (request, response, next) => {
      try {
        fetch(request.query.address)
          .then(this.handleFetchErrors)
          .then((fetchResponse) => {
            if (fetchResponse.status >= 200 && fetchResponse.status <= 404) {
              response.json(fetchResponse.status);
            } else {
              response.sendStatus(404);
            }
          })
          .catch((exception) => {
            console.error(exception + request.query.address);
            response.sendStatus(404);
          });
      } catch (exception) {
        console.error(
          "Error in portal:portal.js:app.get(/pingCatalogue): ",
          exception
        );
      }
    })

    // add GET route that handles a ping request
    this.app.post("/login", async (request, response, next) => {
      try {
        this.keycloak.grantManager.obtainDirectly(request.body.username, request.body.password)
        .then((grant) => {
          if(grant) {
            this.keycloak.storeGrant(grant, request, response);
            response.json(grant)
          }
          else {
            response.sendStatus(401);
          }
        })
        .catch((exception) => {
          console.error(exception);
          response.sendStatus(401);
        })
      } catch (exception) {
        console.error("Error in portal:portal.js:app.get(/login): ", exception);
      }
    })

    // add GET route that handles a ping request
    this.app.post("/refreshToken", async (request, response, next) => {
      try {
        fetch(`${this.keycloak.grantManager.realmUrl}/protocol/openid-connect/token`, {
          method: 'post',
          body: new URLSearchParams({
            'grant_type': 'refresh_token',
            'client_id': process.env.CLIENT_ID,
            'client_secret': process.env.CLIENT_SECRET,
            'refresh_token': request.body.refresh_token
        }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
        .then(this.handleFetchErrors)
        .then(async (fetchResponse) => {
          if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
            const responseData = await fetchResponse.json();
            response.json(responseData)
          }
        })
        .catch((exception) => {
          console.error(exception);
          response.sendStatus(401);
        })
      } catch (exception) {
        console.error("Error in portal:portal.js:app.get(/refreshToken): ", exception);
      }
    })

    // add GET route that handles a mapping request
    this.app.get("/rdCodeMapper", async (request, response, next) => {
      try {
        const code = request.query.code
        const from = request.query.from
        const to = request.query.to
        let query = ""
        if (to) {
          query = `${this.mappingEndpoint}map?from=${from}&code=${code}&to=${to}`
        }
        else {
          query = `${this.mappingEndpoint}map?from=${from}&code=${code}`
        }
        fetch(query)
          .then(this.handleFetchErrors)
          .then(async (fetchResponse) => {
            if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
              const responseData = await fetchResponse.json();
              if(typeof(responseData) == "object") {
                response.json(responseData)
              }
              else {
                response.sendStatus(404);
              }
            } 
            else {
              response.sendStatus(404);
            }
          })
          .catch((exception) => {
            console.error(exception);
            response.sendStatus(404);
          });
      } catch (exception) {
        console.error(
          "Error in portal:portal.js:app.get(/pingCatalogue): ",
          exception
        );
      }

    })

    // add GET route that returns the catalogue directory address
    this.app.get("/getDirectoryAddress", async (request, response, next) => {
      try {
        response.json(this.directoryEndpoint);
      } catch (exception) {
        console.error("Error in portal:portal.js:app.get(/pingCatalogue): ", exception);
      }
    })
  }

  //class attributes
  app
  keycloak
  directoryEndpoint
  mappingEndpoint
  catalogues

  //class funtions
  getKeycloak() {
    try {
      if (!this.keycloak) {
        console.error('Keycloak has not been initialized. Please called init first.');
      } 
      return this.keycloak;
    } catch (exception) {
      console.error("Error in portal.js:Application:getKeycloak() ", exception);
    }
  }

  getCatalogues = async () => {
    try {
      fetch(`${this.directoryEndpoint}/catalogues/`)
        .then(this.handleFetchErrors)
        .then(async (fetchResponse) => {
          if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
            const data = await fetchResponse.json();
            this.catalogues = data;
          }
        })
        .catch((exception) => {
          console.error("Error in portal:portal.js:Application:getCatalogues():fetch(): ", exception);
        });
    } catch (exception) {
      console.error("Error in portal.js:Application:getCatalogues() ", exception);
    }
  }

  handleFetchErrors(fetchResponse) {
    try {
      if (!fetchResponse.ok) {
        console.error("Fetch Error: " + fetchResponse.status + " " + fetchResponse.statusText + " for " + fetchResponse.url);
      }
      return fetchResponse;
    } catch (exception) {
      console.error("Error in portal.js:handleFetchErrors(): ", exception);
    }
  }

  isNumber(number) {
    try {
      return !isNaN(parseFloat(number)) && !isNaN(number - 0);
    } catch (exception) {
      console.error("Error in portal.js:isNumber(): ", exception);
    }
  }

  extractOrphacode(str) {
    try {
      let number = str.match(/\d/g);
      if(number == null)
        return null;
      number = number.join("");
      return number;
    } catch (exception) {
      console.error("Error in portal.js:extractOrphacodes(): ", exception);
    }
  }

  buildQuery(address, searchTerm, types, countries) {
    try {
      let query = "";
      query = `${address}resource/search?code=http://www.orpha.net/ORDO/Orphanet_${searchTerm}`;
      for(let type of types) {
        if(type == "KnowledgeDataset") {
          continue
        }
        query+= `&resourceType=${type}`;
      }
      for(let country of countries) {
        query+= `&country=${country}`;
      }
      return query;
    } catch (exception) {
      console.error("Error in portal.js:buildQuery() ", exception);
    }
  }

  buildFdpQuery(address, searchTerm, types, countries) {
    try {
      let query = "";
      query = `${address}?code=http://www.orpha.net/ORDO/Orphanet_${searchTerm}`
      /*query = `${address}?code=http://www.orpha.net/ORDO/Orphanet_${searchTerm}&resourceType=[`;
      for(let i = 0; i < types.length; i++) {
        query+= `${types[i]},`;
      }
      query += ']&country=[';
      for(let i = 0; i < countries.length; i++) {
        query+= `${countries[i]},`;
      }
      query += ']';*/
      return query;
    } catch (exception) {
      console.error("Error in portal.js:buildFdpQuery(): ", exception);
    }
  }

  buildErnQuery(address, searchTerm, types, countries) {
    try {
      let query = "";
      query = `${address}individuals?code=http://www.orpha.net/ORDO/Orphanet_${searchTerm}&resourceType=[`;
      for(let i = 0; i < types.length; i++) {
        query+= `${types[i]},`;
      }
      query += ']&country=[';
      for(let i = 0; i < countries.length; i++) {
        query+= `${countries[i]},`;
      }
      query += ']';
      return query;
    } catch (exception) {
      console.error("Error in portal.js:buildFdpQuery(): ", exception);
    }
  }

  getApp() {
    try {
      return this.app;
    } catch (exception) {
      console.error("Error in catalogueDirectory:Application:getApp(): ", exception);
    }
  }
}

// class that holds a http(s) server application and its' configuration
class Server {
  run(app) {
    try {
      // parse command line arguments
      var commandLineArguments = process.argv.slice(2)
      var key = fs.readFileSync(__dirname + '/portal/cert/serverkey.key')
      var cert = fs.readFileSync(__dirname + '/portal/cert/servercert.crt')
      var options = {
        key: key,
        cert: cert
      }
      //let httpServer = http.createServer(app.getApp())
      let httpsServer = https.createServer(options, app.getApp())

      // check for proper usage
      if (commandLineArguments.length != 2) {
        console.error(
          "Usage: node portal.js $PORT $DIRECTORY_ADDRESS"
        );
      } else {
        // run the server application
        /*httpServer.listen(commandLineArguments[0], () =>
            console.log(
              `Resource Discovery Portal available at http://localhost:${commandLineArguments[0]} ...`
            )
          );*/
        httpsServer.listen(commandLineArguments[0], () =>
          console.log(
            `Resource Discovery Portal available at https://localhost:${commandLineArguments[0]} ...`
          )
        );
        // get catalogue list
        fetch(`${commandLineArguments[1]}/catalogues/`)
          .then(this.handleFetchErrors)
          .then((fetchResponse) => {
            if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
              // define catalogue directory endpoint address
              app.directoryEndpoint = `${commandLineArguments[1]}`;

              // define and retrieve catalogue list
              app.getCatalogues();
            } else {
              console.error("The directory server could not be accessed.");
              return;
            }
          })
          .catch((exception) => {
            app.directoryEndpoint = null
            console.error(
              "Error in portal:portal.js:Server.run():fetch(): ",
              exception
            );
          });
      }
    } catch (exception) {
      console.error("Error in portal:portal.js:Server.run(): ", exception);
    }
  }
}

// create components
const app = new Application();
const server = new Server();

server.run(app);
