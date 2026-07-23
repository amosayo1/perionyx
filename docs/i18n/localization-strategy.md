# Localization & Arabic RTL Strategy

## Current State

- ✅ `next-intl` v4.13.1 installed
- ✅ `src/i18n/routing.ts` — locales defined (en, ar), default: en
- ✅ `src/i18n/request.ts` — message loading, locale negotiation
- ✅ `src/messages/en.json` — English translations (starter set)
- ✅ `src/messages/ar.json` — Arabic translations (starter set)
- ✅ `next.config.ts` — wrapped with `createNextIntlPlugin`
- ✅ `src/proxy.ts` — locale detection via cookie + Accept-Language header
- ✅ `@next/bundle-analyzer` installed for performance monitoring

## Locale Detection Flow

1. **Cookie** — `NEXT_LOCALE` cookie checked first (set by language switcher)
2. **Accept-Language** — Browser's preferred language parsed and matched against supported locales
3. **Default** — Falls back to `en`

## Arabic RTL Support (Planned)

### Phase 1: Foundation
- [ ] Add `dir="rtl"` to HTML tag when locale is `ar`
- [ ] Audit all CSS for hardcoded left/right values, replace with logical properties
- [ ] Configure Tailwind RTL support via `rtl` variant

### Phase 2: Components
- [ ] Audit all enterprise components for RTL compatibility
- [ ] Update SmartSelect dropdown positioning
- [ ] Update WorkflowCanvas controls (zoom controls should flip)
- [ ] Update ApprovalPreview arrow directions
- [ ] Update step indicators in OnboardingStepper

### Phase 3: Forms
- [ ] Update EnterpriseField labels for RTL alignment
- [ ] Update ValidationSummary for RTL layout
- [ ] Update ConditionEditor operator buttons for RTL

### Phase 4: Dates & Numbers
- [ ] Add Hijri calendar support alongside Gregorian
- [ ] Configure Arabic number formatting (Hindi-Arabic numerals)
- [ ] Update currency formatting for Arabic locale

## Message Management

Messages use flat JSON keys with namespacing:
```json
{
  "nav.dashboard": "لوحة القيادة",
  "forms.validation.required": "{field} مطلوب"
}
```

### Adding a new locale:
1. Add locale to `routing.ts`
2. Create `src/messages/{locale}.json`
3. Add locale detection in `proxy.ts`
4. Test RTL layout if applicable

## Future i18n Integration Points

- [ ] Language switcher in app shell
- [ ] Locale-aware date/number formatting in table components
- [ ] Locale-aware currency formatting in analytics components
- [ ] Translation extraction tooling (i18next-scanner or similar)
