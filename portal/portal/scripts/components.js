/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

const statusTextDiv = document.getElementById("statusTextDiv");
const statusText = document.getElementById("statusText");
const statusTextCloseButton = document.getElementById("statusTextCloseButton");
const discoveryNavButton = document.getElementById("discoveryNavButton");
const knowledgeBasesNavButton = document.getElementById("knowledgeBasesNavButton");
const mapperNavButton = document.getElementById("mapperNavButton");
const searchInput = document.getElementById("discoverySearchBar");
const mapperInput = document.getElementById("mapperSearchBar");
const knowledgeBaseInput = document.getElementById("knowledgeBaseSearchBar");
const searchClearButton = document.getElementById("searchClearButton");
const mapperClearButton = document.getElementById("mapperClearButton");
const knowledgeBaseClearButton = document.getElementById("knowledgeBaseClearButton");
const searchButton = document.getElementById("searchButton");
const advancedSearchButton = document.getElementById("advancedSearchButton");
const mapButton = document.getElementById("mapButton");
const knowledgeSearchButton = document.getElementById("knowledgeSearchButton");
const filterList = document.getElementById("filterList");
const filterListText = document.getElementById("filterListText");
const searchFilterCollapsible = document.getElementById(
  "searchFilterCollapsible"
);
const recordInterogationCollapsible = document.getElementById(
  "recordInterogationCollapsible"
);
const listedSourcesCollapsible = document.getElementById(
  "listedSourcesCollapsible"
);
const registriesCheckbox = document.getElementById("PatientRegistryDatasetCheckbox");
const biobanksCheckbox = document.getElementById("BiobankDatasetCheckbox");
const allTypesCheckbox = document.getElementById("allTypesCheckbox")
const allCountriesCheckbox = document.getElementById("allCountriesCheckbox");
const catalogueList = document.getElementById("catalogueList");
const resultList = document.getElementById("resultList");
const topButton = document.getElementById("topButton");
const loginModal = document.getElementById('loginModal');

export { 
    statusTextDiv, statusText, statusTextCloseButton,
    discoveryNavButton, knowledgeBasesNavButton, mapperNavButton,
    searchInput, mapperInput, knowledgeBaseInput, 
    searchClearButton, mapperClearButton, knowledgeBaseClearButton,
    searchButton, advancedSearchButton, mapButton, knowledgeSearchButton, topButton,
    searchFilterCollapsible, recordInterogationCollapsible, listedSourcesCollapsible,
    registriesCheckbox, biobanksCheckbox, allTypesCheckbox, allCountriesCheckbox,
    filterList, filterListText, catalogueList, resultList, loginModal
}