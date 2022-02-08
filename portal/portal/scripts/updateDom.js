/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict";

import { filterList, searchInput, filterListText } from './components.js'
import { currentUser } from './auth.js'
import { scrollToTop } from './utils.js'

let selectedCountries = []
let selectedTypes = []

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == loginModal) {
      loginModal.style.display = "none";
    }
}
  
// listeners
searchInput.addEventListener('input', toggleSearchClearButton)
//mapperInput.addEventListener('input', toggleMapperClearButton)

// function that toggles the loading spinner
function toggleLoadingSpinner(button, isLoading, clearButton) {
    try {
      if (isLoading) {
        button.classList.add("spin")
        document.getElementById("magnifier-icon").style.display = "none"
        button.disabled = true
        button.form.firstElementChild.disabled = true
        clearButton.style.display = "none"
        //document.getElementById("searchProgressBar").style.width = "10%"   
      } else {
        button.classList.remove("spin")
        document.getElementById("magnifier-icon").style.display = "inline-block"
        button.disabled = false
        button.form.firstElementChild.disabled = false
        clearButton.style.display = "inline-block"
        //document.getElementById("searchProgressBar").style.width = "0%"
      }
    } catch (exception) {
      console.error("Error in clientScripts.js:toggleLoadingSpinner(): ", exception)
    }
}

// function that toggles the record interrogation filter tab
function toggleInterrogation(showTab) {
    try {
      let tab = document.getElementById("recordInterrogation")
      switch (showTab) {
        case true:
          tab.style.opacity = 1
          tab.style.pointerEvents = "visible"
          //document.getElementById("interrogationTabTooltiptext").innerHTML = ''
          document.getElementById("interrogationTabLockSymbol").style.visibility = 'hidden'
          break;
        case false:
          tab.style.opacity = .5
          tab.style.pointerEvents = "none"
          //document.getElementById("interrogationTabTooltiptext").innerHTML = 'You need to be logged in to use these filter options.'
          document.getElementById("interrogationTabLockSymbol").style.visibility = 'visible'
          break;
        default:
          console.info("Entering default switch of clientScripts.js:toggleInterrogation().");
          break;
      }
    } catch (exception) {
      console.error("Error in clientScripts.js:toggleInterrogation(): ", exception)
    }
}

// function that clears the users' input
function clearInput(useCase) {
    try {
      updateStatusText("none")
      switch (useCase) {
        case "all": {
          resultList.textContent = "";
          searchInput.value = "";
          //mapperInput.value = "";
          //knowledgeBaseInput.value = "";
          searchClearButton.style.display = "none";
          //mapperClearButton.style.display = "none";
          //knowledgeBaseClearButton.style.display = "none";
          break;
        }
        case "search": {
          clearFilterList()
          resultList.textContent = ""
          searchInput.value = ""
          searchClearButton.style.display = "none"
          if(document.getElementById("discoverySearchBar-autocomplete-list")) {
            document.getElementById("discoverySearchBar-autocomplete-list").remove()
          }
          break
        }
        /*case "mapper": {
          resultList.textContent = "";
          mapperInput.value = "";
          mapperClearButton.style.display = "none";
          if(document.getElementById("mapperSearchBar-autocomplete-list")) {
            document.getElementById("mapperSearchBar-autocomplete-list").remove();
          }
          break;
        }*/
        default: {
          console.info(
            "Entering default switch of clientScripts.js:clearInput()."
          );
        }
      }
    } catch (exception) {
      console.error("Error in clientScripts.js:clearInput(): ", exception);
    }
}
  
  // function that updates the DOM
