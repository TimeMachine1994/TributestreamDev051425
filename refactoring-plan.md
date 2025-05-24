# Website Refactoring Plan: Tailwind CSS Integration

**Overall Goal:** Transition the website's styling entirely to Tailwind CSS, removing `tributestreamtheme.css` and custom CSS in components where possible, while maintaining the current visual design and utilizing existing Svelte components.

**Mermaid Diagram of Phases:**

```mermaid
graph TD
    A[Phase 1: Preparation & Theme Migration] --> B(Phase 2: Component & Page Refactoring);
    B --> C(Phase 3: Testing & Refinement);
    C --> D(Phase 4: Documentation & Finalization);

    subgraph Phase 1: Preparation & Theme Migration
        P1_1[1.1 Correct data-theme attribute in app.html]
        P1_2[1.2 Verify tributestreamtheme.css import in app.css]
        P1_3[1.3 Analyze tributestreamtheme.css for theme values]
        P1_4[1.4 Migrate theme values to tailwind.config.cjs]
        P1_5[1.5 Remove old theme files & references]
    end

    subgraph Phase 2: Component & Page Refactoring
        P2_1[2.1 Prioritize & Refactor Core Layout/Global Components]
        P2_2[2.2 Refactor General UI Components]
        P2_3[2.3 Iteratively Refactor Feature Components]
        P2_4[2.4 Refactor Individual Pages]
        P2_5[2.5 Review & Adjust Tailwind Plugin Usage (Forms, Typography)]
    end

    subgraph Phase 3: Testing & Refinement
        P3_1[3.1 Comprehensive Visual Regression Testing]
        P3_2[3.2 Thorough Functional Testing]
        P3_3[3.3 Code Review & Cleanup]
        P3_4[3.4 Performance Assessment]
    end

    subgraph Phase 4: Documentation & Finalization
        P4_1[4.1 Update/Create Style Guide Documentation]
        P4_2[4.2 Document Tailwind Configuration Choices]
        P4_3[4.3 Establish Developer Guidelines for Tailwind Usage]
    end
```

---

### Phase 1: Preparation & Theme Migration

1.  **Correct `data-theme` Typo & Verify CSS Import:**
    *   **Action:** In `src/app.html`, change `data-theme="tributestreamtheme"` to `data-theme="Tributestream"`. This ensures the existing theme is correctly applied for comparison during the refactor.
    *   **Action:** Open `src/app.css` and confirm the import line for `tributestreamtheme.css`. Note its exact path and how it's imported.

2.  **Analyze `tributestreamtheme.css`:**
    *   **Action:** Systematically go through `tributestreamtheme.css` and list all custom properties. Categorize them:
        *   **Colors:** Primary, secondary, tertiary, success, warning, error, surface colors (including their shades and contrast variants, noting the `oklch` values).
        *   **Typography:** Base font family, size, weight, style, letter spacing. Heading font properties. Anchor font properties.
        *   **Spacing:** Base spacing unit.
        *   **Radii:** Base and container border-radius.
        *   **Borders & Dividers:** Default border and divide widths.
    *   **Goal:** Create a mapping document or spreadsheet of these properties and their values.

3.  **Migrate Theme to `tailwind.config.cjs`:**
    *   **Action:** Edit `tailwind.config.cjs`.
    *   **Action:** Inside the `theme.extend` object, define the new theme based on the analysis from step 1.2:
        *   **Colors:**
            *   Translate the `oklch` color values from `tributestreamtheme.css` into Tailwind's color palette. Tailwind supports arbitrary color values, so you can directly use the `oklch()` strings. For example:
                ```javascript
                // tailwind.config.cjs
                colors: {
                  primary: {
                    50: 'oklch(your-value)', // Or map to the closest named shade
                    100: 'oklch(69.54% 0.08 85.73deg)',
                    // ... up to 950
                  },
                  secondary: { /* ... */ },
                  // ... and so on for all color categories
                }
                ```
            *   Ensure you map all primary, secondary, tertiary, success, warning, error, and surface colors.
        *   **Fonts:**
            *   Define `fontFamily` using the values from `--base-font-family` and `--heading-font-family`.
                ```javascript
                // tailwind.config.cjs
                fontFamily: {
                  sans: ['Seravek', 'Gill Sans Nova', 'Ubuntu', /* ... */ 'sans-serif'],
                  // if heading font is different, add it here e.g., heading: ['YourHeadingFont', ... ]
                },
                ```
        *   **Spacing:**
            *   If `--spacing` defines a base unit, you can extend Tailwind's spacing scale or use arbitrary values in classes. Often, Tailwind's default spacing scale is sufficient.
        *   **Border Radius:**
            *   Extend `borderRadius` with values from `--radius-base` and `--radius-container`.
                ```javascript
                // tailwind.config.cjs
                borderRadius: {
                  'base': '0.375rem', // from --radius-base
                  'container': '0.75rem', // from --radius-container
                }
                ```
    *   **Goal:** `tailwind.config.cjs` now contains all the necessary theme definitions previously in `tributestreamtheme.css`.

4.  **Remove Old Theme System:**
    *   **Action:** In `src/app.css`, remove the line that imports `tributestreamtheme.css`.
    *   **Action:** Delete the `tributestreamtheme.css` file from the project.
    *   **Action:** In `src/app.html`, remove the `data-theme="Tributestream"` attribute from the `<html>` tag. Tailwind's theming is applied directly via its generated CSS and doesn't require this attribute.

