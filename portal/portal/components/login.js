/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div class="loginModal" id="loginModal">\
    <div class="modal-content animate">\
        <img src="./static/media/delete_red.png" onclick="toggleLoginModal(false);" class="close" title="Close" />\
        <div class="avatar">\
            <img src="./static/media/avatar.png" alt="Avatar" class="avatar">\
        </div>\
        <div>\
            <p>\
                <label for="uname"><b>Username</b></label>\
                <input type="text" placeholder="Enter Username" name="uname" id="usernameInput">\
            </p>\
            <p>\
                <label for="psw"><b>Password</b></label>\
                <input type="password" placeholder="Enter Password" name="psw" id="passwordInput" onkeyup="submitLogin();">\
            </p>\
            <button type="button" onclick="login();" class="loginSubmitButton" id="loginSubmitButton">Login</button>\
            <span class="loginStatusText" id="loginStatusText"></span>\
        </div>\
    </div>\
</div>\
')