function updateStatusText(type, message = "", link = "", linkText = "") {
try {
    switch (type) {
    case "none": {
        if (statusTextDiv.classList.contains("isa_error")) {
        statusTextDiv.classList.remove("isa_error");
        }
        if (statusTextDiv.classList.contains("isa_success")) {
        statusTextDiv.classList.remove("isa_success");
        }
        if (statusTextDiv.classList.contains("isa_info")) {
        statusTextDiv.classList.remove("isa_info");
        }
        statusTextCloseButton.style.display = "none";
        statusText.textContent = "";
        break;
    }
    case "info": {
        if (statusTextDiv.classList.contains("isa_error")) {
        statusTextDiv.classList.remove("isa_error");
        }
        if (statusTextDiv.classList.contains("isa_success")) {
        statusTextDiv.classList.remove("isa_success");
        }
        if (!statusTextDiv.classList.contains("isa_info")) {
        statusTextDiv.classList.add("isa_info");
        }
        if (link.length > 0) {
        let url = document.createElement("a");
        url.href = link;
        url.target = "_blank";
        url.innerText = linkText;
        statusText.textContent = message;
        statusText.appendChild(url);
        statusTextCloseButton.style.display = "block";
        } else {
        statusTextCloseButton.style.display = "block";
        statusText.textContent = message;
        }
        break;
    }
    case "success": {
        if (statusTextDiv.classList.contains("isa_error")) {
        statusTextDiv.classList.remove("isa_error");
        }
        if (statusTextDiv.classList.contains("isa_info")) {
        statusTextDiv.classList.remove("isa_info");
        }
        if (!statusTextDiv.classList.contains("isa_success")) {
        statusTextDiv.classList.add("isa_success");
        }
        if (link.length > 0) {
        let url = document.createElement("a");
        url.href = link;
        url.target = "_blank";
        url.innerText = linkText;
        statusText.textContent = message;
        statusText.appendChild(url);
        statusTextCloseButton.style.display = "block";
        } else {
        statusText.textContent = message;
        statusTextCloseButton.style.display = "block";
        }
        break;
    }
    case "error": {
        scrollToTop()
        if (statusTextDiv.classList.contains("isa_success")) {
        statusTextDiv.classList.remove("isa_success");
        }
        if (statusTextDiv.classList.contains("isa_info")) {
        statusTextDiv.classList.remove("isa_info");
        }
        if (!statusTextDiv.classList.contains("isa_error")) {
        statusTextDiv.classList.add("isa_error");
        }
        if (link.length > 0) {
        let url = document.createElement("a");
        url.href = link;
        url.target = "_blank";
        url.innerText = linkText;
        statusText.textContent = message;
        statusText.appendChild(url);
        statusTextCloseButton.style.display = "block";
        } else {
        statusText.textContent = message;
        statusTextCloseButton.style.display = "block";
        }
        break;
    }
    default: {
        console.info(
        "Entering default switch of clientScripts.js:updateStatusText()."
        );
    }
    }
} catch (exception) {
    console.error("Error in clientScripts.js:updateStatusText(): ", exception);
}
}
  
  // function that updates the catalogueList DOM for a given catalogue
function updateCatalogueListDOM(catalogue, fetchResponse, catalogueListTable) {
try {
    let currentRow = catalogueListTable.insertRow();
    currentRow.style.height = '70px'

    // insert catalogue check box into table
    /*let checkBox = document.createElement("INPUT");
    checkBox.setAttribute("type", "checkbox");
    checkBox.style.scale = "1.5";
    checkBox.setAttribute("id", catalogue.catalogueName + "_checkBox");
    if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
    checkBox.setAttribute("checked", "true");
    currentCell.style.textAlign = "center";
    currentCell.style.borderRight = "0";
    currentCell.appendChild(checkBox);
    } else {
    checkBox.setAttribute("disabled", "true");
    currentCell.style.textAlign = "center";
    currentCell.style.borderRight = "0";
    currentCell.appendChild(checkBox);
    }*/

    // insert catalogue name/logo into table
    let resourceLogo = document.createElement("img");
    let currentCell = currentRow.insertCell();
    switch(catalogue.catalogueName) {
    case "BBMRI-Eric":
        resourceLogo.setAttribute("src", "../discovery/static/media/bbmri.png")
        break
    case "Orphanet":
        resourceLogo.setAttribute("src", "../discovery/static/media/orphanet.png")
        break
    case "Leicester-ERN-Network":
        resourceLogo.setAttribute("src", "../discovery/static/media/ern_logo.jpg")
        resourceLogo.setAttribute("id", "ernLogo")
        resourceLogo.style.opacity = '.5'
        if(!currentUser.loggedIn) {
          currentCell.setAttribute("title", "You need to be logged in to query this source.")
          let lockSymbol = document.createElement("img")
          lockSymbol.setAttribute("src", "../discovery/static/media/locked_grey.png")
          lockSymbol.setAttribute("id", "lockSymbol")
          lockSymbol.style.verticalAlign = "middle"
          lockSymbol.style.height = "45px"
          lockSymbol.style.float = 'right'
          currentCell.appendChild(lockSymbol);
        }
        break
    case "Cellosaurus":
        resourceLogo.setAttribute("src", "../discovery/static/media/cellosaurus_logo.png")
        break
    case "Wikipathways":
        resourceLogo.setAttribute("src", "../discovery/static/media/wikipathways_logo.png")
        break
    case "hpscReg":
        resourceLogo.setAttribute("src", "../discovery/static/media/hpscreg_logo.png")
        break
    default:
        console.info("Entering default switch of clientScripts.js:updateCatalogueListDOM().")
    }
    resourceLogo.style.verticalAlign = "middle"
    resourceLogo.style.width = "120px";
    resourceLogo.style.marginLeft = '15px'
    currentCell.appendChild(resourceLogo);

    /*let catalogueName = document.createElement("SPAN");
    catalogueName.textContent = catalogue.catalogueName;
    currentCell.appendChild(catalogueName);*/

    // insert connected indicator into table
    /*if (fetchResponse.status >= 200 && fetchResponse.status < 400) {
    let connectedIcon = document.createElement("IMG");
    connectedIcon.setAttribute("src", "./static/media/connected.png");
    connectedIcon.setAttribute("alt", "connected-icon");
    currentCell = currentRow.insertCell();
    currentCell.style.textAlign = "center";
    currentCell.style.borderLeft = "0";
    currentCell.appendChild(connectedIcon);
    } else {
    let disconnectedIcon = document.createElement("IMG");
    disconnectedIcon.setAttribute("src", "./static/media/disconnected.png");
    disconnectedIcon.setAttribute("alt", "disconnected-icon");
    currentCell = currentRow.insertCell();
    currentCell.style.textAlign = "center";
    currentCell.style.borderLeft = "0";
    currentCell.appendChild(disconnectedIcon);
    }*/
} catch (exception) {
    console.error(
    "Error in clientScripts.js:updateCatalogueListDOM(): ",
    exception
    );
}
}

