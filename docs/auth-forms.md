# Authentication forms

AuthSignInForm and AuthSignUpForm are public through @nlabs/gothamui, @nlabs/gothamui/components and @nlabs/gothamui/form. The full AuthSignInView/AuthSignUpView screens compose these forms and preserve their existing layout, validation and links.

The forms own credential fields, password toggles, consent/remember checkboxes and pending submission through Form. Pass an awaited onSubmit callback; provider calls, session policy, product validation and routing remain in the application.

Omitted schema retains existing validation: valid email/nonempty password for signin; accepted terms, confirmation, matching passwords and an eight-character minimum for signup. Pass a typed custom schema to replace it. Pass schema={null} only when the callback owns validation. This option deliberately bypasses all package schema checks.

Both forms accept className/name, per-field fields overrides, fieldsClassName, optionsContent/optionsClassName, beforeSubmit, submitLabel/pendingLabel, submitClassName/submitVariant and showSubmitLoading. Field overrides allow autoComplete, borderColor, borderType, inputClass, label, labelClass and placeholder. Empty classes replace defaults; names/types/password toggles remain owned by the form. fieldsClassName={null} renders direct fields. optionsContent and beforeSubmit render inside the Form context; footers and branded shells remain outside.

Signin accepts defaultEmail and showRememberEmail (default true; hidden remember has a false value). Signup accepts showPasswordStrength (default true) and termsProps for label/description/containerClass/labelClass/optionClass; acceptTerms identity remains fixed. Values are typed AuthSignInValues/AuthSignUpValues and callbacks retain Form's runtime event/error arguments.

Submit buttons stay disabled during the entire callback. Default loading spinner and labels Sign In/Sign Up remain. pendingLabel changes pending copy; showSubmitLoading={false} retains a text-only indicator. Catch provider errors in the callback and supply error content through beforeSubmit; full views retain their error block outside the form.

For a branded rounded form, set borderType rounded and clear inputClass/labelClass in every fields override; set fieldsClassName null and supply your form gap/class. Opt out of remember/strength only as an explicit product decision. Do not copy fields or implement another pending controller locally.
