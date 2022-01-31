/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

import { handleFetchErrors } from './utils.js'
import { toggleInterrogation, updateStatusText } from './updateDom.js'


// function that uses an express route to login a user and retrieve an access token  
/*function login() {
  try {
    updateStatusText('none')
    let username = document.getElementById("usernameInput").value
    let password = document.getElementById("passwordInput").value
    if(username.length > 0 && password.length > 0) {
      fetch(`${window.location.origin}/login`, {
        method: 'post',
        body: new URLSearchParams({
          'password': password,
          'username': username,
      }),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
        .then(handleFetchErrors)
        .then(async (fetchResponse) => {
          if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
            const data = await fetchResponse.json()
            if (data['access_token']) {
              toggleLoginModal(false)
              currentUser.loggedIn = true
              currentUser.accessToken = data.access_token.token
              currentUser.refreshToken = data.refresh_token.token
              updateStatusText('success', 'Successfully logged in.')
              document.getElementById("loginButtonText").innerHTML = data.id_token.content.name
              document.getElementById("loginTooltiptext").innerHTML = 'Click to log out.'
              document.getElementById("loginButton").setAttribute('onclick', 'logout();')
              document.getElementById('lockSymbol').style.display = 'none'
              document.getElementById('ernLogo').style.opacity = '1'
              toggleInterrogation(true)
              document.getElementById('loginStatusText').innerText = ''
            }
            else {
              document.getElementById('loginStatusText').innerHTML = 'Unable to log in.'
              console.error("Error in clientScripts.js:login(): No access token available.")
            }
          } else {
            document.getElementById('loginStatusText').innerHTML = 'Invalid login credentials.'
            console.error("Error in clientScripts.js:login(): Fetch response out of range.")
          }
        })
        .catch((exception) => {
          console.error(exception)
        });
    }
    else {
      document.getElementById('loginStatusText').innerHTML = 'Please enter valid login credentials.'
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:login() ", exception)
  }
}

// function that uses an express route to log out a user
function logout() {
  try {
    fetch(`${window.location.origin}/logout`)
    .then(handleFetchErrors)
      .then(async (fetchResponse) => {
        if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
          currentUser.loggedIn = false
          currentUser.accessToken = ''
          currentUser.refreshToken = ''
          toggleInterrogation(false)
          document.getElementById("loginButtonText").innerHTML = 'Login'
          document.getElementById("loginTooltiptext").innerHTML = 'Click to log in.'
          updateStatusText("success", "Successfully logged out.")
          document.getElementById("loginButton").setAttribute('onclick', 'toggleLoginModal(true);')
          document.getElementById('lockSymbol').style.display = 'block'
          document.getElementById('ernLogo').style.opacity = '.5'
        } else {
          console.error("Error in clientScripts.js:logout(): Fetch response out of range.")
        }
      })
      .catch((exception) => {
        console.error(exception)
      });
  } catch (exception) {
    console.error("Error in clientScripts.js:logout() ", exception)
  }
}

// function that uses an express route to refresh a users access token using the refresh token
function refreshToken() {

}*/

let currentUser = {
  loggedIn: false,
  accessToken: "",
  refreshToken: ""
}

let keycloakConfig 

/*fetch(window.location.origin + '/getKeycloakConfig')
  .then(handleFetchErrors)
  .then(async (fetchResponse) => {
    if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
      keycloakConfig = await fetchResponse.json();
    }
  })
  .catch((exception) => {
    console.error("Error in clientScripts.js:getDirectoryAddress():fetch(): ", exception);
  });*/

let keycloak = new Keycloak('./config/keycloak.json')

//let keycloak = new Keycloak({
//  url: 'https://www423.lamp.le.ac.uk/auth/',
//  realm: 'ERN',
//  clientId: 'discovery-portal',
//  bearerOnly: true,
//  credentials: {
//    secret: '7f2eba04-4d6c-412e-a044-31663c7a01d9'
//  }
//})

function logout() {
  try {
    keycloak.logout()
    .catch(() => {
      console.error('Failed to log out')
    })
  } catch (exception) {
    console.error("Error in auth.js:logout(): ", exception)
  }
}
  
  function login() {
  try {
    keycloak.login()
    .catch(() => {
      console.error('Failed to log in')
    })
  } catch (exception) {
    console.error("Error in auth.js:login(): ", exception)
  }
}
  
  function refreshToken() {
  try {
    keycloak.updateToken(-1)
    .catch(() => {
      console.error('Failed to refresh token')
    })
  } catch (exception) {
    console.error("Error in auth.js:refreshToken(): ", exception)
  }
}

// function that locally initiates a keycloak client
function initKeycloak() {
  try {
    keycloak.init({
      onLoad: 'check-sso',
      promiseType: 'native'
    })
    .then((authenticated) => {
      if(authenticated){
        currentUser.loggedIn = true
        currentUser.accessToken = keycloak.token
        currentUser.refreshToken = keycloak.refreshToken
        updateStatusText('success', 'Successfully logged in.')
        document.getElementById("loginButtonText").innerHTML = keycloak.idTokenParsed.given_name + " " + keycloak.idTokenParsed.family_name
        document.getElementById("loginTooltiptext").innerHTML = 'Click to log out.'
        document.getElementById("loginButton").setAttribute('onclick', 'logout();')
        document.getElementById('lockSymbol').style.display = 'none'
        document.getElementById('ernLogo').style.opacity = '1'
        toggleInterrogation(true)
      }
      else if (!authenticated) {
        currentUser.loggedIn = false
        currentUser.accessToken = ''
        currentUser.refreshToken = ''
        toggleInterrogation(false)
        document.getElementById("loginButtonText").innerHTML = 'Login'
        document.getElementById("loginTooltiptext").innerHTML = 'Click to log in.'
        //updateStatusText("success", "Successfully logged out.")
        document.getElementById("loginButton").setAttribute('onclick', 'login();')
        document.getElementById('lockSymbol').style.display = 'block'
        document.getElementById('lockSymbol').setAttribute('title', 'You need to be logged in to query this source.')
        document.getElementById('ernLogo').style.opacity = '.5'
      }
    })
    .catch(() => {
      console.error('Failed to initialize')
    });
  } catch (exception) {
    console.error("Error in auth.js:initKeycloak(): ", exception)
  }
}

window.logout = logout
window.login = login
window.refreshToken = refreshToken
window.initKeycloak = initKeycloak

export { currentUser }

