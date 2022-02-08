/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

import { statusTextDiv, statusText, statusTextCloseButton,
  searchInput, mapperInput, knowledgeBaseInput, 
  searchClearButton, mapperClearButton, knowledgeBaseClearButton,
  searchButton, mapButton, knowledgeSearchButton, topButton,
  searchFilterCollapsible, listedSourcesCollapsible,
  filterList, catalogueList, resultList, allCountriesCheckbox, 
  allTypesCheckbox, loginModal } from '/discovery/scripts/components.js'
import { euCountries } from '/discovery/static/countries.js'
import { rareDiseases } from '/discovery/static/rareDiseases.js'
import { toggleLoadingSpinner, clearInput, updateStatusText, 
  updateCatalogueListDOM, clearPreviousSearch, createResultListTable, 
  createResultListTableHeader, updateResultListDOM, selectedCountries, 
  selectedTypes } from '/discovery/scripts/updateDom.js'
import { handleFetchErrors, extractRDCode, isNumber, isIcd } from '/discovery/scripts/utils.js'
import { currentUser } from '/discovery/scripts/auth.js'


// define API endpoint addresses
const portalAddress = window.location.origin
const getDirectoryAddressEndpoint = portalAddress + "/getDirectoryAddress"
const searchEndpoint = portalAddress + "/search"

// global variables
let catalogueDirectoryAddress = ''
let getCataloguesEndpoint = ''
let catalogues = []

// function that is executed when the page is loaded
function init() {
  try {
    allTypesCheckbox.checked = true
    allTypesCheckbox.disabled = true
    allCountriesCheckbox.checked = true
    allCountriesCheckbox.disabled = true
    clearInput("all")
    getDirectoryAddress()
    loadCountryList()
    setResourceTypesList()
    autocomplete(searchInput, rareDiseases);
  } catch (exception) {
    console.error("Error in clientScripts.js:init(): ", exception)
  }
}

// function that loads the country list from disk
function loadCountryList() {
  try {
    let dropdownList = document.getElementById('countryList')
    for(let i = 1; i <= euCountries.length; i++) {
      dropdownList.options[i] = new Option(euCountries[i - 1].name)
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:loadCountryList(): ", exception)
  }
}

// function that sets the selectable resource types list
function setResourceTypesList() {
  try {
    let dropdownList = document.getElementById('typeList')
    dropdownList.options[1] = new Option("Patient Registries")
    dropdownList.options[2] = new Option("Biobanks")
    dropdownList.options[3] = new Option("Knowledge Bases")
  } catch (exception) {
    console.error("Error in clientScripts.js:loadCountryList(): ", exception)
  }
}

// function that retrieves the catalogue directory address from the query portal
async function getDirectoryAddress() {
  try {
    //toggleCatalogueListLoadingSpinner(true)
    await fetch(getDirectoryAddressEndpoint)
      .then(handleFetchErrors)
      .then(async (fetchResponse) => {
        if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
          catalogueDirectoryAddress = await fetchResponse.json();
          getCataloguesEndpoint = catalogueDirectoryAddress + "/catalogues/";
        } else {
          //toggleCatalogueListLoadingSpinner(false);
          console.error("Error in clientScripts.js:getDirectoryAddress(): Fetch response out of range.");
        }
      })
      .then(() => {
        if(catalogueDirectoryAddress != null) {
          getCatalogues();
        }
        else {
          catalogues = null;
          updateStatusText("error", "Address Directory is currently not accessible.");
          return;
        }
      })
      .catch((exception) => {
        console.error("Error in clientScripts.js:getDirectoryAddress():fetch(): ", exception);
      });
  } catch (exception) {
    console.error("Error in clientScripts.js:getDirectoryAddress(): ", exception);
  }
}

// function that updates the catalogue list DOM element
async function updateCatalogueList() {
  try {
    let catalogueListTable = document.createElement("table");
    catalogueListTable.setAttribute("class", "table");

    for (let catalogue of catalogues) {
      updateCatalogueListDOM(catalogue, null, catalogueListTable);
      /*await fetch(`${pingEndpoint}?address=${catalogue.catalogueAddress}`)
        .then(handleFetchErrors)
        .then((fetchResponse) => {
          updateCatalogueListDOM(catalogue, fetchResponse, catalogueListTable);
        })
        .catch((exception) =>
          console.error(
            "Error in clientScripts.js:updateCatalogueList():fetch(): ",
            exception
          )
        );*/
    }
    catalogueList.appendChild(catalogueListTable);
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:updateCatalogueList(): ",
      exception
    );
  }
}

