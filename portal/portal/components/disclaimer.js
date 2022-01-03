/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div class="disclaimerDiv" id="disclaimerDiv">\
        <span id="disclaimerText" class="disclaimerText">\
          <h4>Disclaimer</h4>\
          <p>Please note that this is a <b>Beta Version</b> of the EJP-RD Resource Discovery Portal. The functionalities on this website are still limited and partially under development.</p>\
          <p>The results displayed are currently not using a resources full metadata potential and are therefore not as precise as they will be in the first major release of this platform.</p>\
          <p>Furthermore currently no information on the use and access conditions of the individual resources are being transmitted as well as no rare disease classification functionalities (e.g. Hierarchical Search) are being used.</p>\
        </span>\
        <button\
          class="disclaimerTextCloseButton"\
          id="disclaimerTextCloseButton"\
          onclick="closeDisclaimerText();"\
        >\
          <img src="../discovery/static/media/close-icon.png" />\
        </button>\
      </div>\
');