// function that clears all pre existing results
function clearPreviousSearch() {
    try {
      resultList.textContent = ""
      //resultsByResource.IndividualDataset = []
      //resultsByResource.BiobankDataset = []
      //resultsByResource.PatientRegistryDataset = []
    } catch (exception) {
      console.error("Error in clientScripts.js:clearPreviousSearch(): ", exception)
    }
}

// function that toggles the top button visibility
function toggleTopButton() {
    try {
      if (
        document.body.scrollTop > 200 ||
        document.documentElement.scrollTop > 200
      ) {
        topButton.style.display = "block"
      } else {
        topButton.style.display = "none"
      }
    } catch (exception) {
      console.error("Error in clientScripts.js:toggleTopButton(): ", exception)
    }
  }
  
// function that toggles the search filter dom elements
function toggleAdvancedSearchTab() {
try {
    //advancedSearchButton.classList.toggle("openedCollapsible");
    let content = document.getElementById("advancedSearchTab");
    if (content.style.maxHeight) {
    content.style.maxHeight = null;
    content.style.width = 0;
    content.style.marginLeft = "100%";
    document.getElementById("advancedSearchArrow").setAttribute("src", "./static/media/downArrow_small_white.png")
    } else {
    content.style.maxHeight = content.scrollHeight + "px";
    content.style.width = "100%"
    content.style.marginLeft = 0
    document.getElementById("advancedSearchArrow").setAttribute("src", "./static/media/upArrow_small_white.png")
    }
} catch (exception) {
    console.error(
    "Error in clientScripts.js:toggleAdvancedSearchTab(): ",
    exception
    );
}
}

// function that toggles the search dom elements
function toggleListedSources(button) {
try {
    button.classList.toggle("openedCollapsible");
    let content = document.getElementById("listedSourcesContent");
    if (content.style.maxHeight) {
    content.style.maxHeight = null;
    content.style.width = 0;
    content.style.marginLeft = "100%";
    } else {
    content.style.maxHeight = content.scrollHeight + "px";
    content.style.width = "250px"
    content.style.marginLeft = 0
    }
} catch (exception) {
    console.error("Error in clientScripts.js:toggleListedSources(): ", exception);
}
}

// function that toggles the search dom elements
function toggleLoginModal(show) {
try {
    if(show) {
    document.getElementById('loginModal').style.display='block'
    }
    else {
    document.getElementById('loginModal').style.display='none'
    }
} catch (exception) {
    console.error("Error in clientScripts.js:toggleLogin(): ", exception);
}
}

// function that toggles the clear button visibility
function toggleSearchClearButton(event) {
try {
    if(event.target.value.length > 0) {
    searchClearButton.style.display = "inline-block"
    }
    else {
    searchClearButton.style.display = "none"
    }
} catch (exception) {
    console.error("Error in clientScripts.js:toggleSearchClearButton(): ", exception)
}
}

  // function that toggles the clear button visibility
/*function toggleMapperClearButton(event) {
  try {
    if(event.target.value.length > 0) {
      mapperClearButton.style.display = "inline-block"
    }
    else {
      mapperClearButton.style.display = "none"
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:toggleMapperClearButton(): ", exception)
  }
}*/

// function that toggles the catalogue result dom elements
function toggleSourceResults(source) {
    try {
      source.classList.toggle("openedResultCollapsible");
      let content = document.getElementById(source.name + "Content");
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    } catch (exception) {
      console.error(
        "Error in clientScripts.js:toggleSourceResults(): ",
        exception
      );
    }
}

// function that toggles the listed sources loading spinner
/*function toggleCatalogueListLoadingSpinner(isLoading) {
  try {
    if (isLoading) {
      listedSourcesCollapsible.classList.add("spin");
    } else {
      listedSourcesCollapsible.classList.remove("spin");
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:toggleLoadingSpinner(): ", exception)
  }
}*/

// function that creates the result list table header DOM element
function createResultListTableHeader(resultList) {
  try {
    let resultHeadline = document.createElement("div");
    resultHeadline.innerText = "Results";
    resultHeadline.style.width = "97.1%";
    resultHeadline.style.backgroundColor = "#333";
    resultHeadline.style.padding = "9px 0px 9px 32px";
    resultHeadline.style.color = "white";
    resultHeadline.style.fontSize = "26px";
    resultHeadline.style.borderBottom = "2px solid white";
    resultList.appendChild(resultHeadline);
  } catch (exception) {
    console.error("Error in clientScripts.js:createResultListTableHeader(): ", exception)
  }
}

