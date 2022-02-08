/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div id="discoveryTab" class="tabDivs autocomplete">\
    <form autocomplete="off">\
    <button type="button" class="clearButton" id="searchClearButton" onclick="clearInput(`search`);"><img src="../discovery/static/media/delete_red.png" /></button>\
        <input\
            type="text"\
            placeholder="Search by rare disease name or orphacode ..."\
            class="searchBar"\
            id="discoverySearchBar"\
        />\
        <ul id="filterList" class="filterList"><span id="filterListText" class="filterListText">No filters applied</span></ul>\
        <button\
            type="button"\
            class="searchButton"\
            id="searchButton"\
            onclick="discover();">\
            <img id="magnifier-icon" src="./static/media/magnifier_white_large.png" onmouseover="this.src=`./static/media/magnifier_blue_large.png`" onmouseout="this.src=`./static/media/magnifier_white_large.png`" />\
            <span class="spinner"></span>\
            <div id= "searchProgressBar" class="progress"></div>\
        </button>\
        <button\
            type="button"\
            class="advancedSearchButton advancedSearchCollapsible"\
            id="advancedSearchButton"\
            onclick="toggleAdvancedSearchTab();">Filter Search<img id="advancedSearchArrow" src="./static/media/downArrow_small_white.png" class="advancedSearchArrow" />\
        </button>\
    </form>\
    <div id="advancedSearchTab" class="advancedSearchTab">\
        <div id="searchOptions" class="searchOptions">\
            <table class="table">\
                <tr>\
                    <th colspan="2" style="border-bottom: 1px solid white; font-weight: bold;">Metadata Filter Options</th>\
                </tr>\
                <tr>\
                    <th style="font-size: 15px; color: #3bb392;">Resource Type(s)</th>\
                    <th style="font-size: 15px; color: #fecf00;">Countries</th>\
                </tr>\
                <tr>\
                    <td>\
                        <select id="typeList" onchange="selectType(this);" style="width: 60%;">\
                            <option>Select specific resource types ...</option>\
                        </select>\
                        <input\
                            type="checkbox"\
                            id="allTypesCheckbox"\
                            style="scale: 1.5; margin-right: 10px; margin-left: 50px;"\
                            onclick="clearTypeList(this.checked);"\
                            disabled\
                            checked />\
                        <label for="allTypesCheckbox">All</label>\
                    </td>\
                    <td>\
                        <select id="countryList" onchange="selectCountry(this);" style="width: 60%;">\
                            <option>Select specific countries ...</option>\
                        </select>\
                        <input\
                            type="checkbox"\
                            id="allCountriesCheckbox"\
                            style="scale: 1.5; margin-right: 10px; margin-left: 50px;"\
                            onclick="clearCountryList(this.checked);"\
                            disabled\
                            checked />\
                        <label for="allCountriesCheckbox">All</label>\
                    </td>\
                </tr>\
            </table>\
        </div>\
        <div class="tooltip">\
            <div id="recordInterrogation" class="recordInterrogation">\
            <>Hello</span>\
                <table class="table">\
                    <tr>\
                        <th colspan="2" style="border-bottom: 1px solid white; font-weight: bold;"">Dataset Filter Options</th>\
                    </tr>\
                    <tr>\
                        <th style="width: 52%; font-size: 15px; color: #ff8383">Gender(s)</th>\
                        <th style="width: 48%; font-size: 15px; color: #ff8383">Age Range</th>\
                    </tr>\
                    <tr>\
                        <td>\
                            <input\
                                type="checkbox"\
                                id="maleCheckbox"\
                                style="scale: 1.5; margin-right: 10px;"\
                                onclick="selectGender(this);"\
                                name="male"\
                                checked\
                            />\
                            <label for="MaleCheckbox" style="margin-right: 40px">Male</label>\
                            <input\
                                type="checkbox"\
                                id="femaleCheckbox"\
                                style="scale: 1.5; margin-right: 10px;"\
                                onclick="selectGender(this);"\
                                name="female"\
                                checked\
                            />\
                            <label for="FemaleCheckbox">Female</label>\
                        </td>\
                        <td>\
                            <label for="ageRangeMinSlider" style="position: relative; top: -5px;">Minimum Age</label>\
                            <input type="range" id="ageRangeMinSlider" style="margin-left: 10px;" value="1" min="0" max="90" step="10" oninput="this.nextElementSibling.value = this.value">\
                            <output style="margin-left: 10px; position: relative; top: -5px;">0</output>\
                            <p><label for="ageRangeMaxSlider" style="position: relative; top: -5px;">Maximum Age</label>\
                            <input type="range" id="ageRangeMaxSlider" style="margin-left: 10px;" value="100" min="10" max="100" step="10" oninput="this.nextElementSibling.value = this.value">\
                            <output style="margin-left: 10px; position: relative; top: -5px;">100</output></p>\
                        </td>\
                    </tr>\
                </table>\
            </div>\
            <img src="./static/media/locked_grey.png" style="position: absolute; left: 950px; top: 110px;" id="interrogationTabLockSymbol" />\
            <span class="interrogationTabTooltiptext" id="interrogationTabTooltiptext">You need to be logged in to use these filter options.</span>\
        </div>\
    </div>\
</div>\
')