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
  allTypesCheckbox, loginModal } from '/rsLPortal/scripts/components.js'
import { euCountries } from '/rsLPortal/static/countries.js'
import { toggleLoadingSpinner, clearInput, updateStatusText, 
  updateCatalogueListDOM, clearPreviousSearch, createResultListTable, 
  createResultListTableHeader, updateResultListDOM, selectedCountries, 
  selectedTypes } from '/rsLPortal/scripts/updateDom.js'
import { handleFetchErrors, extractRDCode, isNumber } from '/rsLPortal/scripts/utils.js'
import { currentUser } from '/rsLPortal/scripts/auth.js'

// define API endpoint addresses
const portalAddress = window.location.origin
const getDirectoryAddressEndpoint = portalAddress + "/getDirectoryAddress"
const searchEndpoint = portalAddress + "/search"

// global variables
let catalogueDirectoryAddress = ''
let getCataloguesEndpoint = ''
let catalogues = []
let orphaClassification = []
let icd10Classification = []

// function that is executed when the page is loaded
function init() {
  try {
    allTypesCheckbox.checked = true
    allTypesCheckbox.disabled = true
    allCountriesCheckbox.checked = true
    allCountriesCheckbox.disabled = true
    clearInput("all")
    getDirectoryAddress()
    loadClassification('../static/orphacodeClassification.txt', orphaClassification, "orpha")
    loadClassification('../static/icd10Classification.txt', icd10Classification, "icd10")
    loadCountryList()
    setResourceTypesList()
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
          getCataloguesEndpoint = catalogueDirectoryAddress + "/catalogues";
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

function mapTypes(types) {
  let mappedTypes = []
  for(let type of types) {
    if(type == 'Knowledge Bases') {
      mappedTypes.push('knowledge')
    }
    else if(type == 'Patient Registries') {
      mappedTypes.push('registry')
    }
    else if(type == 'Biobanks') {
      mappedTypes.push('biobank')
    }
  }
  return mappedTypes
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
            if (catalogue.catalogueType.includes(type)
            ) {
              let insertCatalogue = {
                catalogueName: catalogue.catalogueName,
                catalogueAddress: catalogue.catalogueAddress,
              };
              selectedCatalogues.push(insertCatalogue);
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
    console.error(
      "Error in clientScripts.js:getSelectedCatalogues(): ",
      exception
    );
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
    if(document.getElementById('MaleCheckbox').checked) {
      genders.push('male')
    }
    if(document.getElementById('FemaleCheckbox').checked) {
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
function buildSourceContent(source, responseList, filters) {
  try {
    console.log(source)
    console.log(filters)
    // create collapsible
    let sourceCollapsible = document.createElement("BUTTON")
    sourceCollapsible.setAttribute("id", source + "Collapsible")
    sourceCollapsible.classList.add("resultCollapsible")
    sourceCollapsible.classList.add("button")
    sourceCollapsible.classList.add("resultButton")
    sourceCollapsible.style.padding = "8px 15px 6px 30px"
    sourceCollapsible.setAttribute(
      "onClick",
      "toggleSourceResults(this);"
    )
    sourceCollapsible.setAttribute("name", source)
    
    // create source name span
    let sourceNameText = document.createElement("SPAN")
    sourceNameText.style.fontSize = "18px"
    sourceNameText.style.position = "relative"
    sourceNameText.style.top = "8px"
    sourceNameText.style.display = "inline-block"
    sourceNameText.style.width = "200px"
    sourceNameText.textContent = source
    sourceCollapsible.appendChild(sourceNameText)

    // create number of results span
    let numberOfResultsText = document.createElement("SPAN")
    numberOfResultsText.style.fontSize = "14px"
    numberOfResultsText.style.position = "relative"
    numberOfResultsText.style.top = "6px"
    numberOfResultsText.style.left = "30px"
    if(responseList['resourceResponses']) {
      if (responseList.resourceResponses.length == 1 || !Array.isArray(responseList.resourceResponses)) {
        numberOfResultsText.textContent = '1 Result'
      } 
      else {
        numberOfResultsText.textContent =
          "" + responseList.resourceResponses.length + " Results"
      }
    }
    else {
      if (responseList.length == 1) {
        numberOfResultsText.textContent =
          "" + responseList.length + " Result"
      } else {
        numberOfResultsText.textContent =
          "" + responseList.length + " Results"
      }
    }   
    sourceCollapsible.appendChild(numberOfResultsText)

    let matchingFilters = document.createElement("SPAN")
    matchingFilters.style.fontSize = "14px"
    matchingFilters.style.position = "relative"
    matchingFilters.style.top = "6px"
    matchingFilters.style.left = '40px'
    matchingFilters.style.color = 'white'

    switch (source) {
      case 'BBMRI-Eric': case 'Orphanet': 
        matchingFilters.textContent = `matching Filters: ${filters.disease} ${filters.types} ${filters.countries}`
        break
      case 'Cellosaurus': case 'hpscReg': case 'Wikipathways': 
        matchingFilters.textContent = `matching Filters: ${filters.disease} ${filters.types}`
        break
      case 'Leicester-ERN-Network': 
        matchingFilters.textContent = `matching Filters: ${filters.disease} ${filters.genders}`
        break
      default:
        console.info("Entering default switch of discovery.js:buildSourceContent().");
        break;
    }
    sourceCollapsible.appendChild(matchingFilters)

    resultList.appendChild(sourceCollapsible);

    let sourceContentDiv = document.createElement("div");
    sourceContentDiv.setAttribute("id", source + "Content");
    sourceContentDiv.setAttribute("class", source + "Content");
    sourceContentDiv.style.borderBottom = "1px solid white";
    let sourceResultContentTable = document.createElement(
      "table"
    );
    createResultListTable(sourceResultContentTable, source);
    updateResultListDOM(
      sourceResultContentTable,
      responseList,
      source
    );
    sourceContentDiv.appendChild(sourceResultContentTable);
    resultList.appendChild(sourceContentDiv);
  } catch (exception) {
    console.error("Error in clientScripts.js:buildSourceContent(): ", exception);
  }
}

// function that handles the search input
function discover() {
  try {
    if (searchInput.value.length < 1) {
      updateStatusText(
        "error",
        "Please enter a search term (rare disease name or orphacode)."
      );
      return;
    } 
    else {
      // clear state
      clearPreviousSearch();
      updateStatusText("none");
      let filters = {
        disease: '',
        types: '',
        countries: '',
        genders: ''
      }

      // get orphacode from input
      const disease = extractRDCode(searchInput.value, "orpha");
      if (disease == null || isNumber(searchInput.value)) {
        updateStatusText(
          "error",
          "Please select a valid search term from the dropdown list."
        );
        return;
      }
      filters.disease = searchInput.value

      // get selected sources
      const selectedSources = JSON.stringify(getSelectedSources(selectedTypes));
      if (selectedSources === "null") {
        resultList.textContent = "";
        updateStatusText(
          "error",
          "Please select at least one source to be searched."
        );
        return;
      }

      // check if insertion is a number, if yes search for matching entry in orphacode classification
      /*if(isNumber(searchInput.value)) {
        searchInput.value = orphaClassification.find(x => x.code === searchInput.value).name + ` [${searchInput.value}]`;
      }*/

      let query = "";
      // get country codes for selected countries
      if(selectedCountries.length > 0 && selectedTypes.length > 0) {
        const countryCodes = JSON.stringify(getCountryCodes());
        const selectedTypesForQuery = JSON.stringify(getSelectedTypes());
        if (countryCodes != null && selectedTypesForQuery != null) {
          query = `${searchEndpoint}?disease=${disease}&sources=${selectedSources}&types=${selectedTypesForQuery}&countries=${countryCodes}`;
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
          query = `${searchEndpoint}?disease=${disease}&sources=${selectedSources}&types=${selectedTypesForQuery}`;
          filters.types = JSON.parse(selectedTypesForQuery)
        }
      }
      else if (selectedCountries.length > 0) {
        const countryCodes = JSON.stringify(getCountryCodes());
        if(countryCodes != null) {
          query = `${searchEndpoint}?disease=${disease}&sources=${selectedSources}&countries=${countryCodes}`;
          filters.countries = JSON.parse(countryCodes)
        }
      }
      else {
        query = `${searchEndpoint}?disease=${disease}&sources=${selectedSources}`;
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

      // send out query
      toggleLoadingSpinner(searchButton, true, searchClearButton);
      // TODO: built in fetch to every catalogue, not one big fetch
      // adjust progess bar
      //progress++;
      //document.getElementById("searchProgressBar").style.width = `${100*(progress/responseData.length)}%`;
      fetch(query)
        .then(handleFetchErrors)
        .then(async (fetchResponse) => {
          //let numberOfResults = { biobankResults: 0, registryResults: 0, individualResults: 0 }
          if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
            const responseData = await fetchResponse.json()
            if (responseData.length > 0) {
              createResultListTableHeader()
              //let noResultsFound = [];
              //noResultsFound = sortResultsByType(responseData, numberOfResults);
              let responseList, progress = 0;
              for(let source of responseData) {
                if(source['content']) {
                  buildSourceContent(source.name, source['content'], filters)
                }
                else {
                  console.info(`No results received from ${source.name}.`)
                }
              }
              /*for (let type of resourceTypes) {
                responseList = resultsByResource[type.typeName]
                if(responseList.length > 0) {
                  buildResourceTypeContent(type, responseList)
                } else {
                  //noResultsFound.push(type.displayName)
                }
              }*/

              // after dom was created scroll to it
              //resultList.scrollIntoView();

              /*if (resultsByResource.BiobankDataset.length < 1 && resultsByResource.PatientRegistryDataset.length < 1) {
                toggleLoadingSpinner(searchButton, false, searchClearButton);
                resultList.textContent = "";
                updateStatusText(
                  "error",
                  "The entered search did not match any results."
                );
                return;
              }*/
            } else {
              toggleLoadingSpinner(searchButton, false, searchClearButton)
              resultList.textContent = ""
              clearInput("search")
              updateStatusText("error", "The entered search did not match any results.")
              return
            }
            toggleLoadingSpinner(searchButton, false, searchClearButton)
          } else {
            console.error("Error in clientScripts.js:discover(): Fetch response out of range.")
          }
        })
        .catch((exception) => {
          console.error("Error in clientScripts.js:discover():fetch(): ", exception)       
        });
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
          searchTerm = extractRDCode(mapperInput.value, "icd10");
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
            searchTerm = extractRDCode(mapperInput.value, "orpha");
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
function loadClassification(filename, classification, codeType) {
  try {
    fetch("./rsLPortal/" + filename)
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
          classificationEntry.code = extractRDCode(entry, codeType);
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
}

// function that handles the auto-complete
function autocomplete(input, array) {
  var currentFocus;
  input.addEventListener("input", function (e) {
    let list = document.createElement("DIV")
    list.setAttribute("id", this.id + "-autocomplete-list");
    list.setAttribute("class", "autocomplete-items");

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
          b.innerHTML += " [" + array[i].code + "]";
          b.innerHTML +=
            "<input type='hidden' value='" +
            array[i].name +
            " [" +
            array[i].code +
            "]" +
            "'>";
          b.addEventListener("click", function (e) {
            input.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
          });
        } else if (array[i].code.substr(0, val.length) == val) {
          b = document.createElement("DIV");
          b.innerHTML = array[i].name;
          b.innerHTML +=
            " [" +
            "<strong>" +
            array[i].code.substr(0, val.length) +
            "</strong>";
          b.innerHTML += array[i].code.substr(val.length) + "]";
          b.innerHTML +=
            "<input type='hidden' value='" +
            array[i].name +
            " [" +
            array[i].code +
            "]" +
            "'>";
          b.addEventListener("click", function (e) {
            input.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
          });
        }
        if(b != null) {
          if (array[i].code === val) {
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

  /*document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });*/
}

// make functions globally available
window.init = init
window.discover = discover
//window.mapRDCode = mapRDCode
//window.useCodeForSearch = useCodeForSearch