// function that creates a table displaying the results
/*function createMapperResultListTable(resultTable) {
  try {
    resultTable.classList.add("table");

    let headRow = resultTable.insertRow();
    let headerCell = document.createElement("TH");
    let resourceName = document.createElement("SPAN");
    resourceName.textContent = "Rare Disease Name";
    headerCell.appendChild(resourceName);
    headerCell.style.width = "60%";
    headerCell.style.cursor = "pointer";
    headerCell.setAttribute("onclick", `sortTable(this.closest("table"), 0)`);
    headRow.appendChild(headerCell);

    let code = document.createElement("SPAN");
    code.textContent = "Code";
    headerCell = document.createElement("TH");
    headerCell.appendChild(code);
    headRow.appendChild(headerCell);

    let codeType = document.createElement("SPAN");
    codeType.textContent = "Code Type";
    headerCell = document.createElement("TH");
    headerCell.appendChild(codeType);
    headerCell.style.cursor = "pointer";
    headerCell.setAttribute("onclick", `sortTable(this.closest("table"), 0)`)
    headRow.appendChild(headerCell);
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:createMapperResultListTable(): ",
      exception
    );
  }
}*/

// function that updates the resultList DOM for given mapper results
/*function updateMapperResultListDOM(resultTable, results, type) {
  try {
    switch(type) {
      case "orpha":
        for(let entry of results) {
          let currentRow = resultTable.insertRow();
          currentRow.addEventListener("click", () => {
            useCodeForSearch(extractRDCode(entry, "orpha"));
          });
          currentRow.classList.add("resultListRow");

          let content = orphaClassification.find(x => x.code == extractRDCode(entry, "orpha"))

          if(content) {
            // insert resource name into table
            let name = document.createElement("SPAN");
            name.textContent = content.name;
            name.style.fontSize = "14px";
            let currentCell = currentRow.insertCell();
            currentCell.appendChild(name);

            // insert orphacodee into table
            let code = document.createElement("SPAN");
            code.textContent = content.code;
            code.style.fontSize = "14px";
            currentCell = currentRow.insertCell();
            currentCell.appendChild(code);

            // insert orphacodee into table
            let type = document.createElement("SPAN");
            type.textContent = "Orphanet";
            type.style.fontSize = "14px";
            currentCell = currentRow.insertCell();
            currentCell.appendChild(type);

            resultTable.appendChild(currentRow);
          }
          else {
            console.error("No classification entry was found for code " + extractRDCode(entry, "orpha"));
            continue;
          } 
        }
        break;
    case "other":
        for(let entry of results) {
          let currentRow = resultTable.insertRow();
          currentRow.classList.add("resultListRow");
          currentRow.style.cursor = "default";
    
          // insert resource name into table
          let name = document.createElement("SPAN");
          name.textContent = entry;
          name.style.fontSize = "14px";
          let currentCell = currentRow.insertCell();
          currentCell.appendChild(name);
    
          // insert orphacodee into table
          let code = document.createElement("SPAN");
          code.textContent = "";
          code.style.fontSize = "14px";
          currentCell = currentRow.insertCell();
          currentCell.appendChild(code);
    
          // insert orphacodee into table
          let type = document.createElement("SPAN");
          type.textContent = "";
          type.style.fontSize = "14px";
          currentCell = currentRow.insertCell();
          currentCell.appendChild(type);
    
          resultTable.appendChild(currentRow);
        }
        break;
      }
  } catch (exception) {
    console.error(
      "Error in clientScripts.js:updateMapperResultListDOM(): ",
      exception
    );
  }
}*/
  
// function that creates a table displaying the results
function createResultListTable(resultTable) {
  try {
    let headRow = resultTable.insertRow();
    let headerCell = document.createElement("TH");
    let resourceName = document.createElement("SPAN");
    resourceName.textContent = "Resource Name";
    headerCell.appendChild(resourceName);
    headerCell.style.width = "30%";
    headerCell.style.cursor = "pointer";
    headerCell.setAttribute("onclick", `sortTable(this.closest("table"), 0)`);
    headRow.appendChild(headerCell);

    let resourceDescription = document.createElement("SPAN");
    resourceDescription.textContent = "Description";
    headerCell = document.createElement("TH");
    headerCell.appendChild(resourceDescription);
    headRow.appendChild(headerCell);

    let country = document.createElement("SPAN");
    country.textContent = "Country";
    headerCell = document.createElement("TH");
    headerCell.appendChild(country);
    headerCell.style.width = "12%";
    headerCell.style.cursor = "pointer";
    headerCell.setAttribute("onclick", `sortTable(this.closest("table"), 2)`);
    headRow.appendChild(headerCell);
  } catch (exception) {
    console.error(
    "Error in clientScripts.js:createResultListTable(): ",
    exception
    );
  } 
}

