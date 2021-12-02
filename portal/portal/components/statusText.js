/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div class="statusTextDiv" id="statusTextDiv">\
        <span id="statusText" class="statusText"></span>\
        <button\
          class="statusTextCloseButton"\
          id="statusTextCloseButton"\
          onclick="updateStatusText(`none`)"\
        >\
          <img src="../rsLPortal/static/media/close-icon.png" />\
        </button>\
      </div>\
');