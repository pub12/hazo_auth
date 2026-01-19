// file_description: hook for managing create firm form state and submission
"use client";
// section: imports
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
// section: hook
export function use_create_firm_form(options = {}) {
    const { default_org_structure = "Headquarters", onSuccess, redirectRoute = "/", apiBasePath = "/api/hazo_auth", logger, } = options;
    const [values, setValues] = useState({
        firm_name: "",
        org_structure: default_org_structure,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    // Refs for DOM value sync (handles browser autocomplete, password managers, etc.)
    const firmNameRef = useRef(null);
    const orgStructureRef = useRef(null);
    // Counter to force re-evaluation of isSubmitDisabled after sync
    const [syncCounter, setSyncCounter] = useState(0);
    // Track Chrome autofill preview state (visual overlay without DOM value)
    const [hasAutofillPreview, setHasAutofillPreview] = useState(false);
    // Sync React state from DOM values (call when autofill detected or on focus)
    const syncFromDOM = useCallback(() => {
        let didSync = false;
        if (firmNameRef.current) {
            const domValue = firmNameRef.current.value;
            if (domValue !== values.firm_name) {
                setValues((prev) => (Object.assign(Object.assign({}, prev), { firm_name: domValue })));
                didSync = true;
            }
        }
        if (orgStructureRef.current) {
            const domValue = orgStructureRef.current.value;
            if (domValue !== values.org_structure) {
                setValues((prev) => (Object.assign(Object.assign({}, prev), { org_structure: domValue })));
                didSync = true;
            }
        }
        // Force re-evaluation even if React state didn't change (DOM might have)
        if (didSync) {
            setSyncCounter((c) => c + 1);
        }
    }, [values.firm_name, values.org_structure]);
    // Effect to detect browser autofill via animationstart event
    // Chrome triggers animationstart on autofilled inputs if CSS animation is defined
    useEffect(() => {
        const handleAutofill = (e) => {
            if (e.animationName === "onAutoFillStart") {
                // Delay to allow browser to populate the value
                setTimeout(syncFromDOM, 50);
                setHasAutofillPreview(false); // Autofill committed
            }
        };
        const firmNameInput = firmNameRef.current;
        const orgStructureInput = orgStructureRef.current;
        firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.addEventListener("animationstart", handleAutofill);
        orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.addEventListener("animationstart", handleAutofill);
        // Also sync on focus (catches form restoration, manual paste, etc.)
        const handleFocus = () => {
            // Small delay to let browser complete any pending value changes
            setTimeout(syncFromDOM, 10);
            setHasAutofillPreview(false); // User interacted, preview committed
        };
        firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.addEventListener("focus", handleFocus);
        orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.addEventListener("focus", handleFocus);
        // Handle change event - fires when autofill commits
        const handleChange = () => {
            setTimeout(syncFromDOM, 10);
            setHasAutofillPreview(false);
        };
        firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.addEventListener("change", handleChange);
        orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.addEventListener("change", handleChange);
        // Handle input event with inputType check for autofill
        const handleInput = (e) => {
            const inputEvent = e;
            if (inputEvent.inputType === "insertReplacementText") {
                // Autofill occurred - sync immediately
                setTimeout(syncFromDOM, 10);
                setHasAutofillPreview(false);
            }
        };
        firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.addEventListener("input", handleInput);
        orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.addEventListener("input", handleInput);
        // Check for :-webkit-autofill preview state periodically
        // This detects Chrome's visual preview before user commits
        const checkAutofillPreview = () => {
            var _a, _b, _c;
            const firmNameHasPreview = (_b = (_a = firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.matches) === null || _a === void 0 ? void 0 : _a.call(firmNameInput, ":-webkit-autofill")) !== null && _b !== void 0 ? _b : false;
            const firmNameValueEmpty = !((_c = firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.value) === null || _c === void 0 ? void 0 : _c.trim());
            // Preview is showing if Chrome applies :-webkit-autofill but DOM value is empty
            if (firmNameHasPreview && firmNameValueEmpty) {
                setHasAutofillPreview(true);
            }
            else if (!firmNameHasPreview || !firmNameValueEmpty) {
                setHasAutofillPreview(false);
            }
        };
        // Check periodically for autofill preview state (Chrome applies it asynchronously)
        const previewCheckInterval = setInterval(checkAutofillPreview, 500);
        checkAutofillPreview(); // Initial check
        // Initial sync after mount (catches pre-populated values)
        setTimeout(syncFromDOM, 100);
        return () => {
            firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.removeEventListener("animationstart", handleAutofill);
            orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.removeEventListener("animationstart", handleAutofill);
            firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.removeEventListener("focus", handleFocus);
            orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.removeEventListener("focus", handleFocus);
            firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.removeEventListener("change", handleChange);
            orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.removeEventListener("change", handleChange);
            firmNameInput === null || firmNameInput === void 0 ? void 0 : firmNameInput.removeEventListener("input", handleInput);
            orgStructureInput === null || orgStructureInput === void 0 ? void 0 : orgStructureInput.removeEventListener("input", handleInput);
            clearInterval(previewCheckInterval);
        };
    }, [syncFromDOM]);
    const handleFieldChange = useCallback((field, value) => {
        setValues((prev) => (Object.assign(Object.assign({}, prev), { [field]: value })));
        // Clear field error when user starts typing
        setErrors((prev) => (Object.assign(Object.assign({}, prev), { [field]: undefined })));
    }, []);
    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!values.firm_name.trim()) {
            newErrors.firm_name = "Firm name is required";
        }
        else if (values.firm_name.length > 100) {
            newErrors.firm_name = "Firm name must be 100 characters or less";
        }
        if (!values.org_structure.trim()) {
            newErrors.org_structure = "Organisation structure is required";
        }
        else if (values.org_structure.length > 50) {
            newErrors.org_structure = "Organisation structure must be 50 characters or less";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values]);
    const handleSubmit = useCallback(async (e) => {
        var _a, _b;
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        setErrors({});
        try {
            const response = await fetch(`${apiBasePath}/create_firm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firm_name: values.firm_name.trim(),
                    org_structure: values.org_structure.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setErrors({ form: data.error || "Failed to create firm" });
                logger === null || logger === void 0 ? void 0 : logger.error("create_firm_form_error", {
                    error: data.error,
                    status: response.status,
                });
                return;
            }
            setIsSuccess(true);
            logger === null || logger === void 0 ? void 0 : logger.info("create_firm_form_success", {
                scope_id: (_a = data.scope) === null || _a === void 0 ? void 0 : _a.id,
            });
            // Call onSuccess callback if provided
            if (onSuccess && ((_b = data.scope) === null || _b === void 0 ? void 0 : _b.id)) {
                onSuccess(data.scope.id);
            }
            // Redirect after a brief delay to show success
            setTimeout(() => {
                window.location.href = redirectRoute;
            }, 1500);
        }
        catch (error) {
            const error_message = error instanceof Error ? error.message : "Unknown error";
            setErrors({ form: "An unexpected error occurred. Please try again." });
            logger === null || logger === void 0 ? void 0 : logger.error("create_firm_form_error", {
                error: error_message,
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSuccess, redirectRoute, apiBasePath, logger]);
    // Calculate disabled state using both React state AND refs as fallback
    // This handles cases where DOM is populated but React state hasn't caught up
    // (browser autocomplete, password managers, form restoration, etc.)
    const isSubmitDisabled = useMemo(() => {
        var _a, _b, _c, _d;
        if (isSubmitting)
            return true;
        // Check React state first
        const firmNameFromState = values.firm_name.trim();
        const orgStructureFromState = values.org_structure.trim();
        // Also check DOM refs as fallback (may have values React doesn't know about)
        const firmNameFromDom = ((_b = (_a = firmNameRef.current) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        const orgStructureFromDom = ((_d = (_c = orgStructureRef.current) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.trim()) || "";
        // Use whichever has a value (prefer state, fall back to DOM)
        const effectiveFirmName = firmNameFromState || firmNameFromDom;
        const effectiveOrgStructure = orgStructureFromState || orgStructureFromDom;
        return !effectiveFirmName || !effectiveOrgStructure;
        // syncCounter included to force re-evaluation after DOM sync
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitting, values.firm_name, values.org_structure, syncCounter]);
    return {
        values,
        errors,
        isSubmitting,
        isSuccess,
        isSubmitDisabled,
        hasAutofillPreview,
        handleFieldChange,
        handleSubmit,
        firmNameRef,
        orgStructureRef,
        syncFromDOM,
    };
}