// function that queries all catalogues from the catalogue directory
async function getCatalogues() {
  try {
    //toggleCatalogueListLoadingSpinner(true);
    await fetch(getCataloguesEndpoint)
      .then(handleFetchErrors)
      .then(async (fetchResponse) => {
        if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
          const data = await fetchResponse.json();
          catalogues = data;
        } else {
          console.error("Error in clientScripts.js:getCatalogues(): Fetch response out of range.");
        }
      })
      .then(() => {
        updateCatalogueList();
        //toggleCatalogueListLoadingSpinner(false);
      })
      .catch((exception) => {
        console.error(exception);
      });
  } catch (exception) {
    console.error("Error in clientScripts.js:getCatalogues() ", exception);
  }
}

// function that maps resource type naming
function mapTypes(types) {
  try {
    let mappedTypes = []
    for(let type of types) {
      if(type == 'Knowledge Bases') {
        mappedTypes.push('knowledge')
      }
      else if(type == 'KnowledgeDataset') {
        mappedTypes.push('Knowledge Bases')
      }
      else if(type == 'Patient Registries') {
        mappedTypes.push('registry')
      }
      else if(type == 'PatientRegistryDataset') {
        mappedTypes.push('Patient Registries')
      }
      else if(type == 'Biobanks') {
        mappedTypes.push('biobank')
      }
      else if(type == 'BiobankDataset') {
        mappedTypes.push('Biobanks')
      }
    }
    return mappedTypes
  } catch (exception) {
    console.error("Error in clientScripts.js:mapTypes(): ", exception);
  } 
}

// function that maps country naming
function mapCountries(countries) {
  try {
    let mappedCountries = []
    for(let country of countries) {
      let found = euCountries.find(x => x.countryCode === country).name
      mappedCountries.push(found)
    }

    return mappedCountries
  } catch (exception) {
    console.error("Error in clientScripts.js:mapCountries(): ", exception);
  } 
}

// function that returns a list of the selected catalogues
function getSelectedSources(selectedTypes) {
  try {
    if(catalogues !== null) {
      let selectedCatalogues = [];
      if(selectedTypes.length < 1) {
        for (let catalogue of catalogues) {
          let insertCatalogue = {
            catalogueName: catalogue.catalogueName,
            catalogueAddress: catalogue.catalogueAddress,
          };
          selectedCatalogues.push(insertCatalogue);
        }
      }
      else {
        let mappedTypes = mapTypes(selectedTypes)
        for (let catalogue of catalogues) {
          for(let type of mappedTypes) {
            if (catalogue.catalogueType.includes(type)) {
              let insertCatalogue = {
                catalogueName: catalogue.catalogueName,
                catalogueAddress: catalogue.catalogueAddress,
              };
              if(selectedCatalogues.findIndex(x => x.catalogueName == insertCatalogue.catalogueName) === -1) {
                selectedCatalogues.push(insertCatalogue);
              }
            }
          }
        }
      }
      if(selectedCatalogues.length > 0) {
        return selectedCatalogues;
      }
      else {
          return null;
      }
    }
    else {
      updateStatusText("error", "Address Directory is currently not accessible.");
      return null;
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:getSelectedCatalogues(): ", exception)
  }
}

// function that returns a list of the selected types
function getSelectedTypes() {
  try {
    let types = [];
    if(selectedTypes.includes("Patient Registries")) {
      types.push("PatientRegistryDataset");
    }
    if(selectedTypes.includes("Biobanks")) {
      types.push("BiobankDataset");
    }
    if(selectedTypes.includes("Knowledge Bases")) {
      types.push("KnowledgeDataset");
    }
    if(types.length > 0) {
      return types;
    }
    else {
        return null;
    }
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:getSelectedCatalogues(): ",
      exception
    );
  }
}