// function that updates the resultList DOM for a given catalogue result
function updateResultListDOM(resultTable, content, sourceName) {
  try {
    if(sourceName === 'ERKNet' || sourceName === 'UIMD' || sourceName === 'EREC') {
      let currentRow = resultTable.insertRow()
      currentRow.addEventListener("click", () => {
        window.open(content.Info.contactURL, "_blank")
      })
      currentRow.classList.add("resultListRow")
      currentRow.setAttribute("title", "Click to be redirected to the origin of this resource.")

      let currentCell = currentRow.insertCell()
      let resourceName = document.createElement("p")
      resourceName.style.fontSize = "14px"
      resourceName.textContent = content.id
      currentCell.appendChild(resourceName)

      currentCell = currentRow.insertCell()
      // insert resource result count into table
      if(currentUser.loggedIn) {
        let resourceCount = document.createElement("SPAN")
        resourceCount.style.fontSize = "14px"
        resourceCount.style.float = "right"
        resourceCount.textContent = "Result Count: " + content.resultCount
        resourceCount.style.marginRight = "30px"
        currentCell.appendChild(resourceCount)

        resultTable.appendChild(currentRow)
      }
    }
    else if(content['resourceResponses'] && content.resourceResponses.length > 0) {
      for (let entry of content.resourceResponses) {
        let currentRow = resultTable.insertRow()
        if (entry['homepage']) {
          currentRow.addEventListener("click", () => {
            window.open(entry.homepage, "_blank")
        })
          currentRow.classList.add("resultListRow")
          currentRow.setAttribute("title", "Click to be redirected to the origin of this resource.")
        }
        else if (!entry['homepage'] && entry['id']) {
          currentRow.addEventListener("click", () => {
            window.open(entry.id, "_blank")
          })
          currentRow.classList.add("resultListRow")
          currentRow.setAttribute("title", "Click to be redirected to the origin of this resource.")
        }
        let currentCell = currentRow.insertCell()

        // insert resource name into table  
        let resourceName = document.createElement("p")
        resourceName.style.fontSize = "14px"
        if(entry.name['value']) {
          resourceName.textContent = entry.name.value
        }
        else {
          resourceName.textContent = entry.name
        }
        currentCell.appendChild(resourceName)

        // insert resource description into table
        let resourceDescription = document.createElement("SPAN")
        resourceDescription.style.fontSize = "14px"
        if(entry.description['value']) {
          resourceDescription.textContent = entry.description.value
        }
        else {
          resourceDescription.textContent = entry.description
        }
        currentCell = currentRow.insertCell()
        currentCell.appendChild(resourceDescription)
        
        // insert resource location into table
        let resourceCountry = document.createElement("SPAN");
        resourceCountry.style.fontSize = "14px";
        /*if (entry["publisher"]) {
        resourceCountry.textContent = entry.publisher.location.country.toLowerCase().charAt(0).toUpperCase() 
            + entry.publisher.location.country.slice(1);
        }
        else {
        resourceCountry.textContent = entry.location.country.toLowerCase().charAt(0).toUpperCase() 
            + entry.location.country.slice(1).toLowerCase();
        }*/

        if(entry['location']) {
        resourceCountry.textContent = entry.location.country    
        }
        else if (entry['publisher'] && entry.publisher['location']) {
        resourceCountry.textContent = entry.publisher.location.id
        }
        else {
        resourceCountry.textContent = '-'   
        }
        currentCell = currentRow.insertCell()
        currentCell.appendChild(resourceCountry)

        resultTable.appendChild(currentRow)
      }
    }
    else if(content['resourceResponses'] && !Array.isArray(content.resourceResponses)) {
      let currentRow = resultTable.insertRow()
      if(content.resourceResponses['homepage']) {
          currentRow.addEventListener("click", () => {
          window.open(content.resourceResponses.homepage, "_blank")
          })
          currentRow.classList.add("resultListRow")
          currentRow.setAttribute("title", "Click to be redirected to the origin of this resource.")
      }
      let currentCell = currentRow.insertCell()

      // insert resource name into table  
      let resourceName = document.createElement("p")
      resourceName.style.fontSize = "14px"
      if(content.resourceResponses.name['value']) {
          resourceName.textContent = entry.name.value
      }
      else {
        resourceName.textContent = content.resourceResponses.name
      }
      currentCell.appendChild(resourceName)

      // insert resource description into table
      let resourceDescription = document.createElement("SPAN")
      resourceDescription.style.fontSize = "14px"
      if(content.resourceResponses.description['value']) {
          resourceDescription.textContent = content.resourceResponses.description.value
      }
      else {
          resourceDescription.textContent = content.resourceResponses.description
      }
      currentCell = currentRow.insertCell()
      currentCell.appendChild(resourceDescription)
    
      // insert resource location into table
      let resourceCountry = document.createElement("SPAN");
      resourceCountry.style.fontSize = "14px";
      /*if (entry["publisher"]) {
          resourceCountry.textContent = entry.publisher.location.country.toLowerCase().charAt(0).toUpperCase() 
          + entry.publisher.location.country.slice(1);
      }
      else {
          resourceCountry.textContent = entry.location.country.toLowerCase().charAt(0).toUpperCase() 
          + entry.location.country.slice(1).toLowerCase();
      }*/

      if(content.resourceResponses['location']) {
          resourceCountry.textContent = content.resourceResponses.location.country    
      }
      else if (content.resourceResponses['publisher'] && content.resourceResponses.publisher['location']) {
          resourceCountry.textContent = content.resourceResponses.publisher.location.id
      }
      else {
          resourceCountry.textContent = '-'   
      }
      currentCell = currentRow.insertCell()
      currentCell.style.textAlign = 'center'
      currentCell.appendChild(resourceCountry)

      resultTable.appendChild(currentRow)
    }
    else {
      for (let entry of content) {
        let currentRow = resultTable.insertRow()
        /*currentRow.addEventListener("click", () => {
        window.open(entry.homepage, "_blank");
        });
        currentRow.classList.add("resultListRow");
        currentRow.setAttribute("title", "Click to be redirected to the origin of this resource.")*/

        let currentCell = currentRow.insertCell();

        // insert resource name into table  
        let resourceName = document.createElement("p")
        resourceName.style.fontSize = "14px"
        resourceName.textContent = entry.id.toUpperCase()

        currentCell.appendChild(resourceName)

        // insert resource description into table
        let resourceDescription = document.createElement("SPAN")
        resourceDescription.style.fontSize = "14px"
        resourceDescription.textContent = entry.id.toUpperCase()

        currentCell = currentRow.insertCell()
        currentCell.appendChild(resourceDescription)

        // insert resource result count into table
        if(currentUser.loggedIn && entry['resultCount']) {
        let resourceCount = document.createElement("SPAN")
        resourceCount.style.fontSize = "14px"
        resourceCount.style.float = "right"
        resourceCount.textContent = "Result Count: " + entry.resultCount
        resourceCount.style.marginRight = "30px"
        currentCell.appendChild(resourceCount)
        }
    
        // insert resource location into table
        let resourceCountry = document.createElement("SPAN")
        resourceCountry.style.fontSize = "14px"
        /*if (entry["publisher"]) {
        resourceCountry.textContent = entry.publisher.location.country.toLowerCase().charAt(0).toUpperCase() 
            + entry.publisher.location.country.slice(1);
        }
        else {
        resourceCountry.textContent = entry.location.country.toLowerCase().charAt(0).toUpperCase() 
            + entry.location.country.slice(1).toLowerCase();
        }*/

        if(entry['location']) {
          resourceCountry.textContent = entry.location.country    
        }
        else {
          resourceCountry.textContent = '-'   
        }
        currentCell = currentRow.insertCell();
        currentCell.appendChild(resourceCountry);

        resultTable.appendChild(currentRow);
      }
    }
  } catch (exception) {
      console.error("Error in clientScripts.js:updateResultListDOM(): ", exception)
  }
}

