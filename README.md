# EJP-RD - Resource Discovery Portal

The EJP-RD - Resource Discovery Portal component. It implements a REST API that can be used to query the EJP-RD discovery eco-system.

## Requirements

- [Node.js](https://nodejs.org/ "https://nodejs.org/")
- [Git](https://git-scm.com/ "https://git-scm.com/")

## Deployment

- `$ git clone https://github.com/ejp-rd-vp/discovery-portal.git` to clone this repository.
- `$ cd discovery-portal/portal` to navigate to the discovery portal root path.
- `$ npm i` to install missing dependencies.
- Create a file named `.env`. Note that this file needs to exist and be configured in order for the application to operate correctly.
- Set the portal configuration inside the `.env` file as follows: `PORTAL_PORT=<YOUR_DESIRED_PORT>`, `PORTAL_SSL_CERT=<PATH_TO_SSL_CERTIFICATE>`, `PORTAL_SSL_KEY=<PATH_TO_SSL_KEY>`.
- Set the address directory configuration inside the `.env` file as follows: `DIRECTORY_URL=<ADDRESS_DIRECTORY_URL>`. 
- Set the keycloak configuration inside the `.env` file as follows: `AUTH_SERVER_URL=<KEYCLOAK_SERVER_URL>`, `AUTH_REALM=<KEYCLOAK_REALM>`, `AUTH_CLIENT_ID=<KEYCLOAK_CLIENT_ID>`, `AUTH_CLIENT_SECRET=<KEYCLOAK_CLIENT_SECRET>`.
- `$ node portal.js` to start the discovery portal service.

The resource discovery portal will be listening on `https://<YOUR_IP_ADDRESS>:<PORTAL_PORT>/discovery`.
