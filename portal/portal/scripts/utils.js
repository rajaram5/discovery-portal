/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

"use strict"

// function that handles fetch errors
function handleFetchErrors(fetchResponse) {
    try {
      if (!fetchResponse.ok) {
        console.error("Fetch Error: " + fetchResponse.status + " " + fetchResponse.statusText)
      }
      return fetchResponse
    } catch (exception) {
      console.error("Error in utils.js:handleFetchErrors(): ", exception)
    }
  }

// function that sorts a table by a given column
function sortTable(tableToSort, columnNr) {
  try {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = tableToSort;
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[columnNr];
        y = rows[i + 1].getElementsByTagName("TD")[columnNr];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  } catch (exception) {
    console.error("Error in utils.js:sortTable(): ", exception);
  }
}

// function that extract a rd code from a given string
function extractRDCode(string) {
  try {
    let number = string.substr(string.lastIndexOf(":") + 1, (string.lastIndexOf("]") - string.lastIndexOf(":")) - 1)
    if (number == null || number == '') {
      return null;
    }
    return number;
  } catch (exception) {
    console.error("Error in utils.js:extractRDCode(): ", exception);
  }
}

// function that scrolls to view to the top of the page
function scrollToTop() {
  try {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  } catch (exception) {
    console.error("Error in utils.js:scrollToTop(): ", exception);
  }
}

// function that checks wheather its input is a number
function isNumber(number) {
  try {
    return !isNaN(parseFloat(number)) && !isNaN(number - 0);
  } catch (exception) {
    console.error("Error in utils.js:isNumber(): ", exception);
  }
}

function isIcd(string) {
  try {
    return string.match(/^[A-TV-Z]\d{2}(\.[A-Z\d]{0,4})?$/)
  } catch (exception) {
    console.error("Error in utils.js:isIcd(): ", exception);
  }
}

// function that checks whether an input string contains a lower case letter
function hasLowerCase(str) {
  return (/[a-z]/.test(str));
}

export { handleFetchErrors, extractRDCode, isNumber, hasLowerCase, scrollToTop, isIcd }

window.scrollToTop = scrollToTop
window.sortTable = sortTable