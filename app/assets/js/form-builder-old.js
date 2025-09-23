/* Global Variables */

// Element references
const langBtn = document.getElementById("language");
const formBuilder = document.getElementById("formBuilder");
const form = document.getElementById("form-preview");
const clearFormBtn = document.getElementById("clearFormBtn");
const fieldTypeDDSelector = document.getElementById("FieldTypeDropDown");
const formLeftPanel = document.querySelectorAll(".form-submit");

let fields = [];
let fieldType;

// Field Editing States
let hasEditModeOn = false;
let isEditing = false;
let selectedFieldForm;
let editFieldId;
let editFieldType;
let editFieldData;

const fieldRenderers = {
  text: renderTextInput,
  textArea: renderTextArea,
  dropDown: renderDropDown,
  radio: renderRadioOrCheckbox,
  checkBoxes: renderRadioOrCheckbox,
  consentCheckbox: renderConsentCheckbox,
  submitButton: renderSubmitButton,
  cancelButton: renderCancelButton,
  fileAttachment: renderFileAttachment,
  heading: renderHeading,
  datePicker: renderDateInput,
};

/* Helper Global Functions */
// GUID generator
function generateGUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (char) {
      const rand = (Math.random() * 16) | 0;
      const value = char === "x" ? rand : (rand & 0x3) | 0x8;
      return value.toString(16);
    }
  );
}

function getSiblingValue(input, steps = 1) {
  let el = input;
  while (steps-- && el?.parentElement) {
    el = el.parentElement;
  }
  return isEditing
    ? el?.nextElementSibling || null
    : el?.nextElementSibling?.value || null;
}

function normalizeValue(val) {
  // If it's an element, return its .value
  if (val instanceof HTMLElement) {
    return val.value?.trim() || "";
  }
  // If it's already a string, return as is
  if (typeof val === "string") {
    return val.trim();
  }
  return ""; // fallback for null/undefined
}

const toggleVisibility = (element, show) => {
  element?.classList.toggle("hidden", !show);
};

const toggleVisibilityAll = (element, show) => {
  element?.forEach((el) => el.classList.toggle("hidden", !show));
};

const showFieldBox = (selectedValue) => {
  document
    .querySelectorAll(".field-box")
    .forEach((el) => el.classList.add("hidden"));
  const map = {
    textField: "textField",
    textArea: "textArea",
    dropDown: "dropDown",
    radio: "radio",
    checkBoxes: "checkBoxes",
    datePicker: "datePicker",
    fileAttachment: "fileAttachment",
    heading: "heading",
    cancelButton: "cancelButton",
    consentCheckbox: "consentCheckbox",
    submitButton: "submitButton",
    validationErrorMessages: "validationErrorMessages",
  };
  if (map[selectedValue]) {
    document.getElementById(map[selectedValue]).classList.remove("hidden");
  }
};

fieldTypeDDSelector.addEventListener("change", function () {
  fieldType = this.value;
  showFieldBox(fieldType);
});

document.getElementById("RegexType")?.addEventListener("change", function () {
  const selectedValue = this.value;

  // Hide all regex boxes
  document.querySelectorAll(".regex-box").forEach(function (element) {
    element.classList.add("hidden");
  });

  // Show regexField only when 'Custom Regex' is selected
  if (selectedValue === "custom") {
    document.getElementById("regexField").classList.remove("hidden");
  }
});

document.querySelectorAll(".closeBtnFieldBoxJS").forEach(function (element) {
  element.addEventListener("click", function () {
    const parent = this.closest(".field-box");
    if (parent) {
      parent.classList.add("hidden");
    }
    resetDropDownState();
    addNRemoveClassFromAll(".saveBtn", "hidden", true);
    addNRemoveClassFromAll(".updateBtn", "hidden");
    isEditing = false;
    emptyFields();
    toggleVisibility(formBuilder, !isEditing);
  });
});

const resetDropDownState = () => {
  fieldTypeDDSelector.selectedIndex = 0;
};

function removeRequired(inputs) {
  inputs.forEach((input) => input.removeAttribute("required"));
}

// Add Row Function
document.querySelectorAll(".table-section").forEach((section) => {
  const tbody = section.querySelector(".requestsTable");
  const addBtn = section.querySelector(".addRowBtn");
  const inputKey = section.querySelector(".inputKey");
  const inputEn = section.querySelector(".inputValueEn");
  const inputAr = section.querySelector(".inputValueAr");

  // group inputs in one place
  const inputs = [inputKey, inputEn, inputAr];

  // Add button click
  addBtn.addEventListener("click", function () {
    generateTableRow(inputKey, inputEn, inputAr, tbody);
    removeRequired(inputs);
  });

  // Add on Enter key in any input
  [inputKey, inputEn, inputAr].forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // prevent form submission
        generateTableRow(inputKey, inputEn, inputAr, tbody);
        removeRequired(inputs);
      }
    });
  });

  // Initialize existing rows (if any)
  if (tbody) {
    tbody.querySelectorAll("tr").forEach(attachRowListeners);
  }
});

// Function to add a row (shared for button and Enter key)
function generateTableRow(inputKey, inputEn, inputAr, tbody) {
  const key = normalizeValue(inputKey);
  const valEn = normalizeValue(inputEn);
  const valAr = normalizeValue(inputAr);

  if (!key || !valEn || !valAr) {
    alert("Please fill all fields");
    return;
  }

  const newRow = document.createElement("tr");
  newRow.className = "bg-white border-b";
  newRow.innerHTML = generateTableCells(key, valEn, valAr);
  tbody.appendChild(newRow);
  attachRowListeners(newRow);

  if (!inputKey.value) {
    return;
  }

  inputKey.value = "";
  inputEn.value = "";
  inputAr.value = "";
  inputKey.focus();
}

