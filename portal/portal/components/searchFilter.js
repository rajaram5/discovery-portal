/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<button\
    class="button searchFilterButton collapsible"\
    id="searchFilterCollapsible"\
    onclick="toggleSearchFilter();"\
    >\
          Advanced Search\
</button>\
<div class="searchFilterContent" id="searchFilterContent">\
    <div class="resourceTypeContent" id="resourceTypeContent">\
        <table class="table">\
            <th style="width: 60%">\
                <span>Resource Type(s)</span>\
            </th>\
            <th style="width: 40%;">Countries</th>\
            <tr>\
                <td style="text-align: center;">\
                <select id="typesList" onchange="selectType(this);" style="width: 60%;">\
                        <option>Select specific resource types ...</option>\
                    </select>\
                    <input\
                        type="checkbox"\
                        id="allTypesCheckbox"\
                        style="scale: 1.5; margin-right: 10px; margin-left: 150px;"\
                        onclick="checkAllTypes(this.checked);"\
                        disabled\
                        checked />\
                    <label for="allTypesCheckbox">All</label>\
                </td>\
                <td style="text-align: center;">\
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
</div>\
')