# Component Documentation

This directory contains documentation for all reusable components in the Unitopia Hub application.

## Component Documentation Template

Each component or component category should have its own documentation following this structure:

```markdown
# [Component Name]

## Purpose
Brief description of what this component does and its purpose in the application.

## Usage
How to use this component in other parts of the application.

```jsx
// Example usage
<Component prop1="value" prop2={value} />
```

## Props
| Prop Name | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prop1     | string | Yes    | -       | Description |
| prop2     | number | No     | 0       | Description |
| children  | ReactNode | No  | -       | Description |

## State
Description of the component's internal state (if applicable).

## Methods
Public methods exposed by the component (if applicable).

## Events
Events triggered by the component (if applicable).

## Styling
Information about styling options and customization.

## Accessibility
Accessibility considerations and features.

## Dependencies
Other components or libraries this component depends on.

## Examples
Examples of different configurations or use cases.

## Related Components
Links to related components.
```

## Component Categories

- ticketing - Ticket management components
- reports - Reporting components
- ui - Basic UI elements
- unit-tabs - Unit management tabs
- kra - Key Result Area components
- assets - Asset management components
- admin - Administrative components
- kpi - Key Performance Indicator components
- auth - Authentication components
- common - Common reusable components
- charts - Data visualization components
- organization - Organization structure components
- layout - Layout components
- dashboard - Dashboard components
- contacts - Contact management components 