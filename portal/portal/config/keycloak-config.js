/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

let Keycloak = require('keycloak-connect');
const dotenv = require("dotenv").config();

let keycloakConfig = {
    serverUrl: process.env.SERVER_URL,
    realm: process.env.REALM,
    clientId: process.env.CLIENT_ID,
    bearerOnly: true,
    credentials: {
        secret: process.env.CLIENT_SECRET
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