// function that acts whenever a country is selected
function selectCountry(dropdownList) {
try {
  updateStatusText("none")
  let selectedCountry = dropdownList.value
  if(!selectedCountries.includes(selectedCountry)) {
    selectedCountries.push(selectedCountry)
    // create and append country list item
    let entry = document.createElement('li')
    entry.appendChild(document.createTextNode(selectedCountry))
    entry.setAttribute("id", `${selectedCountry}ListItem`)
    entry.style.backgroundColor = "#fecf00"
    entry.style.paddingBottom = "3px"
    entry.style.paddingLeft = "10px"
    let removeIcon = document.createElement("IMG")
    removeIcon.setAttribute("src", "../discovery/static/media/close-icon.png")
    removeIcon.setAttribute("alt", "remove-icon")
    removeIcon.setAttribute("onclick", 'removeCountryFromList("'+selectedCountry+'");')
    removeIcon.style.marginTop = "-2px"
    removeIcon.style.marginLeft = "8px"
    removeIcon.style.float = "right"
    removeIcon.style.cursor = "pointer"
    entry.appendChild(removeIcon)
    filterList.appendChild(entry)
    if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
      document.getElementById("filterListText").textContent = ""
      if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
      }
      else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
      }
    }
    allCountriesCheckbox.checked = false
    allCountriesCheckbox.disabled = false
  }
  else {
   updateStatusText("error", "This country is already included in the country list.")
  }
  dropdownList.options[0].selected = true
} catch (exception) {
    console.error("Error in clientScripts.js:selectCountry(): ", exception)
}
}

// function that removes a country from the country list
function removeCountryFromList(country) {
try {
    const index = selectedCountries.indexOf(country)
    if (index > -1) {
    selectedCountries.splice(index, 1)
    document.getElementById(`${country}ListItem`).remove()
    if(selectedCountries.length == 0) {
        allCountriesCheckbox.checked = true
        allCountriesCheckbox.disabled = true
    }
    if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
        document.getElementById("filterListText").textContent = ""
        if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
        }
        else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
        }
    }
    }
    else {
    updateStatusText("error", "The country you want to remove is not yet in the selected country list.")
    }
} catch (exception) {
    console.error("Error in clientScripts.js:removeCountryFromList(): ", exception)
}
}

