/*
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

// load dependencies
const express = require("express")
const http = require('http');
const winston = require('winston');
const https = require('https');
const dotenv = require("dotenv").config();
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require("path")
const morgan = require("morgan")
const cors = require("cors")
const fetch = require("node-fetch")
const helmet = require("helmet");
const { report } = require("process");

// class that holds an express web-server application and its' configuration
class Application {
  constructor() {
    this.app = express()

    /*if (this.keycloak) {
        console.warn("Trying to init Keycloak again!")
    }
    else {
        console.log("Initializing Keycloak...")
        this.keycloak = require('./portal/config/keycloak-config.js').initKeycloak()
    }
    this.app.use(this.keycloak.middleware({ logout: '/logout' }))*/

    this.app.use(helmet())
    this.app.use(morgan("dev"))
    this.app.use(morgan('common', {
      stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
    }))
    this.logger = winston.createLogger({
      level: 'error',
      transports: [
        new (winston.transports.File)({ filename: 'error.log' })
      ]
    });
    this.app.use(cors())
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use('/discovery', express.static("./portal"))
    this.app.use('/', express.static("./vp"))

    // add GET route that handles a search request
    this.app.get("/search", async (request, response, next) => {
      try {
        const requestedSearch = request.query.disease
        const source = JSON.parse(request.query.source)
        let token
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
        let data = {}

        //if(source.catalogueName === 'Orphanet-FDP'
        //|| source.catalogueName === 'Cellosaurus'
        //|| source.catalogueName === 'Wikipathways'
        //|| source.catalogueName === 'hpscReg') {
        if(source.specsURL ===
          'https://raw.githubusercontent.com/ejp-rd-vp/query_builder_api/master/versions/v2/specification.yaml') {
          query = `${source.catalogueAddress}?code=http://www.orpha.net/ORDO/Orphanet_${requestedSearch}`
          await fetch(query, {
            headers: {
              'Accept': 'application/json'
            }
          })
          .then(this.handleFetchErrors)
          .then(async (fetchResponse) => {
            if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
              let contentTemp = await fetchResponse.json()
              if(contentTemp.length > 0 && contentTemp[0]['resourceResponses']) {
                data = {
                  name: source.catalogueName,
                  content: contentTemp[0],
                };
                response.json(data)
              }
              else {
                response.sendStatus(404)
              }
            }
            else {
              response.sendStatus(fetchResponse.status)
            }
          })
          .catch((exception) => {
            this.logger.log('error', 'Error in portal:portal.js:app.get(/search):fetch(): ' + exception);
            console.error("Error in portal:portal.js:app.get(/search):fetch(): ", exception);
          })
        }
        else if (source.catalogueName === 'Leicester-ERN-Network') {
          if(token == undefined) {
            response.sendStatus(401)
          }
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
          await fetch(`${source.catalogueAddress}individuals`, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json', 'auth-token': token}
          })
          .then(this.handleFetchErrors)
          .then(async (fetchResponse) => {
            if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
              let contentTemp = await fetchResponse.json()
              if(contentTemp['responseSummary'].numTotalResults > 0 && contentTemp["resultSets"].length > 0) {
                for(let result of contentTemp["resultSets"]) {
                  if(result.resultCount > 0) {
                    data = {
                      name: result.Info.contactPoint,
                      content: result
                    }
                    response.json(data)
                  }
                }
              }
              else {
                response.sendStatus(404)
              }
            }
            else {
              response.sendStatus(fetchResponse.status)
            }
          })
          .catch((exception) => {
            this.logger.log('error', 'Error in portal:portal.js:app.get(/search):fetch(): ' + exception);
            console.error("Error in portal:portal.js:app.get(/search):fetch(): ", exception);
          })
        }
        else if (source.catalogueName === 'Orphanet' || source.catalogueName === 'BBMRI-Eric') {
          query = this.buildQuery(source.catalogueAddress, requestedSearch, selectedTypes, selectedCountries);
          await fetch(query)
          .then(this.handleFetchErrors)
          .then(async (fetchResponse) => {
            if(fetchResponse.status >= 200 && fetchResponse.status < 400) {
              let contentTemp = await fetchResponse.json()
              if(contentTemp.resourceResponses.length > 0) {
                data = {
                  name: source.catalogueName,
                  content: contentTemp,
                };
                response.json(data)
              }
              else {
                response.sendStatus(404)
              }
            }
            else {
              response.sendStatus(fetchResponse.status)
            }
          })
          .catch((exception) => {
            this.logger.log('error', 'Error in portal:portal.js:app.get(/search):fetch(): ' + exception);
            console.error("Error in portal:portal.js:app.get(/search):fetch(): ", exception);
          })
        }
        else {
          response.sendStatus(404)
        }
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
        console.error("Error in portal:portal.js:app.get(/getDirectoryAddress): ", exception);
      }
    })

    // add GET route that returns the keycloak configuration
    this.app.get("/getKeycloakConfig", async (request, response, next) => {
      try {
        response.json({
          realm: process.env.AUTH_REALM,
          url: process.env.AUTH_SERVER_URL,
          clientId: process.env.AUTH_CLIENT_ID
        });
      } catch (exception) {
        console.error("Error in portal:portal.js:app.get(/getKeycloakConfig): ", exception);
      }
    })
  }

  //class attributes
  app
  logger
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
      // load SSL files
      var options = {
        key: fs.readFileSync(__dirname + process.env.PORTAL_SSL_KEY),
        cert: fs.readFileSync(__dirname + process.env.PORTAL_SSL_CERT)
      }

      // create HTTPS server
      let httpsServer = https.createServer(options, app.getApp())

      // run the server application
      httpsServer.listen(process.env.PORTAL_PORT, () =>
        console.log(`Resource Discovery Portal available at https://localhost:${process.env.PORTAL_PORT} ...`)
      );

      // get catalogue list
      fetch(`${process.env.DIRECTORY_URL}/catalogues/`)
        .then(this.handleFetchErrors)
        .then((fetchResponse) => {
          if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
            // define catalogue directory endpoint address
            app.directoryEndpoint = `${process.env.DIRECTORY_URL}`;
            // define and retrieve catalogue list
            app.getCatalogues();
          } else {
            console.error("The directory server could not be accessed.");
            return;
          }
        })
        .catch((exception) => {
          app.directoryEndpoint = null
          console.error("Error in portal:portal.js:Server.run():fetch(): ", exception);
        });
    }
    catch (exception) {
      console.error("Error in portal:portal.js:Server.run(): ", exception);
    }
  }
}

// create components
const app = new Application();
const server = new Server();

server.run(app);
