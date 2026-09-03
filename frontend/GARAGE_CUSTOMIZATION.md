# Garage Customization Specification

This document details the "Morphic UI" system, which allows the LuxeFuel interface to dynamically adapt its aesthetic based on the selected vehicle.

## 1. Core Logic
The system transforms the app from a static interface into a personalized digital cockpit. Each vehicle stores its own "Visual Profile" which is injected into the global CSS state upon selection.

### Attributes
- **Callsign:** A tactical display name (e.g., "GHOST-01") that replaces the generic model name in primary headers.
- **Signature Neon:** A hex color code (`uiColor`) used for glows, buttons, and chart lines.

## 2. Technical Implementation

### Backend (Prisma Schema)
```prisma
model Car {
  id        Int      @id @default(autoincrement())
  name      String
  callsign  String?
  uiColor   String?  @default("#A855F7") // Default Luxe Purple
  // ...
}
```

### Frontend Hook (`useGarageTheme.js`)
This hook is used in the `Dashboard` or root `Layout` to apply the car's color.

```javascript
import { useEffect } from 'react';

export const useGarageTheme = (selectedCar) => {
  useEffect(() => {
    const root = document.documentElement;
    if (selectedCar?.uiColor) {
      // Update primary accent
      root.style.setProperty('--neon-violet', selectedCar.uiColor);
      
      // Generate neon glow (40% alpha)
      const glow = `${selectedCar.uiColor}66`;
      root.style.setProperty('--shadow-neon', `0 0 15px ${glow}`);
    } else {
      // Reset to defaults
      root.style.setProperty('--neon-violet', '#A855F7');
      root.style.setProperty('--shadow-neon', '0 0 15px rgba(168, 85, 247, 0.4)');
    }
  }, [selectedCar]);
};
```

## 3. User Experience
1. **Tune:** User opens vehicle settings and selects a color (e.g., #00f2ff Electric Blue).
2. **Commit:** Data is persisted to the backend via `PUT /api/cars/:id`.
3. **Engage:** When selected on the Dashboard, the entire UI (PriceTicker, Gauges, Charts) morphs to the selected color.