// function that empties the country list
function clearCountryList(checked) {
try {
    if(checked) {
      for(let country of selectedCountries) {
        document.getElementById(`${country}ListItem`).remove()
      }
      if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
      }
      else {
        document.getElementById("filterListText").textContent = ""
        if(document.getElementById("filterList").childElementCount <= 7) {
          document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
          document.getElementById("advancedSearchButton").style.height = "94px"
          document.getElementById("advancedSearchArrow").style.top = "30px"
          document.getElementById("searchButton").style.height = "92px"
        }
        else if (document.getElementById("filterList").childElementCount > 7) {
          document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
        }
      }
      selectedCountries = []
      allCountriesCheckbox.disabled = true
    }
} catch (exception) {
    console.error("Error in clientScripts.js:clearCountryList(): ", exception
    )
}
}

// function that acts whenever a type is selected
function selectType(dropdownList) {
  try {
    updateStatusText("none")
    let selectedType = dropdownList.value
    if(!selectedTypes.includes(selectedType)) {
      selectedTypes.push(selectedType)
      // creat and append country list item
      let entry = document.createElement('li')
      entry.appendChild(document.createTextNode(selectedType))
      entry.setAttribute("id", `${selectedType}ListItem`)
      entry.style.backgroundColor = "#3bb392"
      entry.style.paddingBottom = "3px"
      entry.style.paddingLeft = "10px"
      let removeIcon = document.createElement("IMG")
      removeIcon.setAttribute("src", "../discovery/static/media/close-icon.png")
      removeIcon.setAttribute("alt", "remove-icon")
      removeIcon.setAttribute("onclick", 'removeTypeFromList("'+selectedType+'");')
      removeIcon.style.marginTop = "-2px"
      removeIcon.style.marginLeft = "8px"
      removeIcon.style.float = "right"
      removeIcon.style.cursor = "pointer"
      entry.appendChild(removeIcon)
      filterList.appendChild(entry)
      if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
      }
      else {
        document.getElementById("filterListText").textContent = ""
        if(document.getElementById("filterList").childElementCount <= 7) {
          document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
          document.getElementById("advancedSearchButton").style.height = "94px"
          document.getElementById("advancedSearchArrow").style.top = "30px"
          document.getElementById("searchButton").style.height = "92px"
        }
        else if (document.getElementById("filterList").childElementCount > 7) {
          document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
        }
      }
      allTypesCheckbox.checked = false
      allTypesCheckbox.disabled = false
    }
    else {
      updateStatusText("error", "This type is already included in the types list.")
    }
    dropdownList.options[0].selected = true
  } catch (exception) {
    console.error("Error in clientScripts.js:selectType(): ", exception)
  }
}

// function that removes a type from the selected types list
function removeTypeFromList(type) {
try {
    const index = selectedTypes.indexOf(type)
    if (index > -1) {
    selectedTypes.splice(index, 1)
    document.getElementById(`${type}ListItem`).remove()
    if (selectedTypes.length == 0) {
        allTypesCheckbox.checked = true
        allTypesCheckbox.disabled = true
    }
    if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
        document.getElementById("filterListText").textContent = ""
        if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
        }
        else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
        }
    }
    }
    else {
    updateStatusText("error", "The type you want to remove is not yet in the selected types list.")
    }
} catch (exception) {
    console.error("Error in clientScripts.js:removeTypeFromList(): ", exception)
}
}

// function that empties the type list
function clearTypeList(checked) {
try {
    if(checked) {
    for(let type of selectedTypes) {
        document.getElementById(`${type}ListItem`).remove()
    }
    if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
        document.getElementById("filterListText").textContent = ""
        if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
        }
        else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
        }
    }
    selectedTypes = []
    allTypesCheckbox.disabled = true
    }
} catch (exception) {
    console.error("Error in clientScripts.js:clearCountryList(): ", exception)
}
}

