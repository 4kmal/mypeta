# Stats Dialog Update for Mobile

## Overview
Replaced tooltips with a clickable dialog for Points, Level, and EXP stats on mobile devices. Tooltips remain functional on desktop devices.

## Changes Made

### 1. Created New Component: `UserStatsDialog.tsx`
- **Location**: `/components/UserStatsDialog.tsx`
- **Purpose**: Reusable dialog component that displays detailed information about Points, Level, and EXP
- **Features**:
  - Fully translated (English/Malay)
  - Shows current stats at the top in a highlighted card
  - Displays detailed explanations for each stat type
  - Responsive design with proper dark mode support
  - Color-coded icons for each stat type (Points: green, Level: amber, EXP: blue)

### 2. Updated `AuthButton.tsx`
- **Added imports**: 
  - `UserStatsDialog` component
  - `useIsMobile` hook
- **Added state**: `showStatsDialog` to control dialog visibility
- **Modified stats display**:
  - On **mobile**: Stats are now clickable buttons that open the UserStatsDialog
  - On **desktop**: Original tooltip behavior is preserved
  - Conditional rendering based on `isMobile` hook
- **Added UserStatsDialog** at the end of the component to handle mobile stats display

### 3. Updated `profile.tsx`
- **Added imports**:
  - `UserStatsDialog` component
  - `useState` from React
- **Added state**: `showStatsDialog` to control dialog visibility
- **Modified Stats Grid**:
  - Wrapped the stats grid in a clickable button
  - Added hover effects (`hover:shadow-md`)
  - Clicking the stats cards opens the UserStatsDialog with detailed information
- **Added UserStatsDialog** before `MobileBottomNav` to display stats information

## Benefits

1. **Mobile UX Improvement**: Tooltips don't work well on mobile touch devices. The dialog provides a much better user experience.
2. **Consistency**: Same dialog component used across both AuthButton profile dialog and Profile page
3. **Accessibility**: Dialog is keyboard accessible and works well with screen readers
4. **Progressive Enhancement**: Desktop users retain the quick tooltip functionality, while mobile users get the full dialog experience
5. **Maintainability**: Single source of truth for stats information (UserStatsDialog component)

## User Flow

### Mobile:
1. User taps on the stats display (in AuthButton profile dialog or Profile page)
2. UserStatsDialog opens showing:
   - Current stats summary at the top
   - Detailed explanations for Points
   - Detailed explanations for Level
   - Detailed explanations for EXP
3. User can close the dialog by tapping outside or the close button

### Desktop:
1. User hovers over individual stat items (in AuthButton profile dialog)
2. Tooltip appears with quick information
3. User can also click on Profile page stats to open the full dialog

## Technical Details

- Uses `useIsMobile` hook for responsive behavior detection
- Fully typed with TypeScript
- Uses existing UI components (Dialog, DialogContent, etc.)
- Translation support via `useTranslation` hook
- Consistent styling with the rest of the application

## Testing Recommendations

1. Test on mobile devices (iOS Safari, Chrome Mobile)
2. Test tooltip functionality on desktop browsers
3. Verify dialog appears correctly in both light and dark modes
4. Test keyboard navigation and accessibility
5. Verify translations work correctly in both English and Malay

