(function () {
  let forms = [];
  let formLoop = false;
  let hasAccordionCall = false;

  const CONFIG = {
    API_BASE: "http://localhost:3500/api",
    ENDPOINTS: {
      FORM: "/form",
    },
  };

  function createFormBuilder(rootElement, formData) {
    const formIndex = parseInt(rootElement.dataset.formId) - 1;
    const formIndexForId = formIndex + 1;
    const appFormBuilder = {
      element: {
        // Ids
        languageSelect: rootElement.querySelector("#language"),
        formBuilderWrapper: rootElement.querySelector("#formBuilder"),
        formPreview: rootElement.querySelector("#form-preview"),
        clearFormButton: rootElement.querySelector("#clearFormBtn"),
        fieldTypeDropdown: rootElement.querySelector("#FieldTypeDropDown"),
        regexField: rootElement.querySelector("#regexField"),
        regexType: rootElement.querySelector("#RegexType"),
        editButtonsSet: rootElement.querySelector("#edit-buttons-set"),
        noFieldsEl: rootElement.querySelector("#no-fields"),
        accordionGroup: document.querySelector("#accordion-group"),

        // Single Elements
        editModeBtn: rootElement.querySelector(".edit-mode-btn"),
        cancelEditModeBtn: rootElement.querySelector(".cancel-edit-mode-btn"),
        addFormBtn: rootElement.querySelector(".addFormBtn"),

        // Multiple Elements
        formLeftPanel: rootElement.querySelectorAll(".form-submit"),
        closeButtonsFieldBox: rootElement.querySelectorAll(
          ".closeBtnFieldBoxJS"
        ),
        regexValidationBox: rootElement.querySelectorAll(".regex-box"),
        fieldBox: rootElement.querySelectorAll(".field-box"),
        tableSections: rootElement.querySelectorAll(".table-section"),
      },

      state: {
        formId: `form-${formIndexForId}`,
        fieldType: null,
        activeFieldForm: null,
        isEditModeEnabled: false,
        isFieldEditing: false,
        editFieldType: null,
        editFieldData: null,
        editFieldId: null,
      },

      utils: {
        generateId: () => crypto.randomUUID(),
        getSiblingValue(input, steps = 1) {
          let el = input;
          while (steps-- && el?.parentElement) {
            el = el?.parentElement;
          }
          return appFormBuilder.state?.isFieldEditing
            ? el?.nextElementSibling || null
            : el?.nextElementSibling?.value || null;
        },
        normalizeValue(val) {
          // If it's an element, return its .value
          if (val instanceof HTMLElement) {
            return val?.value?.trim() || "";
          }
          // If it's already a string, return as is
          if (typeof val === "string") {
            return val?.trim();
          }
          return ""; // fallback for null/undefined
        },
        toggleVisibility: (element, show) => {
          element?.classList?.toggle("hidden", !show);
        },
        toggleVisibilityAll: (element, show) => {
          element?.forEach((el) => el?.classList?.toggle("hidden", !show));
        },
        clearInputs(inputs) {
          inputs?.forEach((input) => {
            if (input) input.value = "";
          });
        },
        addNRemoveClassFromAll(selector, className, isRemove) {
          rootElement.querySelectorAll(selector)?.forEach((el) => {
            if (isRemove) {
              el?.classList?.remove(className);
            } else {
              el?.classList?.add(className);
            }
          });
        },
      },

      helpers: {
        // Table - Helpers
        createTableRow(inputKey, inputEn, inputAr, tbody) {
          const key = appFormBuilder.utils.normalizeValue(inputKey);
          const valEn = appFormBuilder.utils.normalizeValue(inputEn);
          const valAr = appFormBuilder.utils.normalizeValue(inputAr);

          if (!key || !valEn || !valAr) {
            alert("Please fill all fields");
            return;
          }

          const newRow = document.createElement("tr");
          newRow.className = "bg-white border-b";
          newRow.innerHTML = appFormBuilder.helpers.generateTableCells(
            key,
            valEn,
            valAr
          );

          tbody.appendChild(newRow);
          appFormBuilder.actions.bindRowEventListeners(newRow);

          if (!inputKey.value) {
            return;
          }

          appFormBuilder.utils.clearInputs([inputKey, inputEn, inputAr]);
          inputKey.focus();
        },
        generateTableCells(key, valEn, valAr) {
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
            <a class="text-green hover:text-lightGreen" href="#">
              <i class="material-symbols-outlined" style="font-size: 24px">visibility</i>
            </a>
          </td>
        `;
        },

        insertCancelButton(row) {
          const actionCell = row.querySelectorAll("td")[3];
          const cancelButton = document.createElement("button");
          cancelButton.className =
            "cancelButton text-gray-500 hover:text-gray-700 ml-2";
          cancelButton.innerHTML = `<span class="material-symbols-outlined text-[18px]">close</span>`;
          actionCell.appendChild(cancelButton);
          cancelButton.addEventListener("click", () =>
            appFormBuilder.helpers.handleCancelInlineEdit(row)
          );
        },
        handleCancelInlineEdit(row) {
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
          appFormBuilder.helpers.deleteCancelButton(row);
        },
        deleteCancelButton(row) {
          const cancelButton = row.querySelector(".cancelBtn");
          if (cancelButton) cancelButton.remove();
        },
        createInput({
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
          if (id) input.id = `${lang ? lang + "-" : ""}${id}`;
          if (className) input.className = className;
          if (required) input.required = true;
          input.name = name || `field-${id || Date.now()}`;
          return input;
        },
        selectDropdownOption(dropdown, value) {
          Array.from(dropdown.options).forEach((option) => {
            option.selected = option.value === value;
          });
        },

        // JSON Creation and Updates from the form's fields - Helpers
        langSelectorSet(field, input, name, onSubmit) {
          const langSelector = input.dataset[name];
          if (name.startsWith("rule")) {
            if (langSelector) {
              field.validationErrorMessages =
                field.validationErrorMessages || {};
              field.validationErrorMessages[name] =
                field.validationErrorMessages[name] || {};
              field.validationErrorMessages[name][langSelector] = input.value;
            }
          } else {
            if (!langSelector) return;
            if (appFormBuilder.state.isFieldEditing && !onSubmit) {
              input.value = field[name]?.[langSelector] || "";
            }
            field[name] = field[name] || {};
            field[name][langSelector] = input.value;
          }
        },
        setValidationConfig(field, input, type, value, onSubmit) {
          field.validationConfig ??= {};

          if (type === "required") {
            if (appFormBuilder.state.isFieldEditing)
              input.checked = field.validationConfig.required || false;
            field.validationConfig[type] = value;
            return;
          }

          if (
            type === "extensions" &&
            appFormBuilder.state.isFieldEditing &&
            onSubmit
          ) {
            const extValue = value?.split(",").map((ext) => ext.trim());
            input.checked = field.validationConfig.extensions || false;
            field.validationConfig[type] = extValue;
            return;
          }

          if (appFormBuilder.state.isFieldEditing) {
            if (onSubmit && !input.checked) {
              field.validationConfig[type] = null;
              return;
            }

            const resolvedValue = onSubmit
              ? parseInt(
                  appFormBuilder.utils.getSiblingValue(input, 1)?.value
                ) || null
              : field.validationConfig[type];

            input.checked = !!resolvedValue;

            const sibling = appFormBuilder.utils.getSiblingValue(input, 1);
            if (sibling && resolvedValue) sibling.value = resolvedValue;

            field.validationConfig[type] = resolvedValue;
          } else {
            field.validationConfig[type] = value;
          }
        },
        tableItemsHandler(table, type, field, onSubmit) {
          if (appFormBuilder.state.isFieldEditing) {
            return onSubmit
              ? appFormBuilder.helpers.tableItemsSubmitHandler(
                  field,
                  table,
                  type
                )
              : appFormBuilder.actions.bindTableItemsFromJSON(
                  field,
                  table,
                  type
                );
          }
          return appFormBuilder.helpers.parseTableItems(table, type);
        },
        tableItemsSubmitHandler(field, table, type) {
          const rows = table.querySelectorAll("tr");
          const items = field.items;
          const propName = type === "dropDown" ? "value" : "label";
          let index = 0;

          if (rows.length - 1 < items.length) {
            appFormBuilder.state.editFieldData.items = items.slice(
              0,
              rows.length - 1
            );
            field.items = items.slice(0, rows.length - 1);
          }

          Array.from(table.querySelectorAll("tr")).map((row) => {
            const cells = row.querySelectorAll("td");
            if (!cells.length) return null;

            if (field.items.length < index + 1) {
              appFormBuilder.state.editFieldData.items.push({
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
        },
        parseTableItems(table, type) {
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
        },
        applyInputAttributes(input, field, lang, wrapper) {
          appFormBuilder.helpers.applyPlaceholderNTooltip(input, field, lang);
          appFormBuilder.helpers.applyValidationMsg(
            input,
            field,
            lang,
            wrapper
          );
          appFormBuilder.helpers.applyValidation(input, field.validationConfig);
          if (field.extensions) input.accept = field.extensions;
        },
        getLangValues(section, attr) {
          return {
            en: section.querySelector(`[data-${attr}="en"]`)?.value || "",
            ar: section.querySelector(`[data-${attr}="ar"]`)?.value || "",
          };
        },
        buildConsent(currentSection) {
          return {
            text: appFormBuilder.helpers.getLangValues(
              currentSection,
              "consent-text"
            ),
            link: {
              text: appFormBuilder.helpers.getLangValues(
                currentSection,
                "link-text"
              ),
              url: appFormBuilder.helpers.getLangValues(
                currentSection,
                "link-url"
              ),
            },
          };
        },
        handleRegexValidation(field, input, onSubmit) {
          const selectParent = input.parentElement.nextElementSibling;
          const dropdown = selectParent.querySelector("select");
          const validationValue = dropdown?.value ?? null;

          const customRegexCheckbox = rootElement.querySelector(
            '[data-validation-type="regex"]'
          );
          const customRegexInput =
            appFormBuilder.utils.getSiblingValue(customRegexCheckbox);

          field.validationConfig ??= {};

          if (appFormBuilder.state.isFieldEditing) {
            return onSubmit
              ? appFormBuilder.helpers.handleRegexSubmit(
                  field,
                  input,
                  validationValue,
                  customRegexCheckbox,
                  customRegexInput
                )
              : appFormBuilder.helpers.handleRegexBind(
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
            field.validationConfig.regex = input.checked
              ? validationValue
              : null;
          }
        },
        handleRegexSubmit(
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
            field.validationConfig.regex = checkbox.checked
              ? customInput.value
              : null;
            if (checkbox.checked && !!customInput.value) {
              appFormBuilder.element.regexField.classList.add("hidden");
            }
          } else {
            field.validationConfig.regex = validationValue;
            field.validationConfig.regexCustom = null;
          }
        },
        handleRegexBind(field, input, dropdown, checkbox, customInput) {
          const config = field.validationConfig;

          if (config.regex == null) {
            dropdown.options[0].selected = true;
            return;
          }

          input.checked = !!config.regex;

          if (config.regexCustom) {
            appFormBuilder.helpers.selectDropdownOption(dropdown, "custom");
            appFormBuilder.element.regexField.classList.remove("hidden");
            checkbox.checked = true;
            customInput.value = config.regex;
          } else {
            appFormBuilder.helpers.selectDropdownOption(dropdown, config.regex);
            appFormBuilder.element.regexField.classList.add("hidden");
          }
        },
        handleApiConfig(field, input) {
          const url = getSiblingValue(input, 2);
          const selectParent =
            input.parentElement.parentElement.nextElementSibling;
          const method = selectParent.querySelector("select")?.value || null;
          field.api = { url, method };
        },

        // Render - Helpers
        createLabel(text, htmlFor) {
          const label = document.createElement("label");
          label.className =
            "md:text-md text-base font-medium leading-[150%] normal-case tracking-[1.5%] block pb-[10px]";
          label.textContent = text;
          if (htmlFor) label.htmlFor = htmlFor;
          return label;
        },
        applyValidation(input, config) {
          if (!config) return;
          if (config.required) input.required = true;
          if (config.min) input.minLength = config.min;
          if (config.max) input.maxLength = config.max;
          if (config.regex) input.pattern = config.regex;
        },
        applyPlaceholderNTooltip(input, field, lang) {
          if (!field && lang) return;

          if (
            field.placeholder &&
            (field.placeholder.en || field.placeholder.ar)
          ) {
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
        },
        applyValidationMsg(input, field, lang, wrapper) {
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
        },
        attachFileUploadHandler() {
          setTimeout(() => {
            appFormBuilder.helpers.createEnhancedFileUploadHandler(
              "attachment"
            );
          }, 100);
        },
        createToggle(id, labelText, groupId, field) {
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
        },
        createRadioOrCheckbox(type, radioName, groupId, id, labelText, field) {
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
        },
        appendItems(input, label, wrapper, form) {
          wrapper.appendChild(label);
          wrapper.appendChild(input);
          form.appendChild(wrapper);
        },
        renderInputText(field, lang, id, wrapper, label, form) {
          if (field.type === "validationErrorMessages") return;

          const input = appFormBuilder.helpers.createInput({
            id,
            lang,
            className:
              "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm",
            required: field.validationConfig?.required,
          });

          appFormBuilder.helpers.applyInputAttributes(
            input,
            field,
            lang,
            wrapper
          );
          appFormBuilder.helpers.appendItems(input, label, wrapper, form);
        },
        renderInputTextArea(field, lang, id, wrapper, label, form) {
          const textArea = appFormBuilder.helpers.createInput({
            tagName: "textarea",
            id,
            lang,
            className:
              "border border-[#C8C8C8] rounded px-3 py-2  w-full max-md:text-sm",
            required: field.validationConfig?.required,
          });
          textArea.style = "resize: none;";

          appFormBuilder.helpers.applyInputAttributes(
            textArea,
            field,
            lang,
            wrapper
          );
          appFormBuilder.helpers.appendItems(textArea, label, wrapper, form);
        },
        renderInputDropDown(field, lang, id, wrapper, label, form) {
          const select = appFormBuilder.helpers.createInput({
            tagName: "select",
            id,
            lang,
            className:
              "border border-[#C8C8C8] rounded-md px-3 py-2 w-full  appearance-none max-md:text-sm",
            required: field.validationConfig?.required,
          });

          appFormBuilder.helpers.applyInputAttributes(
            select,
            field,
            lang,
            wrapper
          );

          const parent = Object.assign(document.createElement("div"), {
            className: "relative w-full",
          });

          const icon = Object.assign(document.createElement("span"), {
            className:
              "material-symbols-outlined absolute pointer-events-none ltr:left-auto ltr:right-4 rtl:left-4 rtl:right-auto bottom-[18px] w-[14px] h-[14px] text-[#B0B0B0]",
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
        },
        renderInputChoice(field, lang, id, wrapper, label, form) {
          const container = document.createElement("div");
          container.className = "flex flex-col gap-2 w-full";

          if (field.validationConfig?.required) {
            container.required = true;
          }

          appFormBuilder.helpers.applyPlaceholderNTooltip(label, field, lang);

          field.items?.forEach((item) => {
            const labelText = item.label?.[lang] || "";
            const itemId = item.key || "";

            if (field.type === "checkBoxes") {
              container.appendChild(
                appFormBuilder.helpers.createToggle(
                  itemId,
                  labelText,
                  id,
                  field
                )
              );
            } else {
              container.appendChild(
                appFormBuilder.helpers.createRadioOrCheckbox(
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

          appFormBuilder.helpers.appendItems(container, label, wrapper, form);
        },
        renderInputConsent(field, lang, id, wrapper, labelExt, form) {
          const label = document.createElement("label");
          label.className = "flex items-start gap-2 normal-case";
          label.htmlFor = lang + "-" + id || "";

          const input = appFormBuilder.helpers.createInput({
            id,
            type: "checkbox",
            lang,
            className:
              "border border-[#C8C8C8] rounded px-3 py-2 max-md:text-sm",
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
        },
        renderButtonSubmit(
          field,
          lang,
          id,
          wrapper,
          label,
          form,
          buttonsLength
        ) {
          const isLinkAble =
            field.redirectionURL || field.workFlow || field.api;
          const button = document.createElement(
            field.redirectionURL ? "a" : "button"
          );
          appFormBuilder.helpers.applyPlaceholderNTooltip(button, field, lang);
          if (isLinkAble) {
            button.href = field.redirectionURL || "#";
            button.target = "_blank";
          } else {
            button.type = "submit";
          }
          button.className =
            "inline-flex items-center gap-1.5 relative text-white px-4 py-2 rounded font-medium text-sm no-underline font-green submitBtn bg-green hover:bg-lightGreen cursor-pointer";
          button.textContent = field.submitButton?.[lang] || "Submit";
          appFormBuilder.actions.addWrapperForButtons(
            field.type,
            button,
            buttonsLength,
            form,
            wrapper
          );
        },
        renderButtonCancel(
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
          appFormBuilder.helpers.applyPlaceholderNTooltip(button, field, lang);
          appFormBuilder.actions.addWrapperForButtons(
            field.type,
            button,
            buttonsLength,
            form,
            wrapper
          );
        },
        renderInputFile(field, lang, id, wrapper, label, form) {
          // Error textarea
          appFormBuilder.helpers.applyInputAttributes(
            textArea,
            field,
            lang,
            wrapper
          );
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

          const filesListContainer = rootElement.querySelector(
            "#filesList > #files-names"
          );
          if (filesListContainer) {
            filesListContainer.innerHTML = ""; // Clear previous files
          }
          appFormBuilder.helpers.attachFileUploadHandler();
        },
        renderSectionHeading(field, lang, id, wrapper, label, form) {
          const heading = document.createElement(field?.heading?.tag || "h2");
          heading.textContent = field?.heading?.[lang] || "";
          wrapper.appendChild(heading);
          form.appendChild(wrapper);
        },
        renderInputDate(field, lang, id, wrapper, label, form) {
          const input = appFormBuilder.helpers.createInput({
            id,
            type: "date",
            lang,
            className:
              "border border-[#C8C8C8] rounded px-3 py-2 w-full max-md:text-sm",
            required: field.validationConfig?.required,
          });

          appFormBuilder.helpers.applyPlaceholderNTooltip(input, field, lang);
          appFormBuilder.helpers.applyValidationMsg(
            input,
            field,
            lang,
            wrapper
          );
          appFormBuilder.helpers.appendItems(input, label, wrapper, form);
        },
        createActionButton(
          icon,
          btnClass,
          baseStyles,
          fieldId,
          extraClasses = ""
        ) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `${btnClass} ${baseStyles} ${extraClasses}`;
          button.innerHTML = `<i class=\"material-symbols-outlined pointer-events-none text-sm\">${icon}</i>`;
          return button;
        },
        wrapButton(wrapperClass, button) {
          const div = document.createElement("div");
          div.className = wrapperClass;
          div.appendChild(button);
          return div;
        },
        reorderFormFields(fields, newOrder) {
          const fieldsMap = Object.fromEntries(fields.map((f) => [f.id, f]));
          return newOrder.map((id) => fieldsMap[id]);
        },
        showNoFieldsMessage() {
          const hasFields = forms[formIndex].fields.length > 0;
          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.noFieldsEl,
            !hasFields
          );
          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.clearFormButton,
            hasFields
          );
          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.editButtonsSet,
            hasFields
          );
          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.languageSelect,
            hasFields
          );
          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.editModeBtn,
            hasFields
          );
        },
        createEnhancedFileUploadHandler(inputId) {
          const dt = new DataTransfer(); // private to this handler
          const input = rootElement.querySelector("#" + inputId);
          const filesListContainer = rootElement.querySelector(
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
        },
      },

      actions: {
        resetDropDownState: () => {
          appFormBuilder.element.fieldTypeDropdown.selectedIndex = 0;
        },

        showFieldBox(selectedValue) {
          // Hide all field boxes
          appFormBuilder.element.fieldBox.forEach((el) => {
            el.classList.add("hidden");
          });

          // Map field types to element IDs
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
            rootElement
              .querySelector(`#${map[selectedValue]}`)
              ?.classList.remove("hidden");
          }
        },

        removeRequired(inputs) {
          inputs.forEach((input) => input.removeAttribute("required"));
        },
        setupTableSections() {
          appFormBuilder.element.tableSections.forEach((section) => {
            const tbody = section.querySelector(".requestsTable");
            const addBtn = section.querySelector(".addRowBtn");
            const inputKey = section.querySelector(".inputKey");
            const inputEn = section.querySelector(".inputValueEn");
            const inputAr = section.querySelector(".inputValueAr");
            const inputs = [inputKey, inputEn, inputAr];

            addBtn.addEventListener("click", () => {
              appFormBuilder.helpers.createTableRow(
                inputKey,
                inputEn,
                inputAr,
                tbody
              );
              appFormBuilder.actions.removeRequired(inputs);
            });

            [inputKey, inputEn, inputAr].forEach((input) => {
              input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  appFormBuilder.helpers.createTableRow(
                    inputKey,
                    inputEn,
                    inputAr,
                    tbody
                  );
                  appFormBuilder.actions.removeRequired(inputs);
                }
              });
            });

            if (tbody) {
              tbody
                .querySelectorAll("tr")
                .forEach(appFormBuilder.actions.bindRowEventListeners);
            }
          });
        },
        bindRowEventListeners(row) {
          const editBtn = row.querySelector(".editBtn");
          const deleteBtn = row.querySelector(".deleteBtn");

          editBtn?.addEventListener("click", () => {
            if (editBtn.innerText.toLowerCase().includes("edit")) {
              appFormBuilder.actions.handleEnableInlineEdit(row, editBtn);
            } else {
              appFormBuilder.actions.handleSaveInlineEdit(row, editBtn);
            }
          });

          deleteBtn?.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this row?")) {
              row.remove();
            }
          });
        },
        handleEnableInlineEdit(row, editBtn) {
          const cells = row.querySelectorAll("td");
          for (let i = 0; i < 3; i++) {
            const text = cells[i].innerText;
            cells[
              i
            ].innerHTML = `<input type="text" value="${text}" class="border px-2 py-1 w-full">`;
          }

          editBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-green">save</span>`;
          appFormBuilder.helpers.insertCancelButton(row);
        },
        handleSaveInlineEdit(row, editBtn) {
          const cells = row.querySelectorAll("td");
          for (let i = 0; i < 3; i++) {
            const input = cells[i].querySelector("input");
            cells[i].innerHTML = input.value.trim();
          }

          editBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-green">edit</span>`;
          appFormBuilder.helpers.deleteCancelButton(row);
        },
        bindTableItemsFromJSON(field, table, type) {
          const propName = type === "dropDown" ? "value" : "label";
          const tbody = table.querySelector(".requestsTable");
          field?.items.forEach((item) => {
            appFormBuilder.helpers.createTableRow(
              item.key,
              item[propName].en,
              item[propName].ar,
              tbody
            );
          });
        },
        updateAndDeleteHandler(wrapper, field) {
          const fieldId = field.id;

          const fieldActionButtons = document.createElement("div");
          fieldActionButtons.className = `field-action-buttons flex gap-1 w-full mt-4 ${
            appFormBuilder.state.isEditModeEnabled ? "" : "hidden"
          }`;

          const btnStyles =
            "inline-flex items-center gap-1.5 relative text-white px-2 py-1 " +
            "rounded font-medium text-xs no-underline font-green w-full justify-center " +
            "bg-green hover:bg-lightGreen";

          // Create buttons
          const moveBtn = appFormBuilder.helpers.createActionButton(
            "drag_pan",
            "move-btn-field",
            btnStyles,
            fieldId,
            "!cursor-move"
          );
          const editBtn = appFormBuilder.helpers.createActionButton(
            "edit",
            "edit-btn-field",
            btnStyles,
            fieldId,
            "cursor-pointer"
          );
          const deleteBtn = appFormBuilder.helpers.createActionButton(
            "delete",
            "delete-btn-field",
            btnStyles,
            fieldId,
            "cursor-pointer"
          );

          // Wrap them
          const moveWrapper = appFormBuilder.helpers.wrapButton(
            "form-move drag-handle",
            moveBtn
          );
          const editWrapper = appFormBuilder.helpers.wrapButton(
            "form-edit",
            editBtn
          );
          const deleteWrapper = appFormBuilder.helpers.wrapButton(
            "form-delete",
            deleteBtn
          );

          // Append to wrapper
          if (forms[formIndex].fields.length > 1) {
            fieldActionButtons.appendChild(moveWrapper);
          }
          fieldActionButtons.appendChild(editWrapper);
          fieldActionButtons.appendChild(deleteWrapper);
          wrapper.appendChild(fieldActionButtons);

          // Add event listeners
          const allEndButtons =
            rootElement.querySelectorAll(".form-end-buttons");

          editWrapper.addEventListener("click", () => {
            appFormBuilder.core.bindFieldData(field);
            appFormBuilder.utils.toggleVisibility(
              appFormBuilder.element.formBuilderWrapper,
              !appFormBuilder.state.isFieldEditing
            );
            appFormBuilder.utils.toggleVisibilityAll(
              allEndButtons,
              !appFormBuilder.state.isFieldEditing
            );
            appFormBuilder.actions.adjustHeightOfAccordion();
          });

          deleteWrapper.addEventListener("click", () => {
            appFormBuilder.API.deleteField(
              appFormBuilder.state.formId,
              fieldId
            );
          });
        },
        removeRequiredFromTableInputs(section) {
          if (!section) return;

          const inputs = [
            section.querySelector(".inputKey"),
            section.querySelector(".inputValueEn"),
            section.querySelector(".inputValueAr"),
          ].filter(Boolean);

          appFormBuilder.actions.removeRequired(inputs);
        },
        addWrapperForButtons(fieldType, button, length, form, wrapper) {
          if (fieldType === "submitButton" || fieldType === "cancelButton") {
            if (length > 1) {
              const buttonWrapper =
                rootElement.querySelector(".button-wrapper");
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
        },
        clearFormFields() {
          const inputs = rootElement.querySelectorAll(
            ".field-box input, .field-box select, .field-box textarea"
          );
          inputs.forEach((input) => {
            if (input.type === "checkbox") {
              input.checked = false;
            } else {
              input.value = "";
            }
          });

          const tables = rootElement.querySelectorAll(".requestsTable");
          tables.forEach((table) => {
            table.innerHTML = "";
          });
        },
        addFieldToForm(form, fieldData) {
          form[formIndex].fields.push({
            ...fieldData,
          });
        },
        async addNewForm() {
          const temp = document.createElement("div");

          const nextId =
            appFormBuilder.element.accordionGroup.querySelectorAll(
              ".form-container"
            ).length + 1;

          const res = await fetch("/assets/js/form-markup.html");
          const markup = await res.text();

          temp.dataset.formId = nextId;
          temp.classList = "form-container border overflow-hidden";
          temp.innerHTML = markup.trim();

          const clearButton = temp.querySelector("#clearFormBtn");
          clearButton.dataset.formId = nextId;

          appFormBuilder.element.accordionGroup.appendChild(temp);
          createFormBuilder(temp, createForm(nextId));
        },

        checkAddFormButton() {
          if (forms[0]?.fields.length > 0)
            appFormBuilder.element.addFormBtn.classList.remove("hidden");
        },
        adjustHeightOfAccordion(event) {
          const accordionContent = event
            ? event.target.closest(".accordion-content")
            : rootElement.querySelector(".accordion-content");
          if (accordionContent) {
            accordionContent.style.maxHeight =
              accordionContent.scrollHeight + "px";
          }
        },
      },

      handlers: {
        handleFieldTypeChange(event) {
          const selectedType = event.target.value;
          appFormBuilder.state.fieldType = selectedType;
          appFormBuilder.actions.showFieldBox(selectedType);
          appFormBuilder.actions.adjustHeightOfAccordion(event);
        },
        handleRegexTypeChange(event) {
          const selectedValue = event.target.value;

          // Hide all regex boxes
          appFormBuilder.element.regexValidationBox.forEach((el) => {
            el.classList.add("hidden");
          });

          // Show regexField only when 'custom' is selected
          if (selectedValue === "custom") {
            appFormBuilder.element.regexField?.classList.remove("hidden");
          }
        },
        handleCloseFieldBoxClick(event) {
          const parent = event.target.closest(".field-box");
          if (parent) {
            parent.classList.add("hidden");
          }

          // Assuming these are global helpers, keep them as-is
          appFormBuilder.actions.resetDropDownState();
          appFormBuilder.utils.addNRemoveClassFromAll(
            ".saveBtn",
            "hidden",
            true
          );
          appFormBuilder.utils.addNRemoveClassFromAll(".updateBtn", "hidden");

          appFormBuilder.state.isFieldEditing = false;
          appFormBuilder.actions.clearFormFields();

          appFormBuilder.utils.toggleVisibility(
            appFormBuilder.element.formBuilderWrapper,
            !appFormBuilder.state.isFieldEditing
          );
        },
        handleEditMode() {
          let fieldActionButtons;

          appFormBuilder.element.editModeBtn.addEventListener("click", (e) => {
            fieldActionButtons = rootElement.querySelectorAll(
              ".field-action-buttons"
            );
            appFormBuilder.state.isEditModeEnabled = true;
            appFormBuilder.utils.toggleVisibilityAll(
              fieldActionButtons,
              appFormBuilder.state.isEditModeEnabled
            );
            e.target.classList.add("hidden");
            appFormBuilder.element.cancelEditModeBtn.classList.remove("hidden");
            appFormBuilder.actions.adjustHeightOfAccordion();
          });
          appFormBuilder.element.cancelEditModeBtn.addEventListener(
            "click",
            (e) => {
              appFormBuilder.state.isEditModeEnabled = false;
              appFormBuilder.utils.toggleVisibilityAll(
                fieldActionButtons,
                appFormBuilder.state.isEditModeEnabled
              );
              e.target.classList.add("hidden");
              appFormBuilder.element.editModeBtn.classList.remove("hidden");
            }
          );
        },
        handleAddForm() {
          appFormBuilder.element.addFormBtn.addEventListener("click", () => {
            appFormBuilder.actions.addNewForm();
          });
        },
      },

      core: {
        // JSON Creation from the form's fields
        createJSONFromField(e, editSelectedSection, onSubmit) {
          const currentSection = appFormBuilder.state.isFieldEditing
            ? editSelectedSection
            : e.target.children[0];
          if (!currentSection) return;

          const inputs = currentSection.querySelectorAll(
            ".field-box input, .field-box select, .field-box textarea, .field-box table"
          );

          let field;
          if (appFormBuilder.state.isFieldEditing) {
            if (e.isTrusted === true) {
              e = { ...appFormBuilder.state.editFieldData };
              field = { ...appFormBuilder.state.editFieldData };
            } else {
              appFormBuilder.state.editFieldData = { ...e };
              field = { ...e };
            }
          } else {
            field = {
              id: appFormBuilder.utils.generateId(),
              type: appFormBuilder.state.fieldType,
            };
          }

          if (e.isTrusted === true) {
            field = appFormBuilder.state.isFieldEditing
              ? appFormBuilder.state.editFieldData
              : {
                  id: appFormBuilder.utils.generateId(),
                  type: appFormBuilder.state.fieldType,
                };
          } else {
            field = appFormBuilder.state.isFieldEditing
              ? { ...e }
              : {
                  id: appFormBuilder.utils.generateId(),
                  type: appFormBuilder.state.fieldType,
                };
          }

          appFormBuilder.state.fieldType = !appFormBuilder.state.isFieldEditing
            ? appFormBuilder.state.fieldType
            : appFormBuilder.state.editFieldType;

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
              appFormBuilder.helpers.langSelectorSet(
                field,
                input,
                type,
                onSubmit
              );
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
                appFormBuilder.helpers.setValidationConfig(
                  field,
                  input,
                  "required",
                  input.checked,
                  onSubmit
                );
              } else if (numericTypes.includes(validationType)) {
                appFormBuilder.helpers.setValidationConfig(
                  field,
                  input,
                  validationType,
                  input.checked && !appFormBuilder.state.isFieldEditing
                    ? parseInt(
                        appFormBuilder.utils.getSiblingValue(input, 1) || 0
                      )
                    : null,
                  onSubmit
                );
              } else if (validationType === "validate") {
                appFormBuilder.helpers.handleRegexValidation(
                  field,
                  input,
                  onSubmit
                );
              } else if (validationType === "extensions") {
                const extValue = appFormBuilder.utils.getSiblingValue(input);
                let extSplit = !appFormBuilder.state.isFieldEditing
                  ? extValue?.split(",").map((ext) => ext.trim())
                  : null;
                if (appFormBuilder.state.isFieldEditing && onSubmit)
                  extSplit = extValue.value;
                appFormBuilder.helpers.setValidationConfig(
                  field,
                  input,
                  "extensions",
                  input.checked ? extSplit : null,
                  onSubmit
                );
              }
            }

            // Consent checkbox type
            if (appFormBuilder.state.fieldType === "consentCheckbox") {
              const lang =
                input.dataset.consentText ||
                input.dataset.linkText ||
                input.dataset.linkUrl;

              if (appFormBuilder.state.isFieldEditing) {
                if (onSubmit) {
                  field.consent =
                    appFormBuilder.helpers.buildConsent(currentSection);
                  appFormBuilder.state.editFieldData.consent = {
                    ...field.consent,
                  };
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
                field.consent =
                  appFormBuilder.helpers.buildConsent(currentSection);
              }
            }

            // Radio types (redirect, workflow, api)
            if (input.type === "radio") {
              if (input.dataset.type === "redirect") {
                field.redirectionURL = input.checked
                  ? appFormBuilder.utils.getSiblingValue(input, 2)
                  : null;
              } else if (input.dataset.type === "workflow") {
                field.workFlow = input.checked
                  ? appFormBuilder.utils.getSiblingValue(input, 2)
                  : null;
              } else if (input.dataset.type === "api") {
                appFormBuilder.helpers.handleApiConfig(field, input);
              }
            }

            // Table inputs
            if (input.tagName === "TABLE") {
              if (
                ["radio", "checkBoxes"].includes(appFormBuilder.state.fieldType)
              ) {
                field.radioName = `${
                  appFormBuilder.state.fieldType
                }-${appFormBuilder.utils.generateId()}`;
                field.items = appFormBuilder.helpers.tableItemsHandler(
                  input,
                  "radio",
                  field,
                  onSubmit
                );
              } else if (appFormBuilder.state.fieldType === "dropDown") {
                field.items = appFormBuilder.helpers.tableItemsHandler(
                  input,
                  "dropDown",
                  field,
                  onSubmit
                );
              }
            }
          });

          if (!appFormBuilder.state.isFieldEditing) {
            appFormBuilder.actions.addFieldToForm(forms, field);
            // forms[formIndex].fields.push(field);
            appFormBuilder.core.renderFormPreview();
          }
        },

        // Bind form submission event for every sections
        bindFormLeftPanel() {
          appFormBuilder.element.formLeftPanel.forEach((btn) => {
            btn.addEventListener("submit", function (e) {
              e.preventDefault();
              appFormBuilder.core.createJSONFromField?.(
                e,
                appFormBuilder.state.activeFieldForm,
                true
              );
              appFormBuilder.actions.resetDropDownState?.();
              if (appFormBuilder.state.isFieldEditing) {
                appFormBuilder.API.updateFieldAPIHandler?.(
                  appFormBuilder.state.formId,
                  appFormBuilder.state.editFieldId,
                  appFormBuilder.state.editFieldData
                );
              } else {
                appFormBuilder.actions.clearFormFields();
                appFormBuilder.API.saveFormHandler?.();
              }
              appFormBuilder.utils.addNRemoveClassFromAll?.(
                ".field-box",
                "hidden"
              );
              appFormBuilder.actions.showNoFieldsMessage?.();
              appFormBuilder.actions.adjustHeightOfAccordion(e);
            });
          });
        },

        // Bind existing field data to the form for editing
        bindFieldData(field) {
          appFormBuilder.state.isFieldEditing = true;
          appFormBuilder.state.editFieldId = field.id;
          appFormBuilder.state.editFieldType = field.type;

          if (appFormBuilder.state.editFieldId) {
            appFormBuilder.actions.showFieldBox(
              appFormBuilder.state.editFieldType
            );
            appFormBuilder.state.activeFieldForm = rootElement.querySelector(
              "#" + appFormBuilder.state.editFieldType
            );
            const saveBtn =
              appFormBuilder.state.activeFieldForm.querySelector(".saveBtn");
            const updateBtn =
              appFormBuilder.state.activeFieldForm.querySelector(".updateBtn");
            saveBtn.classList.add("hidden");
            updateBtn.classList.remove("hidden");
            appFormBuilder.core.createJSONFromField(
              field,
              appFormBuilder.state.activeFieldForm
            );
            appFormBuilder.actions.removeRequiredFromTableInputs(
              appFormBuilder.state.activeFieldForm
            );
          }
        },

        // Render Form Preview Function
        renderFormPreview() {
          let lang = appFormBuilder.element.languageSelect.value || "en";
          appFormBuilder.element.formPreview.dir =
            lang === "ar" ? "rtl" : "ltr";

          if (!appFormBuilder.element.formPreview) return;
          appFormBuilder.element.formPreview.innerHTML = "";

          const submitBtnCount = forms[formIndex].fields.filter(
            (item) => item.type === "submitButton"
          ).length;
          const cancelButttonCount = forms[formIndex].fields.filter(
            (item) => item.type === "cancelButton"
          ).length;

          const buttonsLength = submitBtnCount + cancelButttonCount;

          /* console.log(
            "🚀 ~ renderFormPreview ~ forms[formIndex].fields:",
            forms[formIndex].fields
          ); */

          // forms[formIndex].formId
          appFormBuilder.element.clearFormButton.dataset.formId =
            forms[formIndex].formId;

          forms[formIndex].fields.forEach((field) => {
            const wrapper = document.createElement("div");
            wrapper.className = "flex flex-wrap relative";
            wrapper.dataset.id = field.id;

            const fieldId = Math.random().toString(36).slice(2, 11);
            const renderer =
              appFormBuilder.helpers.fieldRenderers[field.type] ||
              appFormBuilder.helpers.renderInputText;
            const label = appFormBuilder.helpers.createLabel(
              field.label?.[lang] || "",
              lang + "-" + fieldId || ""
            );

            const element = renderer(
              field,
              lang,
              fieldId,
              wrapper,
              label,
              appFormBuilder.element.formPreview,
              buttonsLength
            );
            if (element) wrapper.appendChild(element);
            appFormBuilder.actions.updateAndDeleteHandler(wrapper, field);
            appFormBuilder.element.formPreview.appendChild(wrapper);
          });

          appFormBuilder.helpers.showNoFieldsMessage();
          appFormBuilder.core.enableFieldReordering();
        },

        // Render new form
        renderForms() {
          forms.slice(1).forEach((form) => {
            if (!formLoop) {
              appFormBuilder.actions.addNewForm();
            }
          });
          formLoop = true;
        },

        // Initialize moveable fields
        enableFieldReordering() {
          new Sortable(appFormBuilder.element.formPreview, {
            animation: 150,
            handle: ".drag-handle",
            onEnd: function (evt) {
              const newOrder = [
                ...appFormBuilder.element.formPreview.children,
              ].map((child) => child.dataset.id);

              // check if order changed
              const oldOrder = forms[formIndex].fields.map((f) => f.id);
              const isSameOrder =
                oldOrder.length === newOrder.length &&
                oldOrder.every((id, idx) => id === newOrder[idx]);

              if (!isSameOrder) {
                forms[formIndex].fields =
                  appFormBuilder.helpers.reorderFormFields(
                    forms[formIndex].fields,
                    newOrder
                  );
                appFormBuilder.API.saveFormHandler(
                  "Field reordered successfully!"
                );
              }
            },
          });
        },
      },

      API: {
        // Load data from API
        async loadForm() {
          try {
            // const res = await fetch("http://localhost:3500/api/form");
            const res = await fetch(
              `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.FORM}`
            );
            if (!res.ok) throw new Error(`Failed to fetch form: ${res.status}`);

            const data = await res.json();

            if (
              Array.isArray(data) &&
              data.length > 0 &&
              Array.isArray(data?.[formIndex]?.fields)
            ) {
              forms = data;
              appFormBuilder.core.renderForms?.();
              appFormBuilder.actions.checkAddFormButton();
            }

            // call preview and edit handlers if available
            appFormBuilder.core.renderFormPreview?.();
            appFormBuilder.handlers.handleEditMode?.();
            appFormBuilder.handlers.handleAddForm?.();
            appFormBuilder.actions.adjustHeightOfAccordion();
          } catch (err) {
            console.error("Error loading form:", err);
          }
        },
        // Save data in API
        async saveFormHandler(msg) {
          try {
            const res = await fetch(
              `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.FORM}`,
              {
                method: "POST",
                cache: "no-store",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(forms),
              }
            );

            if (!res.ok) {
              throw new Error(`Server responded with status ${res.status}`);
            }

            const data = await res.json();
            appFormBuilder.actions.checkAddFormButton();

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
        },

        // Delete all the data from API
        async deleteAllFields(formId) {
          try {
            const res = await fetch(
              `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.FORM}/${formId}`,
              {
                method: "DELETE",
              }
            );

            const data = await res.json();
            forms = data || [];
            window.location.reload();
          } catch (err) {
            console.error("Error deleting form:", err);
          }
        },

        // Delete individual data from API
        async deleteField(formId, fieldId) {
          try {
            const res = await fetch(
              `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.FORM}/${formId}/field/${fieldId}`,
              { method: "DELETE" }
            );

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message);
            }

            forms[formIndex].fields =
              data.savedForm.find((f) => f.formId === formId)?.fields || [];
            appFormBuilder.core.renderFormPreview?.();

            Toastify({
              text: data.message,
              duration: 3000,
              position: "center",
              stopOnFocus: true,
              style: {
                background: "linear-gradient(to left, #0c7560, #00b09b)",
              },
            }).showToast();
          } catch (err) {
            console.error("Error deleting field:", err);
          }
        },
        // Update individual data in API
        async updateFieldAPIHandler(formId, fieldId, newData) {
          try {
            const res = await fetch(
              `${CONFIG.API_BASE}${CONFIG.ENDPOINTS.FORM}/${formId}/field/${fieldId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData),
              }
            );

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message);
            }

            forms[formIndex].fields =
              data.savedForm.find((f) => f.formId === formId)?.fields || [];
            appFormBuilder.core.renderFormPreview?.();

            appFormBuilder.state.isFieldEditing = false;

            appFormBuilder.actions.addNRemoveClassFromAll?.(
              ".saveBtn",
              "hidden",
              true
            );
            appFormBuilder.actions.addNRemoveClassFromAll?.(
              ".updateBtn",
              "hidden"
            );
            appFormBuilder.actions.clearFormFields?.();
            appFormBuilder.utils.toggleVisibility(
              appFormBuilder.element.formBuilderWrapper,
              true
            );

            Toastify({
              text: data.message,
              duration: 3000,
              position: "center",
              stopOnFocus: true,
              style: {
                background: "linear-gradient(to left, #0c7560, #00b09b)",
              },
            }).showToast();
          } catch (err) {
            console.error("Error updating field:", err.message);
          }
        },
      },

      init() {
        this.core?.bindFormLeftPanel?.();
        this.API?.loadForm?.();
        this.element?.languageSelect?.addEventListener?.(
          "change",
          this.core?.renderFormPreview
        );
        this.element?.closeButtonsFieldBox?.forEach?.((btn) => {
          btn?.addEventListener?.(
            "click",
            this.handlers?.handleCloseFieldBoxClick
          );
        });
        this.element?.fieldTypeDropdown?.addEventListener?.(
          "change",
          this.handlers?.handleFieldTypeChange
        );
        this.element?.regexType?.addEventListener?.(
          "change",
          appFormBuilder?.handlers?.handleRegexTypeChange
        );
        this.actions?.setupTableSections?.();
        this.element?.clearFormButton?.addEventListener?.("click", (e) =>
          this.API?.deleteAllFields(e.target.dataset.formId)
        );
        if (!hasAccordionCall) accordion();
        hasAccordionCall = true;
      },
    };

    appFormBuilder.helpers.fieldRenderers = {
      text: appFormBuilder.helpers.renderInputText,
      textArea: appFormBuilder.helpers.renderInputTextArea,
      dropDown: appFormBuilder.helpers.renderInputDropDown,
      radio: appFormBuilder.helpers.renderInputChoice,
      checkBoxes: appFormBuilder.helpers.renderInputChoice,
      consentCheckbox: appFormBuilder.helpers.renderInputConsent,
      submitButton: appFormBuilder.helpers.renderButtonSubmit,
      cancelButton: appFormBuilder.helpers.renderButtonCancel,
      fileAttachment: appFormBuilder.helpers.renderInputFile,
      heading: appFormBuilder.helpers.renderSectionHeading,
      datePicker: appFormBuilder.helpers.renderInputDate,
    };

    forms.push(formData);

    appFormBuilder.init();
    return appFormBuilder;
  }
  window.createFormBuilder = createFormBuilder;
})();

document.addEventListener("DOMContentLoaded", () => {
  formInit();
});

// Create a new form
function createForm(index) {
  return {
    formId: `form-${index}`,
    // title: { en: titleEn, ar: titleAr },
    // description: { en: "", ar: "" },
    fields: [],
  };
}

function formInit() {
  const formContainers = document.querySelectorAll(".form-container");

  formContainers.forEach((container, index) => {
    const formData = createForm(index + 1);
    container.dataset.formId = index + 1;
    const clearButton = container.querySelector("#clearFormBtn");
    clearButton.dataset.formId = index + 1;

    const builder = createFormBuilder(container, formData);
    // store globally if needed
    window[`formBuilder_${index}`] = builder;
  });
}

function accordion() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".accordion-toggle");
    if (!btn) return; // only run if .accordion-toggle was clicked

    const content = btn.nextElementSibling;
    const icon = btn.querySelector(".accordion-icon");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    btn.setAttribute("aria-expanded", String(!isOpen));
    if (icon) icon.classList.toggle("rotate-180", !isOpen);
    if (content) {
      content.classList.toggle("active-content", !isOpen);
      content.style.maxHeight = !isOpen ? content.scrollHeight + "px" : null;
    }
  });
}