function generateTableCells(key, valEn, valAr) {
  return `
    <td class="px-4 py-2 font-medium">${key}</td>
    <td class="px-4 py-2 font-medium">${valEn}</td>
    <td class="px-4 py-2 font-medium">${valAr}</td>
    <td class="px-4 py-2 text-center">
      <div class="editBtn cursor-pointer text-blue-500 hover:text-blue-700" title="Edit">
        <span class="material-symbols-outlined text-[18px] text-green">edit</span>
      </div>
      <div class="deleteBtn cursor-pointer text-red hover:text-red-700" title="Delete">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </div>
    </td>
    <td class="px-6 py-4 text-center">
      <a class="text-green hover:text-lightGreen" href="#"><i class="material-symbols-outlined" style="font-size: 24px">visibility</i></a>
    </td>
  `;
}

function attachRowListeners(row) {
  const editBtn = row.querySelector(".editBtn");
  const deleteBtn = row.querySelector(".deleteBtn");

  editBtn?.addEventListener("click", () => {
    if (editBtn.innerText.toLowerCase().includes("edit")) {
      enableInlineEdit(row, editBtn);
    } else {
      saveInlineEdit(row, editBtn);
    }
  });

  deleteBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this row?")) {
      row.remove();
    }
  });
}

function enableInlineEdit(row, editBtn) {
  const cells = row.querySelectorAll("td");
  for (let i = 0; i < 3; i++) {
    const text = cells[i].innerText;
    cells[
      i
    ].innerHTML = `<input type="text" value="${text}" class="border px-2 py-1 w-full">`;
  }

  editBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-green">save</span>`;
  addCancelButton(row);
}

function saveInlineEdit(row, editBtn) {
  const cells = row.querySelectorAll("td");
  for (let i = 0; i < 3; i++) {
    const input = cells[i].querySelector("input");
    cells[i].innerHTML = input.value.trim();
  }

  editBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-green">edit</span>`;
  removeCancelButton(row);
}

function addCancelButton(row) {
  const actionCell = row.querySelectorAll("td")[3];
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "cancelBtn text-gray-500 hover:text-gray-700 ml-2";
  cancelBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">close</span>`;
  actionCell.appendChild(cancelBtn);

  cancelBtn.addEventListener("click", () => cancelInlineEdit(row));
}

function cancelInlineEdit(row) {
  const cells = row.querySelectorAll("td");
  for (let i = 0; i < 3; i++) {
    const input = cells[i].querySelector("input");
    if (input) {
      cells[i].innerHTML = input.defaultValue;
    }
  }
  row.querySelector(
    ".editBtn"
  ).innerHTML = `<span class="material-symbols-outlined text-[18px] text-green">edit</span>`;
  removeCancelButton(row);
}

function removeCancelButton(row) {
  const cancelBtn = row.querySelector(".cancelBtn");
  if (cancelBtn) cancelBtn.remove();
}

/* Utility  function */
function createInput({
  tagName = "input",
  type = "text",
  id,
  lang,
  className,
  required,
  name,
}) {
  const input = document.createElement(tagName);
  input.type = type;
  if (id) input.id = `${lang}-${id}`;
  if (className) input.className = className;
  if (required) input.required = true;
  input.name = name || `field-${id || Date.now()}`;
  return input;
}

function addNRemoveClassFromAll(selector, className, isRemove) {
  document.querySelectorAll(selector).forEach((el) => {
    if (isRemove) {
      el.classList.remove(className);
    } else {
      el.classList.add(className);
    }
  });
}

function langSelectorSet(field, input, name, onSubmit) {
  const langSelector = input.dataset[name];
  if (name.startsWith("rule")) {
    if (langSelector) {
      field.validationErrorMessages = field.validationErrorMessages || {};
      field.validationErrorMessages[name] =
        field.validationErrorMessages[name] || {};
      field.validationErrorMessages[name][langSelector] = input.value;
    }
  } else {
    if (!langSelector) return;
    if (isEditing && !onSubmit) {
      input.value = field[name]?.[langSelector] || "";
    }
    field[name] = field[name] || {};
    field[name][langSelector] = input.value;
  }
}

function setValidationConfig(field, input, type, value, onSubmit) {
  field.validationConfig ??= {};

  if (type === "required") {
    if (isEditing) input.checked = field.validationConfig.required || false;
    field.validationConfig[type] = value;
    return;
  }

  if (type === "extensions" && isEditing && onSubmit) {
    const extValue = value?.split(",").map((ext) => ext.trim());
    input.checked = field.validationConfig.extensions || false;
    field.validationConfig[type] = extValue;
    return;
  }

  if (isEditing) {
    if (onSubmit && !input.checked) {
      field.validationConfig[type] = null;
      return;
    }

    const resolvedValue = onSubmit
      ? parseInt(getSiblingValue(input, 1)?.value) || null
      : field.validationConfig[type];

    input.checked = !!resolvedValue;

    const sibling = getSiblingValue(input, 1);
    if (sibling && resolvedValue) sibling.value = resolvedValue;

    field.validationConfig[type] = resolvedValue;
  } else {
    field.validationConfig[type] = value;
  }
}

function tableItemsHandler(table, type, field, onSubmit) {
  if (isEditing) {
    return onSubmit
      ? tableItemsSubmitHandler(field, table, type)
      : bindTableItemsFromJSON(field, table, type);
  }
  return parseTableItems(table, type);
}

