/* 
  This code is licensed under MIT license (see LICENSE file for details).
  (c) 2021 EJP-RD (https://www.ejprarediseases.org/)
  Author/Maintainer: David Reinert (david.reinert@ejprd-project.eu)
*/

document.write('\
<div class="navBar">\
  <div class="tooltip">\
    <button\
      id="textSearchNavButton"\
      type="button"\
      class="button navButton navButtonActive"\
      onclick="toggleTab(`textSearchNavButton`, `textSearchTab`, this)"\
      title="Resource Seach">Resource Search</button>\
    <!-- <span class="tooltiptext">Use this to search connected sources for rare disease resources (biobanks, patients registries) and safely interrogate record-level information.</span>\ -->\
  </div>\
  <div class="dropdown tooltip">\
    <button\
      id="knowledgeBasesNavButton"\
      type="button"\
      class="button navButton inactiveTab dropbtn">Knowledge Base Search</button>\
    <!-- <span class="tooltiptext">Use this to search connected knowledge bases for information on rare diseases.</span>\ -->\
    <div class="dropdown-content">\
      <a href="#" onclick="toggleTab(`knowledgeBasesNavButton`, `knowledgeBasesTab`, this)" title="Cellosaurus Search"><span>Cellosaurus</span></a>\
      <a href="#" style="opacity: 50%; pointer-events: none;" onclick="toggleTab(`knowledgeBasesNavButton`, `knowledgeBasesTab`, this)" \
      title="WikiPathway Search"><span>WikiPathway</span></a>\
      <a href="#" style="opacity: 50%; pointer-events: none;" onclick="toggleTab(`knowledgeBasesNavButton`, `knowledgeBasesTab`, this)" \
      title="hPSCreg Search"><span>hPSCreg</span></a>\
    </div>\
  </div>\
  <div class="dropdown tooltip">\
    <button\
      id="mapperNavButton"\
      type="button"\
      class="button navButton inactiveTab dropbtn">RD Code Mapper</button>\
    <!-- <span class="tooltiptext">Use this to map from one rare disease classification to another. For example from ICD10 to Orphanet.</span>\ -->\
    <div class="dropdown-content">\
      <a href="#" onclick="toggleTab(`mapperNavButton`, `mapperTab`, this)" title="ICD10 to Orphacode Mapper">ICD10 to <span style="color: #44a0fc;">Orphanet</a>\
      <a href="#" style="opacity: 50%; pointer-events: none;" title="Snomed to Orphacode Mapper">Snomed to <span style="color: #44a0fc;">Orphanet</span></a>\
      <a href="#" style="opacity: 50%; pointer-events: none;" title="OMIM to Orphacode Mapper">OMIM to <span style="color: #44a0fc;">Orphanet</span></a>\
      <a href="#" style="opacity: 50%; pointer-events: none;" title="UMLS to Orphacode Mapper">UMLS to <span style="color: #44a0fc;">Orphanet</span></a>\
      <a href="#" onclick="toggleTab(`mapperNavButton`, `mapperTab`, this)" title="Orphacode to Others Mapper">Orphanet to <span style="color: #3bb392;">Others</span></a>\
    </div>\
  </div>\
</div>\
');