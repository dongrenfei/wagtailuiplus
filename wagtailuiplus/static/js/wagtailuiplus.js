// Event handler for choice blocks with conditional visibility
function choiceHandler(target) {
  const choiceHandler = target.closest('.wagtailuiplus__choice-handler');
  if (choiceHandler !== null) {
    const choiceHandlerValue = choiceHandler.querySelector('select').value;

    let searchContainer;
    // If the chocie handler is a char field, search in the entire tab
    if (choiceHandler.classList.contains('typed_choice_field')) {
      searchContainer = choiceHandler.closest('section');
    // Otherwise, if the choice handler is a choices block, search in the entire struct block
    } else {
       searchContainer = choiceHandler.closest('ul.fields');
    }

    const choiceHandlerIdRegex = /wagtailuiplus__choice-handler--([a-zA-Z\-\_]+)/;
    const choiceHandlerId = choiceHandlerIdRegex.exec(choiceHandler.className)[1];
    const choiceHandlerTargets = searchContainer.querySelectorAll('.wagtailuiplus__choice-handler-target--' + choiceHandlerId);
    const hiddenIfRegex = /wagtailuiplus__choice-handler-hidden-if--([a-zA-Z\-\_]+)/g;
    let hiddenIfValue;
    let matches;
    let hiddenIfs;
    let hiddenIfIndex;
    for (let j = 0; j < choiceHandlerTargets.length; j++) {
      matches = hiddenIfRegex.exec(choiceHandlerTargets[j].className);
      while (matches !== null) {
        hiddenIfValue = matches[1];
        choiceHandlerTargetContainer = choiceHandlerTargets[j].closest('li');
        if (choiceHandlerValue === hiddenIfValue) {
          if (choiceHandlerTargetContainer.hasAttribute('data-wagtailuiplus-hidden-ifs')) {
            hiddenIfs = choiceHandlerTargetContainer.getAttribute('data-wagtailuiplus-hidden-ifs').split(',');
            hiddenIfs.push(hiddenIfValue);
            choiceHandlerTargetContainer.setAttribute('data-wagtailuiplus-hidden-ifs', hiddenIfs.join(','));
          } else {
            choiceHandlerTargetContainer.setAttribute('data-wagtailuiplus-hidden-ifs', hiddenIfValue);
          }
          if (!choiceHandlerTargetContainer.classList.contains('wagtailuiplus__choice-handler-target--hidden')) {
            choiceHandlerTargetContainer.classList.add('wagtailuiplus__choice-handler-target--hidden');
          }
        } else if (choiceHandlerTargetContainer.hasAttribute('data-wagtailuiplus-hidden-ifs')) {
          hiddenIfs = choiceHandlerTargetContainer.getAttribute('data-wagtailuiplus-hidden-ifs').split(',');
          hiddenIfIndex = hiddenIfs.indexOf(hiddenIfValue);
          if (hiddenIfIndex > -1) {
            hiddenIfs.splice(hiddenIfIndex, 1);
            if (hiddenIfs.length === 0) {
              choiceHandlerTargetContainer.classList.remove('wagtailuiplus__choice-handler-target--hidden');
              choiceHandlerTargetContainer.removeAttribute('data-wagtailuiplus-hidden-ifs');
            } else {
              choiceHandlerTargetContainer.setAttribute('data-wagtailuiplus-hidden-ifs', hiddenIfs.join(','));
            }
          }
        }
        matches = hiddenIfRegex.exec(choiceHandlerTargets[j].className);
      }
    }
  }
}

// Make the title bar of a struct block show the title of the first char block
function updateStructBlockHeader(event) {
  const field = event.target.closest('li');
  if (event.target.tagName !== 'INPUT' || field === null || field.previousElementSibling !== null) {
    return;
  }
  const headerLabel = field.closest('.sequence-member').querySelector('.sequence-controls > h3 > label');
  if (headerLabel === null) {
    return;
  }
  if (!headerLabel.hasAttribute('data-original-text')) {
    headerLabel.dataset.originalText = headerLabel.innerText;
  }
  headerLabel.innerText = headerLabel.dataset.originalText + ' - ' + event.target.value;
}