// function that returns a list of country codes for the given country names
function getCountryCodes() {
  try {
    let countryCodes = [];
    for(let i = 0; i < selectedCountries.length; i++) {
      let object = euCountries.find(function(country, index) {
	      if(country.name == selectedCountries[i]) {
          return true;
        }
      });
      if(object) {
        countryCodes.push(object.countryCode)
      }
    }
    if(countryCodes.length > 0) {
      return countryCodes;
    }
    else {
      return null;
    }
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:getCountryCodes(): ",
      exception
    );
  }
}

// function that returns a list of selected gender filter checkboxes
function getGenders() {
  try {
    let genders = [];
    if(document.getElementById('maleCheckbox').checked && !document.getElementById('femaleCheckbox').checked) {
      genders.push('male')
    }
    if(document.getElementById('femaleCheckbox').checked && !document.getElementById('maleCheckbox').checked) {
      genders.push('female')
    }

    if(genders.length > 0) {
      return genders;
    }
    else {
      return null;
    }
  } catch (exception) {
    console.error('Error in clientScripts.js:getGenders(): ', exception);
  }
}

// function that builds the result list DOM for a resource type
function buildSourceContent(sourceName, content, filters) {
  try {
    // create collapsible
    let sourceCollapsible = document.createElement("BUTTON")
    sourceCollapsible.setAttribute("id", sourceName + "Collapsible")
    sourceCollapsible.classList.add("resultCollapsible")
    sourceCollapsible.classList.add("button")
    sourceCollapsible.classList.add("resultButton")
    sourceCollapsible.style.padding = "8px 15px 6px 30px"
    sourceCollapsible.setAttribute("onClick", "toggleSourceResults(this);")
    sourceCollapsible.setAttribute("name", sourceName)
    
    // create source name span
    let sourceNameText = document.createElement("SPAN")
    sourceNameText.style.fontSize = "18px"
    sourceNameText.style.position = "relative"
    sourceNameText.style.display = "inline-block"
    sourceNameText.style.width = "200px"
    sourceNameText.textContent = sourceName
    sourceCollapsible.appendChild(sourceNameText)

    // create number of results span
    let numberOfResultsText = document.createElement("SPAN")
    numberOfResultsText.style.fontSize = "15px"
    numberOfResultsText.style.position = "relative"
    numberOfResultsText.style.display = 'inline-block'
    numberOfResultsText.style.width = '160px'
    if(sourceName === 'ERKNet' || sourceName === 'UIMD' || sourceName === 'EREC') {
      numberOfResultsText.textContent = '1 Dataset Result'
    }
    else {
      if(content['resourceResponses']) {
        if (content.resourceResponses.length == 1 || !Array.isArray(content.resourceResponses)) {
          numberOfResultsText.textContent = '1 Metadata Result'
        } 
        else {
          numberOfResultsText.textContent =
            "" + content.resourceResponses.length + " Metadata Results"
        }
      }
      else {
        if (content.length == 1) {
          numberOfResultsText.textContent =
            "1 Metadata Result"
        } else {
          numberOfResultsText.textContent =
            "" + content.length + " Metadata Results"
        }
      }   
    }
    sourceCollapsible.appendChild(numberOfResultsText)

    let matchingRdCode = document.createElement("SPAN")
    matchingRdCode.style.fontSize = "14px"
    matchingRdCode.style.backgroundColor = "white"
    matchingRdCode.style.color = 'black'
    matchingRdCode.style.position = "relative"
    matchingRdCode.style.margin = "8px"
    matchingRdCode.style.padding = '5px'
    matchingRdCode.style.display = 'inline-block'
    matchingRdCode.textContent = `ORPHA:${filters.disease}`
    
    sourceCollapsible.appendChild(matchingRdCode)

    let matchingTypes = document.createElement("SPAN")
    matchingTypes.style.fontSize = "14px"
    matchingTypes.style.position = "relative"
    matchingTypes.style.margin = '8px'
    matchingTypes.style.color = '#333'
    let types = mapTypes(filters.types)
    for(let type of types) {
      let matchingType = document.createElement("SPAN")
      matchingType.style.backgroundColor = '#3bb392'
      matchingType.style.padding = '5px'
      matchingType.style.margin = '2px'
      matchingType.style.display = 'inline-block'
      matchingType.textContent = type
      matchingTypes.appendChild(matchingType)
    }

    sourceCollapsible.appendChild(matchingTypes)

    if(sourceName === 'BBMRI-Eric' || sourceName === 'Orphanet') {
      let matchingCountries = document.createElement("SPAN")
      matchingCountries.style.fontSize = "14px"
      matchingCountries.style.position = "relative"
      matchingCountries.style.margin = '8px'
      matchingCountries.style.color = '#333'
      let countries = mapCountries(filters.countries)
      for(let country of countries) {
        let matchingCountry = document.createElement("SPAN")
        matchingCountry.style.backgroundColor = '#fecf00'
        matchingCountry.style.margin = '2px'
        matchingCountry.style.padding = '5px'
        matchingCountry.style.display = 'inline-block'
        matchingCountry.textContent = country
        matchingCountries.appendChild(matchingCountry)
      }

      sourceCollapsible.appendChild(matchingCountries)
    }

    if(sourceName === 'UIMD' || sourceName === 'ERKNet' || sourceName === 'EREC') {
      let matchingGenders = document.createElement("SPAN")
      matchingGenders.style.fontSize = "14px"
      matchingGenders.style.position = "relative"
      matchingGenders.style.margin = '8px'
      matchingGenders.style.color = '#333'
      for(let gender of filters.genders) {
        let matchingGender = document.createElement("SPAN")
        matchingGender.style.backgroundColor = '#ff8383'
        matchingGender.style.margin = '2px'
        matchingGender.style.display = 'inline-block'
        matchingGender.style.padding = '5px'
        matchingGender.textContent = gender.charAt(0).toUpperCase() + gender.slice(1)
        matchingGenders.appendChild(matchingGender)
      }

        sourceCollapsible.appendChild(matchingGenders)
    }

    resultList.appendChild(sourceCollapsible);

    let sourceContentDiv = document.createElement("div")
    sourceContentDiv.setAttribute("id", sourceName + "Content")
    sourceContentDiv.setAttribute("class", sourceName + "Content")
    sourceContentDiv.style.borderBottom = "1px solid white"

    let sourceResultContentTable = document.createElement("table")
    sourceResultContentTable.classList.add('table')
    if(sourceName === 'BBMRI-Eric' || 
      sourceName === 'Orphanet' || 
      sourceName === 'Cellosaurus' || 
      sourceName === 'hpscReg' || 
      sourceName === 'Wikipathways') {
      createResultListTable(sourceResultContentTable);
    }

    updateResultListDOM(
      sourceResultContentTable,
      content,
      sourceName
    );

    sourceContentDiv.appendChild(sourceResultContentTable);
    resultList.appendChild(sourceContentDiv);
  } catch (exception) {
    console.error("Error in clientScripts.js:buildSourceContent(): ", exception);
  }
}