// function that acts whenever a type is selected
function selectGender(clickedCheckbox) {
  try {
    updateStatusText("none")
    let selectedGender = ''
    if(clickedCheckbox.name == 'male' && !clickedCheckbox.checked && document.getElementById('femaleCheckbox').checked) {
      selectedGender = 'Female'
    }
    else if(clickedCheckbox.name == 'female' && !clickedCheckbox.checked && document.getElementById('maleCheckbox').checked) {
      selectedGender = 'Male'
    }
    else if((document.getElementById('femaleCheckbox').checked && document.getElementById('maleCheckbox').checked)) {
      clearGenderList()
      return
    }
    else if(!document.getElementById('femaleCheckbox').checked && !document.getElementById('maleCheckbox').checked) {
      clearGenderList()
      document.getElementById('femaleCheckbox').checked = true
      document.getElementById('maleCheckbox').checked = true
      return
    }
    // create and append gender list item
    let entry = document.createElement('li')
    entry.appendChild(document.createTextNode(selectedGender))
    entry.setAttribute("id", `${selectedGender}ListItem`)
    entry.style.backgroundColor = '#ff8383'
    entry.style.paddingBottom = "3px"
    entry.style.paddingLeft = "10px"
    let removeIcon = document.createElement("IMG")
    removeIcon.setAttribute("src", "../discovery/static/media/close-icon.png")
    removeIcon.setAttribute("alt", "remove-icon")
    removeIcon.setAttribute("onclick", 'removeGenderFromList("'+selectedGender+'");')
    removeIcon.style.marginTop = "-2px"
    removeIcon.style.marginLeft = "8px"
    removeIcon.style.float = "right"
    removeIcon.style.cursor = "pointer"
    entry.appendChild(removeIcon)
    
    filterList.appendChild(entry)

    if(document.getElementById("filterList").childElementCount == 1) {
      document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
      document.getElementById("filterListText").textContent = ""
      if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
      }
      else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
      }
    }
  } catch (exception) {
    console.error("Error in clientScripts.js:selectGender(): ", exception)
  }
}

// function that removes a type from the selected types list
function removeGenderFromList(gender) {
  try {
    document.getElementById(`${gender}ListItem`).remove()

    if(gender == 'Female') {
      document.getElementById('maleCheckbox').checked = true
    }
    if(gender == 'Male') {
      document.getElementById('femaleCheckbox').checked = true
    }

    if(document.getElementById("filterList").childElementCount == 1) {
        document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
      document.getElementById("filterListText").textContent = ""
      if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
      }
      else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
      }
    }
  } catch (exception) {
      console.error("Error in clientScripts.js:removeGenderFromList(): ", exception)
  }
}

// function that empties the type list
function clearGenderList() {
  try {
    if(document.getElementById('FemaleListItem')) {
      document.getElementById('FemaleListItem').remove()
      document.getElementById('maleCheckbox').checked = true
      document.getElementById('femaleCheckbox').checked = true
    }
    if(document.getElementById('MaleListItem')) {
      document.getElementById('MaleListItem').remove()
      document.getElementById('maleCheckbox').checked = true
      document.getElementById('femaleCheckbox').checked = true
    }

    if(document.getElementById("filterList").childElementCount == 1) {
      document.getElementById("filterListText").textContent = "No filters applied"
    }
    else {
      document.getElementById("filterListText").textContent = ""
      if(document.getElementById("filterList").childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
      }
      else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
      }
    }
  } catch (exception) {
      console.error("Error in clientScripts.js:clearGenderList(): ", exception)
  }
}

// function that clears the search filter list
function clearFilterList() {
  try {
    clearGenderList()
    clearTypeList(true)
    clearCountryList(true)

    if(filterList.childElementCount == 1) {
      filterListText.textContent = "No filters applied"
    }
    else {
      filterListText.textContent = ""
      if(filterList.childElementCount <= 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "40px"
        document.getElementById("advancedSearchButton").style.height = "94px"
        document.getElementById("advancedSearchArrow").style.top = "30px"
        document.getElementById("searchButton").style.height = "92px"
      }
      else if (document.getElementById("filterList").childElementCount > 7) {
        document.getElementById("discoverySearchBar").style.paddingBottom = "75px"
      }
    }
  } catch (exception) {
      console.error("Error in clientScripts.js:clearFilterList(): ", exception)
  }
}

// function that is called when submitting a login request
/*function submitLogin() {
    try {
        if (event.keyCode == 13) {
            document.getElementById("loginSubmitButton").click()
        }
    } catch (exception) {
        console.error("Error in updateDom.js:submitLogin(): ", exception)
    }
}*/

// function that hides the disclaimer text div
function closeDisclaimerText() {
  document.getElementById("disclaimerDiv").style.display = "none"
}

export { toggleLoadingSpinner, toggleInterrogation, clearInput, updateStatusText, 
    updateCatalogueListDOM, clearPreviousSearch, toggleSearchClearButton, toggleSourceResults, 
    createResultListTableHeader, createResultListTable, updateResultListDOM, selectedCountries, selectedTypes }

window.closeDisclaimerText = closeDisclaimerText
window.toggleLoginModal = toggleLoginModal
window.toggleAdvancedSearchTab = toggleAdvancedSearchTab
window.toggleListedSources = toggleListedSources
window.selectCountry = selectCountry
window.selectType = selectType
window.selectGender = selectGender
window.removeCountryFromList = removeCountryFromList
window.removeGenderFromList = removeGenderFromList
window.removeTypeFromList = removeTypeFromList
window.clearCountryList = clearCountryList
window.clearTypeList = clearTypeList
window.toggleSourceResults = toggleSourceResults
window.toggleTopButton = toggleTopButton
window.updateStatusText = updateStatusText
//window.submitLogin = submitLogin
window.clearInput = clearInput