// Event handler for checkboxes with interactivity
function checkboxHandler(checkboxHandler) {
  const isChecked = checkboxHandler.checked;
  searchContainer = checkboxHandler.closest('section');
  const checkboxHandlerIdRegex = /wagtailuiplus__checkbox-handler--([a-zA-Z\-\_]+)/;
  const checkboxHandlerId = checkboxHandlerIdRegex.exec(checkboxHandler.closest('.wagtailuiplus__checkbox-handler').className)[1];
  const checkboxHandlerTargets = searchContainer.querySelectorAll('.wagtailuiplus__checkbox-handler-target--' + checkboxHandlerId + '.wagtailuiplus__checkbox-handler-checked-if--checked input[type=checkbox]');
  if (isChecked) {
    for (let i = 0; i < checkboxHandlerTargets.length; i++) {
      if (!checkboxHandlerTargets[i].checked) {
        checkboxHandlerTargets[i].checked = true;
      }
    }
  }
}

// Event handler for checkboxes with interactivity - Reverse dependency
function checkboxHandlerTarget(checkboxHandlerTarget) {
  const isChecked = checkboxHandlerTarget.checked;
  if (isChecked) {
    return;
  }
  searchContainer = checkboxHandlerTarget.closest('section');
  const checkboxHandlerTargetIdRegex = /wagtailuiplus__checkbox-handler-target--([a-zA-Z\-\_]+)/;
  const checkboxHandlerTargetId = checkboxHandlerTargetIdRegex.exec(checkboxHandlerTarget.closest('li').className)[1];
  const checkboxHandler = searchContainer.querySelector('.wagtailuiplus__checkbox-handler--' + checkboxHandlerTargetId + ' input[type=checkbox]');
  checkboxHandler.checked = false;
}

