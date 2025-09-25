/* Global Variables */
// Element references
const langBtn = document.getElementById("language");
const clearFormBtn = document.getElementById("clearFormBtn");
const fieldTypeDDSelector = document.getElementById("FieldTypeDropDown");
let fields = [];
let fieldType;
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
  return el?.nextElementSibling?.value || null;
}

const toggleVisibility = (element, show) => {
  element.classList.toggle("hidden", !show);
};

const showFieldBox = (selectedValue) => {
  document
    .querySelectorAll(".field-box")
    .forEach((el) => el.classList.add("hidden"));
  const map = {
    textField: "textField",
    textArea: "textArea",
    dropDown: "dropDown",
    radio: "radioButtons",
    checkBoxes: "checkBoxes",
    datePicker: "datePicker",
    fileAttachment: "fileAttachments",
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
  });
});

const resetDropDownState = () => {
  fieldTypeDDSelector.selectedIndex = 0;
};

// Add Row Function
document.querySelectorAll(".table-section").forEach((section) => {
  const tbody = section.querySelector(".requestsTable");
  const addBtn = section.querySelector(".addRowBtn");
  const inputKey = section.querySelector(".inputKey");
  const inputEn = section.querySelector(".inputValueEn");
  const inputAr = section.querySelector(".inputValueAr");

  // Function to add a row (shared for button and Enter key)
  function addRow() {
    const key = inputKey.value.trim();
    const valEn = inputEn.value.trim();
    const valAr = inputAr.value.trim();

    if (!key || !valEn || !valAr) {
      alert("Please fill all fields");
      return;
    }

    const newRow = document.createElement("tr");
    newRow.className = "bg-white border-b";
    newRow.innerHTML = generateRowHtml(key, valEn, valAr);
    tbody.appendChild(newRow);
    attachRowListeners(newRow);

    inputKey.value = "";
    inputEn.value = "";
    inputAr.value = "";
    inputKey.focus();
  }

  // Add button click
  addBtn.addEventListener("click", addRow);

  // Add on Enter key in any input
  [inputKey, inputEn, inputAr].forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // prevent form submission
        addRow();
      }
    });
  });

  // Initialize existing rows (if any)
  if (tbody) {
    tbody.querySelectorAll("tr").forEach(attachRowListeners);
  }
});

function generateRowHtml(key, valEn, valAr) {
  return `
    <td class="px-6 py-4 font-medium">${key}</td>
    <td class="px-6 py-4 font-medium">${valEn}</td>
    <td class="px-6 py-4 font-medium">${valAr}</td>
    <td class="px-6 py-4 text-center">
      <button class="editBtn text-blue-500 hover:text-blue-700" title="Edit">
        <span class="material-symbols-outlined text-[18px] text-green">edit</span>
      </button>
      <button class="deleteBtn text-red hover:text-red-700" title="Delete">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </td>
    <td class="px-6 py-4 text-center">
      <a class="text-green hover:text-lightGreen" href="#"><i class="material-symbols-outlined" style="font-size: 24px">visibility</i></a>
    </td>
  `;
}

