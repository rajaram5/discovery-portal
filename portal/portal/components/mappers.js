/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div id="mapperTab" class="tabDivs autocomplete" style="display: none">\
    <form>\
        <input\
                type="text"\
                placeholder="Insert rare disease code to be mapped ..."\
                class="searchBar"\
                id="mapperSearchBar"\
        />\
        <button type="button" class="clearButton" id="mapperClearButton" onclick="clearInput(`mapper`);"><img src="../discovery/static/media/close-icon.png" /></button>\
        <button\
            type="button"\
            class="button searchButton"\
            id="mapButton"\
            onclick="mapRDCode();"\
            >Map\
            <span class="spinner"></span>\
            <div id= "icd10ProgressBar" class="progress"></div>\
        </button>\
    </form>\
</div>\
')