function tableItemsSubmitHandler(field, table, type) {
  const rows = table.querySelectorAll("tr");
  const items = field.items;
  const propName = type === "dropDown" ? "value" : "label";
  let index = 0;

  if (rows.length - 1 < items.length) {
    editFieldData.items = items.slice(0, rows.length - 1);
    field.items = items.slice(0, rows.length - 1);
  }

  Array.from(table.querySelectorAll("tr")).map((row) => {
    const cells = row.querySelectorAll("td");
    if (!cells.length) return null;

    if (field.items.length < index + 1) {
      editFieldData.items.push({
        key: cells[0]?.textContent.trim(),
        [propName]: {
          en: cells[1]?.textContent.trim(),
          ar: cells[2]?.textContent.trim(),
        },
      });
    } else {
      field.items[index].key = cells[0]?.textContent.trim();
      field.items[index][propName].en = cells[1]?.textContent.trim();
      field.items[index][propName].ar = cells[2]?.textContent.trim();
    }
    index++;
  });
}

function parseTableItems(table, type) {
  const propName = type === "dropDown" ? "value" : "label";

  return Array.from(table.querySelectorAll("tr"))
    .map((row) => {
      const cells = row.querySelectorAll("td");
      if (!cells.length) return null;

      return {
        key: cells[0]?.textContent.trim(),
        [propName]: {
          en: cells[1]?.textContent.trim() || "",
          ar: cells[2]?.textContent.trim() || "",
        },
      };
    })
    .filter(Boolean);
}

function bindTableItemsFromJSON(field, table, type) {
  const propName = type === "dropDown" ? "value" : "label";
  const tbody = table.querySelector(".requestsTable");
  field?.items.forEach((item) => {
    generateTableRow(item.key, item[propName].en, item[propName].ar, tbody);
  });
}

function applyCommonAttributes(input, field, lang, wrapper) {
  applyPlaceholderNTooltip(input, field, lang);
  applyValidationMsg(input, field, lang, wrapper);
  applyValidation(input, field.validationConfig);
  if (field.extensions) input.accept = field.extensions;
}

function getLangValues(section, attr) {
  return {
    en: section.querySelector(`[data-${attr}="en"]`)?.value || "",
    ar: section.querySelector(`[data-${attr}="ar"]`)?.value || "",
  };
}

function buildConsent(currentSection) {
  return {
    text: getLangValues(currentSection, "consent-text"),
    link: {
      text: getLangValues(currentSection, "link-text"),
      url: getLangValues(currentSection, "link-url"),
    },
  };
}

// JSON Creation from the form's fields
function createJSONFromField(e, editSelectedSection, onSubmit) {
  const currentSection = isEditing ? editSelectedSection : e.target.children[0];
  if (!currentSection) return;

  const inputs = currentSection.querySelectorAll(
    ".field-box input, .field-box select, .field-box textarea, .field-box table"
  );

  let field;
  if (isEditing) {
    if (e.isTrusted === true) {
      e = { ...editFieldData };
      field = { ...editFieldData };
    } else {
      editFieldData = { ...e };
      field = { ...e };
    }
  } else {
    field = { id: generateGUID(), type: fieldType };
  }

  if (e.isTrusted === true) {
    field = isEditing ? editFieldData : { id: generateGUID(), type: fieldType };
  } else {
    field = isEditing ? { ...e } : { id: generateGUID(), type: fieldType };
  }

  fieldType = !isEditing ? fieldType : editFieldType;

  const langElementTypes = [
    "label",
    "placeholder",
    "tooltip",
    "attachmentButton",
    "heading",
    "submitButton",
    "cancelButton",
    "validationMessage",
    "ruleRequired",
    "ruleMinlength",
    "ruleMaxlength",
    "ruleMinselected",
    "ruleMaxselected",
    "ruleMaxsize",
    "ruleAllowedextensions",
  ];

  inputs.forEach((input) => {
    // Handle language-specific values
    langElementTypes.forEach((type) => {
      langSelectorSet(field, input, type, onSubmit);
    });

    // Handle checkbox validations
    if (input.type === "checkbox") {
      const { validationType } = input.dataset;

      const numericTypes = [
        "min",
        "minSelect",
        "maxSelect",
        "max",
        "maxFiles",
        "maxFileSizeMB",
      ];

      if (validationType === "required") {
        setValidationConfig(field, input, "required", input.checked, onSubmit);
      } else if (numericTypes.includes(validationType)) {
        setValidationConfig(
          field,
          input,
          validationType,
          input.checked && !isEditing
            ? parseInt(getSiblingValue(input, 1) || 0)
            : null,
          onSubmit
        );
      } else if (validationType === "validate") {
        handleRegexValidation(field, input, onSubmit);
      } else if (validationType === "extensions") {
        const extValue = getSiblingValue(input);
        let extSplit = !isEditing
          ? extValue.split(",").map((ext) => ext.trim())
          : null;
        if (isEditing && onSubmit) extSplit = extValue.value;
        setValidationConfig(
          field,
          input,
          "extensions",
          input.checked ? extSplit : null,
          onSubmit
        );
      }
    }

    // Consent checkbox type
    if (fieldType === "consentCheckbox") {
      const lang =
        input.dataset.consentText ||
        input.dataset.linkText ||
        input.dataset.linkUrl;

      if (isEditing) {
        if (onSubmit) {
          field.consent = buildConsent(currentSection);
          editFieldData.consent = { ...field.consent };
        } else {
          if (input.dataset.consentText) {
            input.value = field.consent?.text?.[lang] || "";
          } else if (input.dataset.linkText) {
            input.value = field.consent?.link?.text?.[lang] || "";
          } else if (input.dataset.linkUrl) {
            input.value = field.consent?.link?.url?.[lang] || "";
          }
        }
      } else {
        field.consent = buildConsent(currentSection);
      }
    }

    // Radio types (redirect, workflow, api)
    if (input.type === "radio") {
      if (input.dataset.type === "redirect") {
        field.redirectionURL = input.checked ? getSiblingValue(input, 2) : null;
      } else if (input.dataset.type === "workflow") {
        field.workFlow = input.checked ? getSiblingValue(input, 2) : null;
      } else if (input.dataset.type === "api") {
        handleApiConfig(field, input);
      }
    }

    // Table inputs
    if (input.tagName === "TABLE") {
      if (["radio", "checkBoxes"].includes(fieldType)) {
        field.radioName = `${fieldType}-${generateGUID()}`;
        field.items = tableItemsHandler(input, "radio", field, onSubmit);
      } else if (fieldType === "dropDown") {
        field.items = tableItemsHandler(input, "dropDown", field, onSubmit);
        // field.items = parseTableItems(input, "dropDown", onSubmit);
      }
    }
  });

  if (!isEditing) {
    fields.push(field);
    renderPreview();
  }
}

