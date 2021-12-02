/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<button\
    class="button recordInterogationButton collapsible"\
    id="recordInterogationCollapsible"\
    onclick="toggleRecordInterogation();"\
    >\
          Record Interrogation\
</button>\
<div class="recordInterogationContent" id="recordInterogationContent">\
    <table class="table">\
        <th style="width: 30%">\
            <span>Gender(s)</span>\
        </th>\
        <th style="width: 70%;">Age Range</th>\
        <tr>\
            <td style="text-align: center;">\
                <input\
                    type="checkbox"\
                    id="PatientRegistryDatasetCheckbox"\
                    style="scale: 1.5; margin-right: 10px"\
                    onclick="updateIncludedSources(this); removeTypeFromList(`PatientRegistryDataset`, this.checked);"\
                    name="registry"\
                    checked\
                />\
                <label for="PatientRegistryDatasetCheckbox" style="margin-right: 40px">Male</label>\
                <input\
                    type="checkbox"\
                    id="BiobankDatasetCheckbox"\
                    style="scale: 1.5; margin-right: 10px"\
                    onclick="updateIncludedSources(this); removeTypeFromList(`BiobankDataset`, this.checked);"\
                    name="biobank"\
                    checked\
                />\
                <label for="BiobankDatasetCheckbox">Female</label>\
            </td>\
            <td style="text-align: center;">\
                <label for="ageRangeMinSlider">Minimum Age</label>\
                <input type="range" id="ageRangeMinSlider" style="margin-left: 10px;" value="30" min="1" max="100" oninput="this.nextElementSibling.value = this.value">\
                <output style="margin-left: 10px;">30</output>\
                <label for="ageRangeMaxSlider" style="margin-left: 50px; top: -10px">Maximum Age</label>\
                <input type="range" id="ageRangeMaxSlider" style="margin-left: 10px;" value="70" min="1" max="100" oninput="this.nextElementSibling.value = this.value">\
                <output style="margin-left: 10px;">70</output>\
            </td>\
        </tr>\
    </table>\
</div>\
')