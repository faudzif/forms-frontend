(function () {
  const appFormBuilder = {
    element: {
      langBtn: document.getElementById("language"),
      formBuilder: document.getElementById("formBuilder"),
      form: document.getElementById("form-preview"),
      clearFormBtn: document.getElementById("clearFormBtn"),
      fieldTypeDDSelector: document.getElementById("FieldTypeDropDown"),
      formLeftPanel: document.querySelectorAll(".form-submit"),
      closeButtonsFieldBox: document.querySelectorAll(".closeBtnFieldBoxJS"),
      regexType: document.getElementById("RegexType"),
      regexField: document.getElementById("regexField"),
      regexBox: document.querySelectorAll(".regex-box"),
      fieldBox: document.querySelectorAll(".field-box"),
      tableSections: document.querySelectorAll(".table-section"),
    },
    state: {
      fields: [],
      hasEditModeOn: false,
      editFieldType: null,
      editFieldData: null,
      editFieldId: null,
      fieldType: null,
      isEditing: false,
      selectedFieldForm: null,
    },
    utils: {
      generateId: () => crypto.randomUUID(),
      getSiblingValue: function (input, steps = 1) {
        let el = input;
        while (steps-- && el?.parentElement) {
          el = el.parentElement;
        }
        return isEditing
          ? el?.nextElementSibling || null
          : el?.nextElementSibling?.value || null;
      },
      normalizeValue: function (val) {
        // If it's an element, return its .value
        if (val instanceof HTMLElement) {
          return val.value?.trim() || "";
        }
        // If it's already a string, return as is
        if (typeof val === "string") {
          return val.trim();
        }
        return ""; // fallback for null/undefined
      },
      toggleVisibility: (element, show) => {
        element?.classList.toggle("hidden", !show);
      },
      toggleVisibilityAll: (element, show) => {
        element?.forEach((el) => el.classList.toggle("hidden", !show));
      },
      clearInputs(inputs) {
        inputs.forEach((input) => (input.value = ""));
      },
    },
    helpers: {
      
    },
    actions: {
      
    },
    handlers: {
      
    },

    main: {

    },

    API: {
      
    },
    init() {
      
    },
  };
  window.appFormBuilder = appFormBuilder;
})();

document.addEventListener("DOMContentLoaded", () => {
  window.appFormBuilder?.init?.();
});