/* Helper API Creation Functions */
function handleRegexValidation(field, input, onSubmit) {
  const selectParent = input.parentElement.nextElementSibling;
  const dropdown = selectParent.querySelector("select");
  const validationValue = dropdown?.value ?? null;

  const customRegexCheckbox = document.querySelector(
    '[data-validation-type="regex"]'
  );
  const customRegexInput = getSiblingValue(customRegexCheckbox);

  field.validationConfig ??= {};

  if (isEditing) {
    return onSubmit
      ? handleRegexSubmit(
          field,
          input,
          validationValue,
          customRegexCheckbox,
          customRegexInput
        )
      : handleRegexBind(
          field,
          input,
          dropdown,
          customRegexCheckbox,
          customRegexInput
        );
  }

  if (validationValue === "custom") {
    field.validationConfig.regexCustom = !!customRegexInput;
    field.validationConfig.regex = customRegexCheckbox.checked
      ? customRegexInput
      : null;
  } else {
    field.validationConfig.regex = input.checked ? validationValue : null;
  }
}

function handleRegexSubmit(
  field,
  input,
  validationValue,
  checkbox,
  customInput
) {
  if (!input.checked) {
    field.validationConfig.regex = null;
    return;
  }

  if (validationValue === "custom") {
    field.validationConfig.regexCustom =
      checkbox.checked && !!customInput.value;
    field.validationConfig.regex = checkbox.checked ? customInput.value : null;
    if (checkbox.checked && !!customInput.value) {
      document.getElementById("regexField").classList.add("hidden");
    }
  } else {
    field.validationConfig.regex = validationValue;
    field.validationConfig.regexCustom = null;
  }
}

function handleRegexBind(field, input, dropdown, checkbox, customInput) {
  const config = field.validationConfig;

  if (config.regex == null) {
    dropdown.options[0].selected = true;
    return;
  }

  input.checked = !!config.regex;

  if (config.regexCustom) {
    selectDropdownOption(dropdown, "custom");
    document.getElementById("regexField").classList.remove("hidden");
    checkbox.checked = true;
    customInput.value = config.regex;
  } else {
    selectDropdownOption(dropdown, config.regex);
    document.getElementById("regexField").classList.add("hidden");
  }
}

function selectDropdownOption(dropdown, value) {
  Array.from(dropdown.options).forEach((option) => {
    option.selected = option.value === value;
  });
}

function handleApiConfig(field, input) {
  const url = getSiblingValue(input, 2);
  const selectParent = input.parentElement.parentElement.nextElementSibling;
  const method = selectParent.querySelector("select")?.value || null;
  field.api = { url, method };
}

/* Helper Render Functions */
function createLabel(text, htmlFor) {
  const label = document.createElement("label");
  label.className =
    "md:text-md text-base font-medium leading-[150%] normal-case tracking-[1.5%] block pb-[10px]";
  label.textContent = text;
  if (htmlFor) label.htmlFor = htmlFor;
  return label;
}

function applyValidation(input, config) {
  if (!config) return;
  if (config.required) input.required = true;
  if (config.min) input.minLength = config.min;
  if (config.max) input.maxLength = config.max;
  if (config.regex) input.pattern = config.regex;
}

function applyPlaceholderNTooltip(input, field, lang) {
  if (!field && lang) return;

  if (field.placeholder && (field.placeholder.en || field.placeholder.ar)) {
    if (input.tagName === "SELECT") {
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent =
        field.placeholder[lang] || "Select an option";
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      input.appendChild(placeholderOption);
    } else {
      input.placeholder = field.placeholder[lang] || "";
    }
  }
  if (field.tooltip?.en || field.tooltip?.ar) {
    input.title = field.tooltip[lang] || "";
  }
}

function applyValidationMsg(input, field, lang, wrapper) {
  if (!field && lang) return;
  if (field.validationMessage) {
    const msgBox = document.createElement("span");
    msgBox.className = "text-red text-sm mt-2 hidden";
    msgBox.textContent = field.validationMessage[lang] || "";
    setTimeout(() => {
      wrapper.appendChild(msgBox);
    }, 10);
    input.setCustomValidity(field.validationMessage[lang] || "");
  }
}

function attachFileUploadHandler() {
  setTimeout(() => {
    createEnhancedFileUploadHandler("attachment");
  }, 100);
}

// Toggle switch style checkbox
function createToggle(id, labelText, groupId) {
  const toggleLabel = document.createElement("label");
  toggleLabel.className = "inline-flex items-center cursor-pointer";

  const checkboxInput = document.createElement("input");
  checkboxInput.type = "checkbox";
  checkboxInput.className = "sr-only peer";
  checkboxInput.name = "checkbox-" + groupId;
  checkboxInput.id = id;
  checkboxInput.value = labelText;

  const toggleTrack = document.createElement("div");
  toggleTrack.className =
    "relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full " +
    "peer dark:bg-gray-400 peer-checked:after:translate-x-full " +
    "rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white " +
    "after:content-[''] after:absolute after:top-[2px] after:start-[2px] " +
    "after:bg-white after:border-gray-300 after:border after:rounded-full " +
    "after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-800";

  const toggleText = document.createElement("span");
  toggleText.className = "ms-3 text-sm font-medium text-gray-600";
  toggleText.textContent = labelText;

  toggleLabel.appendChild(checkboxInput);
  toggleLabel.appendChild(toggleTrack);
  toggleLabel.appendChild(toggleText);

  return toggleLabel;
}