### Phase 2: Component & Page Refactoring (Iterative Process)

This is the core of the refactoring. Work component by component, page by page.

1.  **Prioritize Core Layout & Global Components:**
    *   **Files:** `src/routes/+layout.svelte`, `src/lib/components/global/Header.svelte`, `src/lib/components/global/Footer.svelte`, `src/app.html` (for any body-level classes if present).
    *   **Action:** Inspect these files. Replace any classes or styles that were dependent on the old theme with Tailwind utility classes using your new theme (e.g., `bg-primary-500`, `text-sans`, `rounded-base`).
    *   **Action:** Remove any `<style>` tags in these components if all styles can be replaced by Tailwind utilities.

2.  **Refactor General UI Components:**
    *   **Files:** Components in `src/lib/components/ui/` (e.g., `PageBackground.svelte`).
    *   **Action:** Apply the same process as in 2.1.

3.  **Iteratively Refactor Feature Components:**
    *   **Directories:** `src/lib/components/dashboard/`, `src/lib/components/home/`, `src/lib/components/page-templates/`, `src/lib/components/tributes/`.
    *   **Strategy:** Pick one component at a time.
        *   Identify any custom CSS in `<style>` tags or inline styles.
        *   Replace these with Tailwind utility classes.
        *   If the component used global classes from the old theme, update them to use Tailwind.
        *   **Focus:** Ensure the visual output closely matches the original appearance.
        *   **Leverage:** Use your existing pre-built components. The goal is to refactor their styling, not necessarily their structure unless the styling changes demand it.

4.  **Refactor Individual Pages:**
    *   **Directory:** `src/routes/` (all `+page.svelte` files and any specific layout files).
    *   **Action:** For each page, review its structure and styling. Apply Tailwind utility classes, replacing any old theme dependencies or custom page-specific CSS.

5.  **Review & Adjust Tailwind Plugin Usage:**
    *   **Files:** `src/app.css` (for `@plugin` directives), `tailwind.config.cjs` (if plugins are configured there).
    *   **Action:**
        *   **`@tailwindcss/forms`**: Ensure forms are styled correctly. This plugin provides base styles that you might now want to override or complement with your themed Tailwind utilities.
        *   **`@tailwindcss/typography`**: If you use the `prose` classes, configure the typography plugin in `tailwind.config.cjs` to use your new theme's fonts and colors.
            ```javascript
            // tailwind.config.cjs
            // ...
            plugins: [
              require('@tailwindcss/typography'),
              require('@tailwindcss/forms'), // If you prefer to manage plugins here
            ],
            theme: {
              extend: {
                typography: ({ theme }) => ({
                  DEFAULT: {
                    css: {
                      color: theme('colors.gray.700'), // Example: map to your theme's text color
                      a: {
                        color: theme('colors.primary.500'), // Example
                        '&:hover': {
                          color: theme('colors.primary.600'), // Example
                        },
                      },
                      // ... other prose styles
                    },
                  },
                }),
              },
            },
            ```
    *   **Note:** You currently have `@plugin` in `src/app.css`. While this works, it's often recommended to manage plugins within the `plugins` array in `tailwind.config.cjs` for better organization. Consider moving them.

### Phase 3: Testing & Refinement

1.  **Comprehensive Visual Regression Testing:**
    *   **Action:** Manually browse through all pages and components on different screen sizes (desktop, tablet, mobile).
    *   **Action:** Compare against screenshots of the site *before* the refactor (if available) or against a staging/production version.
    *   **Goal:** Identify and fix any visual discrepancies, ensuring the new Tailwind implementation matches the intended design.

2.  **Thorough Functional Testing:**
    *   **Action:** Test all interactive elements: buttons, forms, navigation, dynamic content.
    *   **Goal:** Ensure no functionality was broken during the refactor.

3.  **Code Review & Cleanup:**
    *   **Action:** Review all changed Svelte components and the `tailwind.config.cjs`.
    *   **Action:** Look for consistency in Tailwind class application, opportunities to create new Svelte components for repeated patterns, and remove any commented-out or dead CSS/code.
    *   **Goal:** Ensure clean, maintainable, and efficient Tailwind usage.

4.  **Performance Assessment:**
    *   **Action:** Check CSS bundle size. Tailwind's JIT mode should keep this optimized.
    *   **Action:** Briefly assess page load times and rendering performance.
    *   **Goal:** Ensure the refactor hasn't negatively impacted performance.

### Phase 4: Documentation & Finalization

1.  **Update/Create Style Guide Documentation:**
    *   **Action:** Document the new Tailwind-based theming system. Explain how colors, fonts, spacing, etc., are defined in `tailwind.config.cjs` and how to use them.
    *   **Goal:** Provide a reference for developers.

2.  **Document Tailwind Configuration Choices:**
    *   **Action:** Add comments within `tailwind.config.cjs` explaining any non-obvious choices or custom configurations.
    *   **Goal:** Make the configuration understandable for future modifications.

3.  **Establish Developer Guidelines for Tailwind Usage:**
    *   **Action:** Provide brief guidelines on best practices for using Tailwind in the project (e.g., when to use `@apply` (sparingly), how to handle responsive design, preference for utility classes over custom CSS).
    *   **Goal:** Maintain consistency in future development.