document.addEventListener('DOMContentLoaded', function() {

  // Make the panels collapsable
  let i;
  const panelHeaders = document.querySelectorAll('.object > .title-wrapper');
  for (i = 0; i < panelHeaders.length; i++) {
    panelHeaders[i].addEventListener('click', function() {
      if (this.parentElement.classList.contains('wagtailuiplus__panel--collapsed')) {
        this.parentElement.classList.remove('wagtailuiplus__panel--collapsed');
      } else {
        this.parentElement.classList.add('wagtailuiplus__panel--collapsed');
      }
    });
  }

  let sequenceControls;
  const structBlockContainers = document.querySelectorAll('.sequence-container.sequence-type-stream > .sequence-container-inner > .sequence');
  for (i = 0; i < structBlockContainers.length; i++) {
    // Make the struct block headers collapsable
    structBlockContainers[i].addEventListener('click', function(event) {
      sequenceControls = event.target.closest('.sequence-controls');
      if (sequenceControls === null) {
        return;
      }
      if (this.id !== event.target.closest('.sequence').id) {
        return;
      }

      if (sequenceControls.parentElement.classList.contains('wagtailuiplus__struct-block--collapsed')) {
        sequenceControls.parentElement.classList.remove('wagtailuiplus__struct-block--collapsed');
      } else {
        sequenceControls.parentElement.classList.add('wagtailuiplus__struct-block--collapsed');
      }
    });

    // Make the first field of a struct block update the header text
    structBlockContainers[i].addEventListener('change', function(event) {
      updateStructBlockHeader(event);
    });
    structBlockContainers[i].addEventListener('keyup', function(event) {
      updateStructBlockHeader(event);
    });
  }

  // Set the initial collapsed state of existing struct blocks
  let fields;
  let headerLabel;
  const structBlocks = document.querySelectorAll('.sequence-container.sequence-type-stream > .sequence-container-inner > .sequence > .sequence-member');
  for (i = 0; i < structBlocks.length; i++) {
    // structBlocks[i].classList.add('wagtailuiplus__struct-block--collapsed');
    fields = structBlocks[i].querySelectorAll('.field');
    if (fields.length === 0) {
      continue;
    }
    headerLabel = structBlocks[i].querySelector('.sequence-controls > h3 > label');
    headerLabel.dataset.originalText = headerLabel.innerText;
    if (fields[0].classList.contains('char_field')) {
      structBlocks[i].classList.add('wagtailuiplus__struct-block--collapsed'); // remove this when uncommenting the line above
      headerLabel.innerText = headerLabel.dataset.originalText + ' - ' + fields[0].querySelector('input[type=text]').value;
    } else if (fields[0].classList.contains('model_choice_field')) {
      // uncomment this to enable model choice field based headers, todo: update header on change of model choice
      // headerLabel.innerText = headerLabel.dataset.originalText + ' - ' + fields[0].querySelector('.chosen .title').innerText;
    }
  }

  // Bind the choice block event handler to all stream fields, so it applies to all existing and future choice blocks
  for (i = 0; i < structBlockContainers.length; i++) {
    structBlockContainers[i].addEventListener('change', function(event) {
      choiceHandler(event.target);
    });
  }

  // Trigger the choice block event handler for all existing choice blocks
  const choiceHandlerSelects = document.querySelectorAll('.sequence-container.sequence-type-stream > .sequence-container-inner > .sequence .wagtailuiplus__choice-handler select');
  for (i = 0; i < choiceHandlerSelects.length; i++) {
    choiceHandler(choiceHandlerSelects[i]);
  }

  // Watch for new blocks being added to stream fields
  const config = { attributes: false, childList: true, subtree: false };
  const callback = function(mutations, observer) {
      let k;
      let l;
      let choiceHandlerSelects;
      for (let j = 0; j < mutations.length; j++) {
        for (k = 0; k < mutations[j].addedNodes.length; k++) {
          // Make sure the choice handler is run for each new choice block
          choiceHandlerSelects = mutations[j].addedNodes[k].querySelectorAll('.wagtailuiplus__choice-handler select');
          for (l = 0; l < choiceHandlerSelects.length; l++) {
            choiceHandler(choiceHandlerSelects[l]);
          }
        }
      }
  };
  let observer;
  for (i = 0; i < structBlockContainers.length; i++) {
    observer = new MutationObserver(callback);
    observer.observe(structBlockContainers[i], config);
  }

  // Bind the char field choice event handlers, and trigger it once
  const choiceHandlersCharFieldSelects = document.querySelectorAll('li.wagtailuiplus__choice-handler select');
  for (i = 0; i < choiceHandlersCharFieldSelects.length; i++) {
    choiceHandlersCharFieldSelects[i].addEventListener('change', function(event) {
      choiceHandler(event.target);
    });
    choiceHandler(choiceHandlersCharFieldSelects[i]);
  }

  // Bind the checkbox handler for interactive checkboxes
  const checkboxHandlerInputs = document.querySelectorAll('li.wagtailuiplus__checkbox-handler input[type=checkbox]');
  for (i = 0; i < checkboxHandlerInputs.length; i++) {
    checkboxHandlerInputs[i].addEventListener('change', function(event) {
      checkboxHandler(event.target);
    });
    checkboxHandler(checkboxHandlerInputs[i]);
  }

  // Bind the checkbox handler targets for interactive checkboxes - reverse dependency
  const checkboxHandlerTargetInputs = document.querySelectorAll('li[class^="wagtailuiplus__checkbox-handler-target--"] input[type=checkbox], li[class*=" wagtailuiplus__checkbox-handler-target--"] input[type=checkbox]');
  for (i = 0; i < checkboxHandlerTargetInputs.length; i++) {
    checkboxHandlerTargetInputs[i].addEventListener('change', function(event) {
      checkboxHandlerTarget(event.target);
    });
    checkboxHandlerTarget(checkboxHandlerTargetInputs[i]);
  }
});