// Radio or checkbox (standard style)
function createRadioOrCheckbox(type, radioName, groupId, id, labelText) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2";

  const input = document.createElement("input");
  input.type = type === "radio" ? "radio" : "checkbox";
  input.name =
    radioName ||
    (type === "radio" ? "radio-" + groupId : "checkbox-" + groupId);
  input.id = id;
  input.className = "w-4 h-4";
  input.value = labelText;

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;

  wrapper.appendChild(input);
  wrapper.appendChild(label);

  return wrapper;
}

function appendItems(input, label, wrapper, form) {
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  form.appendChild(wrapper);
}

function renderTextInput(field, lang, id, wrapper, label, form) {
  if (field.type === "validationErrorMessages") return;

  const input = createInput({
    id,
    lang,
    className:
      "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm",
    required: field.validationConfig?.required,
  });

  applyCommonAttributes(input, field, lang, wrapper);
  appendItems(input, label, wrapper, form);
}
function renderTextArea(field, lang, id, wrapper, label, form) {
  const textArea = createInput({
    tagName: "textarea",
    id,
    lang,
    className:
      "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm",
    required: field.validationConfig?.required,
  });

  applyCommonAttributes(textArea, field, lang, wrapper);
  appendItems(textArea, label, wrapper, form);
}
function renderDropDown(field, lang, id, wrapper, label, form) {
  const select = createInput({
    tagName: "select",
    id,
    lang,
    className:
      "border border-[#C8C8C8] rounded-md px-3 py-2 w-full  appearance-none max-md:text-sm",
    required: field.validationConfig?.required,
  });

  applyCommonAttributes(select, field, lang, wrapper);

  const parent = Object.assign(document.createElement("div"), {
    className: "relative w-full",
  });

  const icon = Object.assign(document.createElement("span"), {
    className:
      "material-symbols-outlined absolute pointer-events-none ltr:right-4 rtl:left-4 bottom-[18px] w-[14px] h-[14px] text-[#B0B0B0]",
    textContent: "keyboard_arrow_down",
  });

  parent.append(select, icon);
  wrapper.appendChild(label);
  wrapper.appendChild(parent);

  field.items?.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.key || "";
    option.textContent = opt?.value?.[lang] || "";
    select.appendChild(option);
  });
  form.appendChild(wrapper);
}
function renderRadioOrCheckbox(field, lang, id, wrapper, label, form) {
  const container = document.createElement("div");
  container.className = "flex flex-col gap-2 w-full";

  if (field.validationConfig?.required) {
    container.required = true;
  }

  applyPlaceholderNTooltip(label, field, lang);

  field.items?.forEach((item) => {
    const labelText = item.label?.[lang] || "";
    const itemId = item.key || "";

    if (field.type === "checkBoxes") {
      container.appendChild(createToggle(itemId, labelText, id, field));
    } else {
      container.appendChild(
        createRadioOrCheckbox(
          field.type,
          field.radioName,
          id,
          itemId,
          labelText,
          field
        )
      );
    }
  });

  appendItems(container, label, wrapper, form);
}

/* -------- Helpers -------- */

// Toggle switch style checkbox
function createToggle(id, labelText, groupId, field) {
  const toggleLabel = document.createElement("label");
  toggleLabel.className = "inline-flex items-center cursor-pointer";

  const checkboxInput = document.createElement("input");
  checkboxInput.type = "checkbox";
  checkboxInput.className = "sr-only peer";
  checkboxInput.name = "checkbox-" + groupId;
  checkboxInput.id = id;
  checkboxInput.required = field?.validationConfig?.required || false;
  checkboxInput.value = labelText;

  const toggleTrack = document.createElement("div");
  toggleTrack.className =
    "relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full " +
    "peer dark:bg-gray-400 peer-checked:after:translate-x-full " +
    "rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white " +
    "after:content-[''] after:absolute after:top-[2px] after:start-[2px] " +
    "after:bg-white after:border-gray-300 after:border after:rounded-full " +
    "after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-800";

  const toggleText = document.createElement("span");
  toggleText.className = "ms-3 text-sm font-medium text-gray-600";
  toggleText.textContent = labelText;

  toggleLabel.appendChild(checkboxInput);
  toggleLabel.appendChild(toggleTrack);
  toggleLabel.appendChild(toggleText);

  return toggleLabel;
}

// Radio or checkbox (standard style)
function createRadioOrCheckbox(type, radioName, groupId, id, labelText, field) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2";

  const input = document.createElement("input");
  input.type = type === "radio" ? "radio" : "checkbox";
  input.name =
    radioName ||
    (type === "radio" ? "radio-" + groupId : "checkbox-" + groupId);
  input.id = id;
  input.required = field?.validationConfig?.required || false;
  input.className = "w-4 h-4";
  input.value = labelText;

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;

  wrapper.appendChild(input);
  wrapper.appendChild(label);

  return wrapper;
}