function attachRowListeners(row) {
  const editBtn = row.querySelector(".editBtn");
  const deleteBtn = row.querySelector(".deleteBtn");

  editBtn.addEventListener("click", () => {
    if (editBtn.innerText.toLowerCase().includes("edit")) {
      enableInlineEdit(row, editBtn);
    } else {
      saveInlineEdit(row, editBtn);
    }
  });

  deleteBtn.addEventListener("click", () => {
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
function langSelectorSet(field, input, name) {
  const langSelector = input.dataset[name];
  if (name.startsWith("rule")) {
    if (langSelector) {
      field.validationErrorMessages = field.validationErrorMessages || {};
      field.validationErrorMessages[name] =
        field.validationErrorMessages[name] || {};
      field.validationErrorMessages[name][langSelector] = input.value;
    }
  } else {
    if (langSelector) {
      field[name] = field[name] || {};
      field[name][langSelector] = input.value;
    }
  }
}

function setValidationConfig(field, type, value) {
  field.validationConfig = field.validationConfig || {};
  field.validationConfig[type] = value;
}

function parseTableItems(table, type) {
  return Array.from(table.querySelectorAll("tr"))
    .map((row) => {
      const cells = row.querySelectorAll("td");
      if (!cells.length) return null;

      if (type === "dropDown") {
        return {
          key: cells[0]?.textContent.trim(),
          value: {
            en: cells[1]?.textContent.trim() || "",
            ar: cells[2]?.textContent.trim() || "",
          },
        };
      }
      return {
        key: cells[0]?.textContent.trim(),
        label: {
          en: cells[1]?.textContent.trim() || "",
          ar: cells[2]?.textContent.trim() || "",
        },
      };
    })
    .filter(Boolean);
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

// JSON Creation from the form's fields
function addField(e) {
  const currentSection = e.target.children[0];
  if (!currentSection) return;

  const inputs = currentSection.querySelectorAll(
    ".field-box input, .field-box select, .field-box textarea, .field-box table"
  );

  const langElementTypes = [
    "label",
    "placeholder",
    "tooltip",
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

  let field = {
    id: generateGUID(),
    type: fieldType,
  };
  inputs.forEach((input) => {
    const consentMessageLang = input.dataset.consentText;

    langElementTypes.forEach((type) => {
      langSelectorSet(field, input, type);
    });

    if (
      input.type === "checkbox" &&
      input.dataset.validationType === "required"
    ) {
      setValidationConfig(field, "required", input.checked);
    }
    if (input.type === "checkbox") {
      if (input.dataset.validationType === "min") {
        setValidationConfig(
          field,
          "min",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
      if (input.dataset.validationType === "minSelect") {
        setValidationConfig(
          field,
          "minSelect",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
      if (input.dataset.validationType === "maxSelect") {
        setValidationConfig(
          field,
          "maxSelect",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
      if (input.dataset.validationType === "max") {
        setValidationConfig(
          field,
          "max",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
      if (input.dataset.validationType === "maxFiles") {
        setValidationConfig(
          field,
          "maxFiles",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
      if (input.dataset.validationType === "maxFileSizeMB") {
        setValidationConfig(
          field,
          "maxFileSizeMB",
          input.checked ? parseInt(getSiblingValue(input)) : null
        );
      }
    }

    if (input.type === "radio" && input.dataset.type === "redirect") {
      const url = getSiblingValue(input, 2);
      field.redirectionURL = input.checked ? url : null;
    }
    if (input.type === "radio" && input.dataset.type === "workflow") {
      const workFlow = getSiblingValue(input, 2);
      field.workFlow = input.checked ? workFlow : null;
    }
    if (input.type === "radio" && input.dataset.type === "api") {
      const url = getSiblingValue(input, 2);
      const selectParent = input.parentElement.parentElement.nextElementSibling;
      const method = selectParent.querySelector("select")?.value || null;
      field.api = {
        url,
        method,
      };
    }
    if (
      input.type === "checkbox" &&
      input.dataset.validationType === "validate"
    ) {
      const selecParent = input.parentElement.nextElementSibling;
      const validationValue =
        selecParent.querySelector("select")?.value || null;
      if (validationValue === "custom") {
        const regexField = document.querySelector(
          '[data-validation-type="regex"]'
        );
        const regexValue = getSiblingValue(regexField);
        field.validationConfig = field.validationConfig || {};
        field.validationConfig.regex = regexField.checked ? regexValue : null;
      } else {
        field.validationConfig = field.validationConfig || {};
        field.validationConfig.regex = input.checked ? validationValue : null;
      }
    }
    if (
      input.type === "checkbox" &&
      input.dataset.validationType === "extensions"
    ) {
      const extValue = getSiblingValue(input);
      // field.extensions = input.checked ? extValue.split(",") : null;
      setValidationConfig(
        field,
        "extensions",
        input.checked ? extValue.split(",") : null
      );
    }
    if (input.type === "text" && input.dataset.dataHeading === "extensions") {
      const extValue = getSiblingValue(input);
      // field.extensions = input.checked ? extValue.split(",") : null;
      setValidationConfig(
        field,
        "extensions",
        input.checked ? extValue.split(",") : null
      );
    }
    if (consentMessageLang && fieldType === "consentCheckbox") {
      field.consent = {
        text: getLangValues(currentSection, "consent-text"),
        link: {
          text: getLangValues(currentSection, "link-text"),
          url: getLangValues(currentSection, "link-url"),
        },
      };
    }

    if (input.tagName === "TABLE") {
      if (["radio", "checkBoxes"].includes(fieldType)) {
        field.radioName = fieldType + "-" + generateGUID();
        field.items = parseTableItems(input, "radio");
      }
      if (fieldType === "dropDown") {
        field.items = parseTableItems(input, "dropDown");
      }
    }

    // if (input.type === "text" && input.dataset.dataHeading === "extensions") {
    //   const extValue = getSiblingValue(input);
    //   field.extensions = input.checked ? extValue.split(",") : null;
    // }

    if (fieldType === "validationErrorMessages") {
      // field.validationErrorMessages = field.validationErrorMessages || {};
    }
  });

  fields.push(field);
  renderPreview();
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
  if (field.placeholder?.en || field.placeholder?.ar) {
    input.placeholder = field.placeholder[lang] || "";
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
function renderTextInput(field, lang, id, wrapper, label, form) {
  if (field.type === "validationErrorMessages") return;
  input = document.createElement("input");
  input.className =
    "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm";
  input.id = lang + "-" + id || "";
  input.type = "text";

  applyPlaceholderNTooltip(input, field, lang);
  applyValidationMsg(input, field, lang, wrapper);

  if (field.extensions) {
    input.accept = field.extensions;
  }

  applyValidation(input, field.validationConfig);
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  form.appendChild(wrapper);
}
function renderTextArea(field, lang, id, wrapper, label, form) {
  const textArea = document.createElement("textarea");
  textArea.className =
    "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm";
  textArea.id = lang + "-" + id || "";
  if (field.placeholder?.en || field.placeholder?.ar) {
    textArea.placeholder = field.placeholder[lang] || "";
  }
  if (field.tooltip?.en || field.tooltip?.ar) {
    textArea.title = field.tooltip[lang] || "";
  }

  applyValidation(textArea, field.validationConfig);

  if (field.validationMessage) {
    const msgBox = document.createElement("span");
    msgBox.className = "text-red text-sm mt-2 hidden";
    msgBox.textContent = field.validationMessage[lang] || "";
    setTimeout(() => {
      wrapper.appendChild(msgBox);
    }, 10);
    textArea.setCustomValidity(field.validationMessage[lang] || "");
  }
  if (field.extensions) {
    textArea.accept = field.extensions;
  }
  wrapper.appendChild(label);
  wrapper.appendChild(textArea);
  form.appendChild(wrapper);
}
function renderDropDown(field, lang, id, wrapper, label, form) {
  input = document.createElement("select");

  input.className =
    "border border-[#C8C8C8] rounded-md px-3 py-2 w-full  appearance-none max-md:text-sm";

  if (field.validationConfig.required) {
    input.required = true;
  }
  if (field.placeholder && (field.placeholder.en || field.placeholder.ar)) {
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent =
      field.placeholder[lang] || "Select an option";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    input.appendChild(placeholderOption);
  }

  const parent = Object.assign(document.createElement("div"), {
    className: "relative w-full",
  });

  const icon = Object.assign(document.createElement("span"), {
    className:
      "material-symbols-outlined absolute pointer-events-none ltr:right-4 rtl:left-4 bottom-[18px] w-[14px] h-[14px] text-[#B0B0B0]",
    textContent: "keyboard_arrow_down",
  });

  parent.append(input, icon);
  wrapper.appendChild(label);
  wrapper.appendChild(parent);

  field.items?.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.key || "";
    option.textContent = opt?.value?.[lang] || "";
    input.appendChild(option);
  });
  form.appendChild(wrapper);
}
function renderRadioOrCheckbox(field, lang, id, wrapper, label, form) {
  input = document.createElement("div");
  input.className = "flex flex-col gap-2  w-full";
  if (field.validationConfig.required) {
    input.required = true;
  }

  applyPlaceholderNTooltip(label, field, lang);

  field.items?.forEach((item) => {
    if (field.type === "checkBoxes") {
      // ✅ Render custom toggle switch
      const toggleLabel = document.createElement("label");
      toggleLabel.className = "inline-flex items-center cursor-pointer";

      const checkboxInput = document.createElement("input");
      checkboxInput.type = "checkbox";
      checkboxInput.className = "sr-only peer";
      checkboxInput.name = "checkbox-" + id;
      checkboxInput.id = item.key || "";
      checkboxInput.value = item.label?.[lang] || "";

      const toggleTrack = document.createElement("div");
      toggleTrack.className =
        "relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-400 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-800";

      const toggleText = document.createElement("span");
      toggleText.className = "ms-3 text-sm font-medium text-gray-600";
      toggleText.textContent = item.label?.[lang] || "";

      toggleLabel.appendChild(checkboxInput);
      toggleLabel.appendChild(toggleTrack);
      toggleLabel.appendChild(toggleText);

      input.appendChild(toggleLabel);
    } else {
      // ✅ Render standard radio buttons
      const radioWrapper = document.createElement("div");
      radioWrapper.className = "flex items-center gap-2";

      const radioInput = document.createElement("input");
      radioInput.type = field.type === "radio" ? "radio" : "checkbox";
      radioInput.name =
        field.radioName ||
        (field.type === "radio" ? "radio-" + id : "checkbox-" + id);
      radioInput.id = item.key || "";
      radioInput.className = "w-4 h-4";
      radioInput.value = item.label?.[lang] || "";

      const radioLabel = document.createElement("label");
      radioLabel.htmlFor = item.key || "";
      radioLabel.textContent = item.label?.[lang] || "";

      radioWrapper.appendChild(radioInput);
      radioWrapper.appendChild(radioLabel);

      input.appendChild(radioWrapper);
    }
  });
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  form.appendChild(wrapper);
}
function renderConsentCheckbox(field, lang, id, wrapper, labelExt, form) {
  const label = document.createElement("label");
  label.className = "flex gap-2 items-center normal-case";
  label.htmlFor = lang + "-" + id || "";

  input = document.createElement("input");
  input.type = "checkbox";
  input.className = "border border-[#C8C8C8] rounded px-3 py-2 max-md:text-sm";
  input.id = lang + "-" + id || "";
  input.required = field.required || false;
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
  const extensions = field.extensions || "";
  let title;

  if (field.tooltip?.en || field.tooltip?.ar) {
    title = field.tooltip[lang] || "";
  }
  const uploadBtn = `
        <div class="relative">
          <div class="upload-placeholder flex align-items-center gap-2 position-relative">
            <label title="${title}" class="w-100 h-100 position-absolute start-0 left-0 flex align-items-center justify-content-between" for="attachment"></label>
            <span class="upload-placeholder__text">Supporting Document Upload</span>
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
  input = document.createElement("input");
  input.type = "date";
  input.className =
    "border border-[#C8C8C8] rounded px-3 py-2 w-full max-md:text-sm";
  if (field.required) {
    input.required = true;
  }

  applyPlaceholderNTooltip(input, field, lang);
  applyValidationMsg(input, field, lang, wrapper);

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  form.appendChild(wrapper);
}

// Render Form Preview Function
function renderPreview() {
  let lang = langBtn.value || "en";
  const form = document.getElementById("form-preview");
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
    wrapper.className = "flex flex-wrap";

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
  });

  noFields();
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

const saveBtn = document.querySelectorAll(".form-submit");

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

saveBtn.forEach((btn) => {
  btn.addEventListener("submit", function (e) {
    e.preventDefault();
    addField(e);
    emptyFields();
    // renderPreview();
    saveForm();
    noFields();
    // console.log("🚀 ~ fields:", fields)
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

/* RESP APIs */
// Load form API on load
async function loadForm() {
  const res = await fetch("http://localhost:3500/form");
  if (res.ok) {
    fields = await res.json();
    renderPreview();
  }
}

// Save form API
async function saveForm() {
  try {
    const res = await fetch("http://localhost:3500/form", {
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
      text: data.message || "Form submitted successfully!",
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

// Clear form
clearFormBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3500/form", {
      method: "DELETE",
    });

    fields = await res.json();
    window.location.reload();
  } catch (err) {
    console.error("Error clearing form:", err);
  }
});

window.onload = loadForm;
