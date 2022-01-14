/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

let Keycloak = require('keycloak-connect');
const dotenv = require("dotenv").config();

let keycloakConfig = {
    serverUrl: process.env.AUTH_SERVER_URL,
    realm: process.env.AUTH_REALM,
    clientId: process.env.AUTH_CLIENT_ID,
    bearerOnly: true,
    credentials: {
        secret: process.env.AUTH_CLIENT_SECRET
  }
};

function initKeycloak() {
    try {
        return new Keycloak({ }, keycloakConfig)
    } catch (exception) {
        console.error("Error in keycloak-config.js:initKeycloak(): ", exception)
    }
}

module.exports = {
    initKeycloak
};