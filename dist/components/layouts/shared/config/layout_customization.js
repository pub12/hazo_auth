// section: helpers
export const resolveFieldDefinitions = (baseDefinitions, overrides) => {
    if (!overrides) {
        return baseDefinitions;
    }
    const merged = Object.assign({}, baseDefinitions);
    Object.entries(overrides).forEach(([fieldId, definitionOverride]) => {
        var _a, _b;
        if (!definitionOverride) {
            return;
        }
        const existing = (_a = merged[fieldId]) !== null && _a !== void 0 ? _a : definitionOverride;
        merged[fieldId] = Object.assign(Object.assign(Object.assign({}, existing), definitionOverride), { id: (_b = existing.id) !== null && _b !== void 0 ? _b : fieldId });
    });
    return merged;
};
export const resolveLabels = (defaults, overrides) => (Object.assign(Object.assign({}, defaults), (overrides !== null && overrides !== void 0 ? overrides : {})));
export const resolveButtonPalette = (defaults, overrides) => (Object.assign(Object.assign({}, defaults), (overrides !== null && overrides !== void 0 ? overrides : {})));
export const resolvePasswordRequirements = (defaults, overrides) => (Object.assign(Object.assign({}, defaults), (overrides !== null && overrides !== void 0 ? overrides : {})));