function renderConsentCheckbox(field, lang, id, wrapper, labelExt, form) {
  const label = document.createElement("label");
  label.className = "flex items-start gap-2 normal-case";
  label.htmlFor = lang + "-" + id || "";

  const input = createInput({
    id,
    type: "checkbox",
    lang,
    className: "border border-[#C8C8C8] rounded px-3 py-2 max-md:text-sm",
    required: field.validationConfig?.required,
  });

  const consentText = document.createElement("span");
  // consentText.className = "mx-2";
  consentText.textContent = field.consent?.text?.[lang] || "";
  label.appendChild(input);
  label.appendChild(consentText);
  wrapper.appendChild(label);

  const rawText = field.consent?.text?.[lang] || "";
  const linkText = field.consent?.link?.text?.[lang] || "";
  const linkHref = field.consent?.link?.url?.[lang] || "#";

  if (linkText && rawText.includes(linkText)) {
    const anchorHTML = `<a href="${linkHref}" target="_blank" class="hover:underline">${linkText}</a>`;
    consentText.innerHTML = rawText.replace(linkText, anchorHTML);
  } else {
    consentText.textContent = rawText;
  }

  label.appendChild(input);
  label.appendChild(consentText);
  wrapper.appendChild(label);
  form.appendChild(wrapper);
}
function renderSubmitButton(
  field,
  lang,
  id,
  wrapper,
  label,
  form,
  buttonsLength
) {
  const isLinkAble = field.redirectionURL || field.workFlow || field.api;
  const button = document.createElement(field.redirectionURL ? "a" : "button");
  applyPlaceholderNTooltip(button, field, lang);
  if (isLinkAble) {
    button.href = field.redirectionURL || "#";
    button.target = "_blank";
  } else {
    button.type = "submit";
  }
  button.className =
    "inline-flex items-center gap-1.5 relative text-white px-4 py-2 rounded font-medium text-sm no-underline font-green submitBtn bg-green hover:bg-lightGreen cursor-pointer";
  button.textContent = field.submitButton?.[lang] || "Submit";
  addWrapperForButtons(field.type, button, buttonsLength, form, wrapper);
}
function renderCancelButton(
  field,
  lang,
  id,
  wrapper,
  label,
  form,
  buttonsLength
) {
  const button = document.createElement("button");
  button.className =
    "inline-flex items-center gap-1.5 relative text-white px-4 py-2 rounded font-medium text-sm no-underline font-green submitBtn bg-green hover:bg-lightGreen cursor-pointer";
  button.textContent = field.cancelButton?.[lang] || "Cancel";
  applyPlaceholderNTooltip(button, field, lang);
  addWrapperForButtons(field.type, button, buttonsLength, form, wrapper);
}
function renderFileAttachment(field, lang, id, wrapper, label, form) {
  applyCommonAttributes(textArea, field, lang, wrapper);
  wrapper.appendChild(label);
  const extensions = field.validationConfig.extensions || "";
  let title;
  let buttonText;

  if (field.tooltip?.en || field.tooltip?.ar) {
    title = field.tooltip[lang] || "";
  }

  if (field.attachmentButton?.en || field.attachmentButton?.ar) {
    buttonText = field.attachmentButton[lang] || "";
  }

  const uploadBtn = `
        <div class="relative w-full">
          <div class="upload-placeholder flex align-items-center gap-2 position-relative">
            <label title="${title}" class="w-100 h-100 position-absolute start-0 left-0 flex align-items-center justify-content-between" for="attachment"></label>
            <span class="upload-placeholder__text">${buttonText}</span>
            <span class="upload-placeholder__icon">
              <svg width="15" height="18" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.4585 0.402852C9.92835 -0.134284 9.06741 -0.134284 8.53728 0.402852L3.10871 5.90312C2.57857 6.44026 2.57857 7.31256 3.10871 7.8497C3.63884 8.38684 4.49978 8.38684 5.02991 7.8497L8.14286 4.69564V13.7496C8.14286 14.5102 8.74933 15.1247 9.5 15.1247C10.2507 15.1247 10.8571 14.5102 10.8571 13.7496V4.69564L13.9701 7.8497C14.5002 8.38684 15.3612 8.38684 15.8913 7.8497C16.4214 7.31256 16.4214 6.44026 15.8913 5.90312L10.4627 0.402852H10.4585ZM2.71429 15.1247C2.71429 14.3641 2.10781 13.7496 1.35714 13.7496C0.606473 13.7496 0 14.3641 0 15.1247V17.8748C0 20.1523 1.82366 22 4.07143 22H14.9286C17.1763 22 19 20.1523 19 17.8748V15.1247C19 14.3641 18.3935 13.7496 17.6429 13.7496C16.8922 13.7496 16.2857 14.3641 16.2857 15.1247V17.8748C16.2857 18.6354 15.6792 19.2499 14.9286 19.2499H4.07143C3.32076 19.2499 2.71429 18.6354 2.71429 17.8748V15.1247Z" fill="#006A52"></path>
              </svg>
            </span>
            <input class="d-none" id="attachment" type="file" accept="${extensions}" multiple="">
          </div>
          <div class="files-list mt-3" id="filesList">
            <span class="d-flex flex-wrap gap-2" id="files-names"></span>
          </div>
        </div>
      `;

  const temp = document.createElement("div");
  temp.innerHTML = uploadBtn.trim();

  const uploadNode = temp.firstElementChild;

  wrapper.appendChild(uploadNode);
  form.appendChild(wrapper);

  const filesListContainer = document.querySelector(
    "#filesList > #files-names"
  );
  if (filesListContainer) {
    filesListContainer.innerHTML = ""; // Clear previous files
  }
  attachFileUploadHandler();
}
function renderHeading(field, lang, id, wrapper, label, form) {
  const heading = document.createElement(field?.heading?.tag || "h2");
  heading.textContent = field?.heading?.[lang] || "";
  wrapper.appendChild(heading);
  form.appendChild(wrapper);
}

