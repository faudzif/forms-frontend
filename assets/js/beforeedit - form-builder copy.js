(function () {
  function createFormBuilder(rootElement) {
    const appFormBuilder = {
      element: {
        root: rootElement,
        langBtn: rootElement.querySelector(".language"),
        formBuilder: rootElement.querySelector(".formBuilder"),
        form: rootElement.querySelector(".form-preview"),
        clearFormBtn: rootElement.querySelector(".clearFormBtn"),
        fieldTypeDDSelector: rootElement.querySelector(".FieldTypeDropDown"),
        formLeftPanel: rootElement.querySelectorAll(".form-submit"),
        closeButtonsFieldBox: rootElement.querySelectorAll(".closeBtnFieldBoxJS"),
        regexType: rootElement.querySelector(".RegexType"),
        regexField: rootElement.querySelector(".regexField"),
        regexBox: rootElement.querySelectorAll(".regex-box"),
        fieldBox: rootElement.querySelectorAll(".field-box"),
        tableSections: rootElement.querySelectorAll(".table-section"),
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
        normalizeValue: function (val) {
          if (val instanceof HTMLElement) return val.value?.trim() || "";
          if (typeof val === "string") return val.trim();
          return "";
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
      actions: {
        addField(field) {
          this.state.fields.push(field);
          this.renderPreview();
        },
        clearFields() {
          this.state.fields = [];
          this.renderPreview();
        },
        renderPreview() {
          if (!this.element.form) return;
          this.element.form.innerHTML = "";
          this.state.fields.forEach((f) => {
            const div = document.createElement("div");
            div.textContent = `${f.type}: ${f.label}`;
            this.element.form.appendChild(div);
          });
        },
      },
      init() {
        this.element.clearFormBtn?.addEventListener("click", () =>
          this.actions.clearFields()
        );
      },
    };
    appFormBuilder.init();
    return appFormBuilder;
  }

  // Expose globally
  window.createFormBuilder = createFormBuilder;
})();
