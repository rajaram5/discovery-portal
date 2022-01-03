/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<nav class="menu">\
<a href="https://www.ejprarediseases.org/" target="_blank"><img src="./static/media/ejp-rd-logo.png" alt="EJP-RD-Logo" class="ejpLogo"/></a>\
      <ul>\
        <div class="tooltip">\
          <li><a id="discoveryNavButton" class="menuButtonActive" href="/discovery">Resource Discovery</a></li>\
          <span class="navTooltiptext">Use this to query connected sources for rare disease information (Biobanks, Patient Registries, Knowledge Bases).</span>\
        </div>\
        <!-- <div class="tooltip" style="opacity: .5">\
          <li><a href="/discovery/mapping">RD-Code Mapping</a></li>\
          <span class="navTooltiptext">Use this to map from one rare disease ontology to another. For example from ICD to Orphanet.</span>\
          <!-- <div class="menuDropdown-content">\
            <a href="#" onclick="toggleTab(`mapperNavButton`, `mapperTab`, this)" title="ICD10 to Orphacode Mapper">ICD10 to Orphanet</a>\
            <a href="#" style="opacity: 50%; pointer-events: none;" title="Snomed to Orphacode Mapper">Snomed to Orphanet</span></a>\
            <a href="#" style="opacity: 50%; pointer-events: none;" title="OMIM to Orphacode Mapper">OMIM to Orphanet</span></a>\
            <a href="#" style="opacity: 50%; pointer-events: none;" title="UMLS to Orphacode Mapper">UMLS to Orphanet</span></a>\
            <a href="#" onclick="toggleTab(`mapperNavButton`, `mapperTab`, this)" title="Orphacode to Others Mapper">Orphanet to Others</span></a>\
          </div> -->\
        </div> -->\
        <div class="tooltip">\
          <li onclick="toggleListedSources(this);" class="listedSourcesCollapsible">\
            <a href="#" class="listedSources">Connected Sources</a>\
          </li>\
          <span class="navTooltiptext">Display a list of connected sources.</span>\
        </div>\
        <div class="tooltip">\
          <li>\
            <button type="button" id="loginButton" class="loginButton" onclick="toggleLoginModal(true);">\
              <img src="./static/media/userIcon.png" class="userIcon" />\
              <span id="loginButtonText">Login</span>\
            </button>\
            <span class="navTooltiptext loginTooltiptext" id="loginTooltiptext">Click to log in.</span>\
          </li>\
        </div>\
      </ul>\
    </nav>\
    <a href="/" class="backLink">&#8592; back</a>\
');