# EJP-RD - Resource Discovery Portal

The EJP-RD - Resource Discovery Portal component. It implements a REST API that can be used to query the EJP-RD discovery eco-system.

## Requirements

- [Node.js](https://nodejs.org/ "https://nodejs.org/")
- [Git](https://git-scm.com/ "https://git-scm.com/")

## Deployment

- `$ git clone https://github.com/ejp-rd-vp/discovery-portal.git` to clone this repository.
- `$ cd discovery-portal/portal` to navigate to the directory root path.
- `$ npm i` to install missing dependencies.
- `$ cd portal` to to navigate to portal directory.
- `$ mkdir cert` to to create a folder for the SSL certificate and key.
- Copy your SSL key and certificate to that folder.
- `$ node portal.js <DISCOVERY_PORTAL_PORT> <ADDRESS_DIRECTORY_URL> <ADDRESS_DIRECTORY_PORT>` to start the discovery portal service.

The portal will be listening on `https://<YOUR_IP_ADDRESS>:<DISCOVERY_PORTAL_PORT>/rsLPortal`.