function renderDateInput(field, lang, id, wrapper, label, form) {
  const input = createInput({
    id,
    type: "date",
    lang,
    className:
      "border border-[#C8C8C8] rounded px-3 py-2 w-full max-md:text-sm",
    required: field.validationConfig?.required,
  });

  applyPlaceholderNTooltip(input, field, lang);
  applyValidationMsg(input, field, lang, wrapper);
  appendItems(input, label, wrapper, form);
}

function createActionButton(
  icon,
  btnClass,
  baseStyles,
  fieldId,
  extraClasses = ""
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${btnClass} ${baseStyles} ${extraClasses}`;
  button.innerHTML = `<i class="material-symbols-outlined pointer-events-none text-sm">${icon}</i>`;
  return button;
}

function wrapButton(wrapperClass, button) {
  const div = document.createElement("div");
  div.className = wrapperClass;
  div.appendChild(button);
  return div;
}

function updateAndDeleteHandler(wrapper, field) {
  const fieldId = field.id;

  const fieldActionButtons = document.createElement("div");
  fieldActionButtons.className = `field-action-buttons flex gap-1 w-full mt-4 ${
    hasEditModeOn ? "" : "hidden"
  }`;

  const btnStyles =
    "inline-flex items-center gap-1.5 relative text-white px-2 py-1 " +
    "rounded font-medium text-xs no-underline font-green w-full justify-center " +
    "bg-green hover:bg-lightGreen";

  // Create buttons
  const moveBtn = createActionButton(
    "drag_pan",
    "edit-btn-field",
    btnStyles,
    fieldId,
    "!cursor-move"
  );
  const editBtn = createActionButton(
    "edit",
    "edit-btn-field",
    btnStyles,
    fieldId,
    "cursor-pointer"
  );
  const deleteBtn = createActionButton(
    "delete",
    "delete-btn-field",
    btnStyles,
    fieldId,
    "cursor-pointer"
  );

  // Wrap them
  const moveWrapper = wrapButton("form-move drag-handle", moveBtn);
  const editWrapper = wrapButton("form-edit", editBtn);
  const deleteWrapper = wrapButton("form-delete", deleteBtn);

  // Append to wrapper
  fieldActionButtons.appendChild(moveWrapper);
  fieldActionButtons.appendChild(editWrapper);
  fieldActionButtons.appendChild(deleteWrapper);
  wrapper.appendChild(fieldActionButtons);

  // Add event listeners
  const allEndButtons = document.querySelectorAll(".form-end-buttons");

  editWrapper.addEventListener("click", () => {
    bindFieldData(field);
    toggleVisibility(formBuilder, !isEditing);
    toggleVisibilityAll(allEndButtons, !isEditing);
  });

  deleteWrapper.addEventListener("click", () => {
    deleteField(fieldId);
  });
}

function tableAddInputsRemoveRequired(section) {
  if (!section) return;

  const inputs = [
    section.querySelector(".inputKey"),
    section.querySelector(".inputValueEn"),
    section.querySelector(".inputValueAr"),
  ].filter(Boolean);

  removeRequired(inputs);
}

function bindFieldData(field) {
  isEditing = true;
  editFieldId = field.id;
  editFieldType = field.type;

  if (editFieldId) {
    showFieldBox(editFieldType);
    selectedFieldForm = document.getElementById(editFieldType);
    const saveBtn = selectedFieldForm.querySelector(".saveBtn");
    const updateBtn = selectedFieldForm.querySelector(".updateBtn");
    saveBtn.classList.add("hidden");
    updateBtn.classList.remove("hidden");
    createJSONFromField(field, selectedFieldForm);
    tableAddInputsRemoveRequired(selectedFieldForm);
  }
}

langBtn.addEventListener("change", renderPreview);

// Render Form Preview Function
function renderPreview() {
  let lang = langBtn.value || "en";
  form.dir = lang === "ar" ? "rtl" : "ltr";

  if (!form) return;
  form.innerHTML = "";

  const submitBtnCount = fields.filter(
    (item) => item.type === "submitButton"
  ).length;
  const cancelBtnCount = fields.filter(
    (item) => item.type === "cancelButton"
  ).length;

  const buttonsLength = submitBtnCount + cancelBtnCount;

  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-wrap relative";
    wrapper.dataset.id = field.id;

    const fieldId = Math.random().toString(36).slice(2, 11);
    const renderer = fieldRenderers[field.type] || renderTextInput;
    const label = createLabel(
      field.label?.[lang] || "",
      lang + "-" + fieldId || ""
    );

    const element = renderer(
      field,
      lang,
      fieldId,
      wrapper,
      label,
      form,
      buttonsLength
    );
    if (element) wrapper.appendChild(element);
    updateAndDeleteHandler(wrapper, field);
  });

  noFields();
  sortingFields();
}

function sortingFields() {
  new Sortable(form, {
    animation: 150,
    handle: ".drag-handle",
    onEnd: function (evt) {
      const newOrder = [...form.children].map((child) => child.dataset.id);

      // check if order changed
      const oldOrder = fields.map((f) => f.id);
      const isSameOrder =
        oldOrder.length === newOrder.length &&
        oldOrder.every((id, idx) => id === newOrder[idx]);

      if (!isSameOrder) {
        fields = reorderFields(fields, newOrder);
        saveFormHandler("Field reordered successfully!");
      }
    },
  });
}

function reorderFields(fields, newOrder) {
  const fieldsMap = Object.fromEntries(fields.map((f) => [f.id, f]));
  return newOrder.map((id) => fieldsMap[id]);
}

const noFields = () => {
  const noFieldsEl = document.getElementById("no-fields");
  const hasFields = fields.length > 0;

  toggleVisibility(noFieldsEl, !hasFields);
  toggleVisibility(clearFormBtn, hasFields);
  toggleVisibility(langBtn, hasFields);
};

const addWrapperForButtons = (fieldType, button, length, form, wrapper) => {
  if (fieldType === "submitButton" || fieldType === "cancelButton") {
    if (length > 1) {
      const buttonWrapper = document.querySelector(".button-wrapper");
      if (buttonWrapper) {
        buttonWrapper.appendChild(button);
      } else {
        const parent = document.createElement("div");
        parent.className = "button-wrapper flex justify-center gap-3";
        parent.appendChild(button);
        form.appendChild(parent);
      }
    } else {
      wrapper.appendChild(button);
      form.appendChild(wrapper);
    }
  }
};

const emptyFields = () => {
  const inputs = document.querySelectorAll(
    ".field-box input, .field-box select, .field-box textarea"
  );
  inputs.forEach((input) => {
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });
  const tables = document.querySelectorAll(".requestsTable");
  tables.forEach((table) => {
    table.innerHTML = "";
  });
};

formLeftPanel.forEach((btn) => {
  btn.addEventListener("submit", function (e) {
    e.preventDefault();
    createJSONFromField(e, selectedFieldForm, true);
    resetDropDownState();
    if (isEditing) {
      updateFieldAPIHandler(editFieldId, editFieldData);
    } else {
      emptyFields();
      saveFormHandler();
    }
    addNRemoveClassFromAll(".field-box", "hidden");
    noFields();
  });
});

function createEnhancedFileUploadHandler(inputId) {
  const dt = new DataTransfer(); // private to this handler
  const input = document.getElementById(inputId);
  const filesListContainer = document.querySelector(
    "#filesList > #files-names"
  );

  if (!input || !filesListContainer) return;

  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);

  newInput.addEventListener("change", function (event) {
    const selectedFiles = Array.from(event.target.files);

    selectedFiles.forEach((file) => {
      const isDuplicate = Array.from(dt.files).some(
        (f) => f.name === file.name && f.size === file.size
      );

      if (isDuplicate) return;

      // Create UI block
      const fileBloc = document.createElement("span");
      fileBloc.className = "file-block";

      const fileDelete = document.createElement("span");
      fileDelete.className = "file-delete";
      fileDelete.innerHTML = "<span>+</span>";

      const fileName = document.createElement("span");
      fileName.className = "name";
      fileName.textContent = file.name;

      fileBloc.appendChild(fileDelete);
      fileBloc.appendChild(fileName);
      filesListContainer.appendChild(fileBloc);

      // Add file to DataTransfer
      dt.items.add(file);

      // Remove file logic
      fileDelete.addEventListener("click", function () {
        const name = fileName.textContent;
        fileBloc.remove();

        for (let j = 0; j < dt.items.length; j++) {
          if (name === dt.items[j].getAsFile().name) {
            dt.items.remove(j);
            break;
          }
        }
        newInput.files = dt.files;
      });
    });

    // Update file input
    newInput.files = dt.files;
  });
}

function editModeHandler() {
  const editModeBtn = document.querySelector(".edit-mode-btn");
  const cancelEditModeBtn = document.querySelector(".cancel-edit-mode-btn");
  const fieldActionButtons = document.querySelectorAll(".field-action-buttons");
  editModeBtn.addEventListener("click", () => {
    hasEditModeOn = true;
    toggleVisibilityAll(fieldActionButtons, hasEditModeOn);
  });
  cancelEditModeBtn.addEventListener("click", () => {
    hasEditModeOn = false;
    toggleVisibilityAll(fieldActionButtons, hasEditModeOn);
  });
}

/* REST APIs */
// Load data from API
async function loadForm() {
  const res = await fetch("http://localhost:3500/api/form");
  if (res.ok) {
    fields = await res.json();
    renderPreview();
    editModeHandler();
  }
}

// Save data in API
async function saveFormHandler(msg) {
  try {
    const res = await fetch("http://localhost:3500/api/form", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const data = await res.json();

    Toastify({
      text: msg || data.message,
      duration: 3000,
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to left, #0c7560, #00b09b)",
      },
    }).showToast();
  } catch (error) {
    console.error("❌ Error submitting form:", error);

    Toastify({
      text: "Failed to submit form. Please try again later.",
      duration: 3000,
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to left, #b00020, #ff5f5f)",
      },
    }).showToast();
  }
}

// Delete all the data from API
clearFormBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3500/api/form", {
      method: "DELETE",
    });

    fields = await res.json();
    window.location.reload();
  } catch (err) {
    console.error("Error deleting form:", err);
  }
});

// Delete individual data from API
async function deleteField(id) {
  try {
    const res = await fetch(`http://localhost:3500/api/form/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    fields = data.savedForm || [];
    renderPreview();

    Toastify({
      text: data.message,
      duration: 3000,
      position: "center",
      stopOnFocus: true,
      style: { background: "linear-gradient(to left, #b00020, #ff5f5f)" },
    }).showToast();
  } catch (err) {
    console.error("Error deleting field:", err);
  }
}

// Update individual data in API
async function updateFieldAPIHandler(id, newData) {
  try {
    const res = await fetch(`http://localhost:3500/api/form/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }

    fields = data.savedForm || [];
    renderPreview();
    isEditing = false;
    addNRemoveClassFromAll(".saveBtn", "hidden", true);
    addNRemoveClassFromAll(".updateBtn", "hidden");
    emptyFields();
    toggleVisibility(formBuilder, !isEditing);

    Toastify({
      text: data.message,
      duration: 3000,
      position: "center",
      stopOnFocus: true,
      style: { background: "linear-gradient(to left, #0c7560, #00b09b)" },
    }).showToast();
  } catch (err) {
    console.error("Error updating field:", err.message);
  }
}

window.onload = loadForm;