// function that handles the search input
async function discover() {
  try {
    searchInput.blur()
    // validate input
    if (searchInput.value.length < 1) {
      updateStatusText("error", "Please enter a search term (rare disease name or orpha/icd10 code).")
      return
    }
    if(!document.getElementById('femaleCheckbox').checked && !document.getElementById('maleCheckbox').checked) {
      updateStatusText("error", "Please select at least one gender option to be searched.")
      return
    }
    // check if insertion is a number or icd code, if yes search for matching entry in rare disease classification
    if(isNumber(searchInput.value) || isIcd(searchInput.value)) {
      let found = rareDiseases.filter(x => x.orphaCode === searchInput.value || x.icdCode === searchInput.value)[0]
      if(found != undefined && isNumber(searchInput.value)) {
        searchInput.value = found.name +  ` [ORPHA:${found.orphaCode}]`
      }
      else if(found != undefined && isIcd(searchInput.value)) {
        searchInput.value = found.name +  ` [ICD10:${found.icdCode}]`
      }
      else {
        updateStatusText("error", `No match could be found in the rare disease ontology for ${searchInput.value}.`)
        return
      }
    }

    // clear state
    clearPreviousSearch();
    updateStatusText("none");
    let filters = {
      disease: '',
      types: '',
      countries: '',
      genders: ''
    }
    let query = '';

    // get orphacode from input
    let diseaseCode = extractRDCode(searchInput.value);
    if(searchInput.value.includes('ICD10:')) {
      diseaseCode = rareDiseases.find(x => x.icdCode === diseaseCode).orphaCode
    }
    if (diseaseCode == null || isNumber(searchInput.value)) {
      updateStatusText("error", "Please select a valid search term from the dropdown list.")
      return
    }
    filters.disease = diseaseCode

    // get selected sources
    const selectedSources = getSelectedSources(selectedTypes);
    if (selectedSources === "null") {
      resultList.textContent = "";
      updateStatusText(
        "error",
        "Please select at least one source to be searched."
      );
      return;
    }

    // get country codes for selected countries
    if(selectedCountries.length > 0 && selectedTypes.length > 0) {
      const countryCodes = JSON.stringify(getCountryCodes());
      const selectedTypesForQuery = JSON.stringify(getSelectedTypes());
      if (countryCodes != null && selectedTypesForQuery != null) {
        query = `${searchEndpoint}?disease=${diseaseCode}&types=${selectedTypesForQuery}&countries=${countryCodes}`;
        filters.countries = JSON.parse(countryCodes)
        filters.types = JSON.parse(selectedTypesForQuery)
      }
      else {
        resultList.textContent = "";
        updateStatusText(
          "error",
          "Country codes could not be retrieved from selected countries."
        );
        return;
      }
    }
    else if (selectedTypes.length > 0) {
      const selectedTypesForQuery = JSON.stringify(getSelectedTypes());
      if (selectedTypesForQuery != null) {
        query = `${searchEndpoint}?disease=${diseaseCode}&types=${selectedTypesForQuery}`;
        filters.types = JSON.parse(selectedTypesForQuery)
      }
    }
    else if (selectedCountries.length > 0) {
      const countryCodes = JSON.stringify(getCountryCodes());
      if(countryCodes != null) {
        query = `${searchEndpoint}?disease=${diseaseCode}&countries=${countryCodes}`;
        filters.countries = JSON.parse(countryCodes)
      }
    }
    else {
      query = `${searchEndpoint}?disease=${diseaseCode}`;
    }

    if(currentUser.loggedIn) {
      query += `&token=${currentUser.accessToken}&refreshToken=${currentUser.refreshToken}`
    }

    if(currentUser.loggedIn) {
      const selectedGenders = getGenders()
      query += `&genders=${selectedGenders}`
      if(selectedGenders) {
        filters.genders = selectedGenders
      }   
    }

    // send out queries
    toggleLoadingSpinner(searchButton, true, searchClearButton)
    let progress = 0
    let resultCount = 0
    let headerCreated = false
    for(let source of selectedSources) { 
      await fetch(query + `&source=${JSON.stringify(source)}`)
      .then(handleFetchErrors)
      .then(async (fetchResponse) => {
        if (fetchResponse.status >= 200 && fetchResponse.status <= 404) {
          const responseData = await fetchResponse.json()
          if (responseData['content']) {
            if(!headerCreated) {
              createResultListTableHeader(resultList)
              headerCreated = true
            }
            resultCount++
            buildSourceContent(responseData.name, responseData['content'], filters)
          }
        } else {
          console.error("Error in clientScripts.js:discover(): Fetch response out of range.")
        }
      })
      .catch((exception) => {
        console.error("Error in clientScripts.js:discover():fetch(): ", exception)       
      })
      progress++
      document.getElementById("searchProgressBar").style.width = `${100*(progress/selectedSources.length)}%`
    }
    toggleLoadingSpinner(searchButton, false, searchClearButton)
    document.getElementById("searchProgressBar").style.width = 0
    if(resultCount < 1) {
      updateStatusText("error", "The entered search term did not match any results.")
      resultList.textContent = ''
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:discover(): ", exception)
  }
}

// function that fetches orphanet mapping service results for an icd10 code
/*function mapRDCode() {
  try {
    resultList.textContent = ""
    if (mapperInput.value.length < 1) {
        updateStatusText(
          "error",
          "Please enter a valid rare disease code to be mapped."
        );
        return;
    } 
    else {
      let searchTerm, mappedCodes = [], exactMatches = [], nTBT = [], bTNT = [];
      switch(selectedMapper) {
        case "ICD10 to Orphacode Mapper":
          searchTerm = extractRDCode(mapperInput.value);
          if (searchTerm == null) {
            updateStatusText("error", "Please select a valid search term from the dropdown list.");
            return;
          }
          if (hasLowerCase(searchTerm)) {
            updateStatusText("error", "Invalid input character. Please only use uppercase letters and numerics.");
            return;
          }
          else {
            updateStatusText('none');
            let codeToBeMapped = searchTerm
            toggleLoadingSpinner(mapButton, true, mapperClearButton);
            fetch(`${mappingEndpoint}?from=icd&code=${codeToBeMapped}&to=orphanet`)
              .then(handleFetchErrors)
              .then(async (fetchResponse) => {
                if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
                  const data = await fetchResponse.json();
                  exactMatches = data.exactMatch;
                  nTBT = data.nTBT;
                  bTNT = data.bTNT;
                  mappedCodes = exactMatches.concat(bTNT, nTBT);
                } else {
                  mappedCodes = "";
                  updateStatusText(
                    "error",
                    `The entered code ${codeToBeMapped} is either no valid ICD10 code or could not be exactly mapped to an orphacode.`
                  );
                }
              })
              .then(() => {
                toggleLoadingSpinner(mapButton, false, mapperClearButton);
                if (mappedCodes != "") {
                  createResultListTableHeader();
                  buildMapperResultContent(mappedCodes, "orpha");
                } else {
                  clearInput("mapper");
                  updateStatusText(
                    "error",
                    `The entered code ${codeToBeMapped} is either no valid ICD10 code or could not be exactly mapped to an orphacode.`
                  );
                }
              })
              .catch((exception) => {
                console.error(exception);
              });
            }
            break;

          case "Orphacode to Others Mapper": 
            searchTerm = extractRDCode(mapperInput.value);
            if (searchTerm == null) {
              updateStatusText("error", "Please select a valid search term from the dropdown list.");
              return;
            }
            else {
              updateStatusText('none');
              let codeToBeMapped = searchTerm
              toggleLoadingSpinner(mapButton, true, mapperClearButton);
              fetch(`${mappingEndpoint}?from=orphanet&code=${codeToBeMapped}`)
                .then(handleFetchErrors)
                .then(async (fetchResponse) => {
                  if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
                    const data = await fetchResponse.json();
                    mappedCodes = data.exactMatch
                  } else {
                    mappedCodes = "";
                    updateStatusText(
                      "error",
                      `The entered code ${codeToBeMapped} is either no valid Orphacode or could not be exactly mapped to other rare disease codes.`
                    );
                  }
                })
                .then(() => {
                  toggleLoadingSpinner(mapButton, false, mapperClearButton);
                  if (mappedCodes != "") {
                    createResultListTableHeader();
                    buildMapperResultContent(mappedCodes, "other");
                  } else {
                    clearInput("mapper");
                    updateStatusText(
                      "error",
                      `The entered code ${codeToBeMapped} is either no valid Orphacode or could not be exactly mapped to other rare disease codes.`
                    );
                  }
                })
                .catch((exception) => {
                  console.error(exception);
                });
              }
              break;
        }
      }
  } catch (exception) {
    console.error("Error in clientScripts.js:getCatalogues() ", exception);
  }
}*/

// function that loads the rare disease classification from file
/*function loadClassification(filename, classification, codeType) {
  try {
    fetch("./discovery/" + filename)
      .then(handleFetchErrors)
      .then(async (fetchResponse) => {
        const data = await fetchResponse.text();
        let tmpClassification = data.split("\n");
        tmpClassification.forEach((entry) => {
          let classificationEntry = {
            name: "",
            code: "",
          };
          classificationEntry.name = entry.substr(0, entry.indexOf("[") - 1);
          classificationEntry.code = extractRDCode(entry);
          classification.push(classificationEntry);
        });
      })
      .then(() => {
        switch(codeType) {
          case "orpha": {
            autocomplete(searchInput, classification);
            //autocomplete(knowledgeBaseInput, classification);
        }
          case "icd10": {
            //autocomplete(mapperInput, classification);
          }
        }
      })
      .catch((exception) => {
        console.error(exception);
      });
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:loadClassification(): ",
      exception
    );
  }
}*/

// function that handles the auto-complete
function autocomplete(input, array) {
  var currentFocus;
  input.addEventListener("input", function (e) {
    let list = document.createElement("DIV")
    list.setAttribute("id", this.id + "-autocomplete-list");
    list.setAttribute("class", "autocomplete-items");

    if(input.value.length > 50) {
      input.style.fontSize = '18px'
    }
    else {
      input.style.fontSize = '20px'
    }

    if (input.value.length > 1) { 
      let val = this.value;
      closeAllLists();
      currentFocus = -1;
      this.parentNode.appendChild(list);
      for (let i = 0; i < array.length; i++) {
        let b = null, index = -1;
        if ((index = array[i].name.toUpperCase().indexOf(val.toUpperCase())) > -1) {
          b = document.createElement("DIV");
          b.innerHTML += array[i].name.substr(0, index);
          b.innerHTML += "<strong>" + array[i].name.substr(index, val.length) + "</strong>";
          b.innerHTML += array[i].name.substr(index + val.length);
          b.innerHTML += " [ORPHA:" + array[i].orphaCode + "]";
          b.innerHTML +=
            "<input type='hidden' value='" +
            array[i].name +
            " [ORPHA:" +
            array[i].orphaCode +
            "]" +
            "'>";
          b.addEventListener("click", function (e) {
            input.value = this.getElementsByTagName("input")[0].value;
            if(input.value.length > 50) {
              input.style.fontSize = '18px'
            }
            else {
              input.style.fontSize = '20px'
            }
            closeAllLists();
          });
        } else if (array[i].orphaCode.substr(0, val.length) == val) {
          b = document.createElement("DIV");
          b.innerHTML = array[i].name;
          b.innerHTML +=
            " [" +
            'ORPHA:' +
            "<strong>" +
            array[i].orphaCode.substr(0, val.length) +
            "</strong>";
          b.innerHTML += array[i].orphaCode.substr(val.length) + "]";
          b.innerHTML +=
            "<input type='hidden' value='" +
            array[i].name +
            " [ORPHA:" +
            array[i].orphaCode +
            "]" +
            "'>";
          b.addEventListener("click", function (e) {
            input.value = this.getElementsByTagName("input")[0].value;
            if(input.value.length > 50) {
              input.style.fontSize = '18px'
            }
            else {
              input.style.fontSize = '20px'
            }
            closeAllLists();
          });
        }
        else if (array[i].icdCode.substr(0, val.length) == val) {
          b = document.createElement("DIV");
          b.innerHTML = array[i].name;
          b.innerHTML +=
            " [" +
            'ICD10:' +
            "<strong>" +
            array[i].icdCode.substr(0, val.length) +
            "</strong>";
          b.innerHTML += array[i].icdCode.substr(val.length) + "]";
          b.innerHTML +=
            "<input type='hidden' value='" +
            array[i].name +
            " [ICD10:" +
            array[i].icdCode +
            "]" +
            "'>";
          b.addEventListener("click", function (e) {
            input.value = this.getElementsByTagName("input")[0].value;
            if(input.value.length > 50) {
              input.style.fontSize = '18px'
            }
            else {
              input.style.fontSize = '20px'
            }            
            closeAllLists();
          });
        }
        if(b != null) {
          if (array[i].orphaCode === val || array[i].icdCode === val) {
            list.prepend(b);
          } else if (index == 0) {
            list.prepend(b);
          } else {
            list.appendChild(b);
          }
        }
      }
    }
    else {
      closeAllLists();
      return false;
    }
  });

   input.addEventListener("keydown", function (e) {
     var x = document.getElementById(this.id + "-autocomplete-list");
     if (x) {
        x = x.getElementsByTagName("div");
     }
     if (e.keyCode == 40) {
       currentFocus++;
       addActive(x);
       input.value = x[currentFocus].textContent;
     } else if (e.keyCode == 38) {
       currentFocus--;
       addActive(x);
       input.value = x[currentFocus].textContent;
     } else if (e.keyCode == 13) {
       e.preventDefault();
       if (currentFocus > -1) {
         if (x) x[currentFocus].click();
       }
       closeAllLists()
       discover()
     }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

// make functions globally available
window.init = init
window.discover = discover
//window.mapRDCode = mapRDCode
//window.useCodeForSearch = useCodeForSearch
