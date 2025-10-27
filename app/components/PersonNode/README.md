# PersonNode Component Structure

This directory contains the refactored PersonNode component, organized into smaller, reusable sub-components.

## File Structure

```
PersonNode/
├── index.ts                    # Re-exports all components
├── Pager.tsx                   # Navigation controls for paged content
├── ConfirmationModal.tsx       # Reusable confirmation dialog
├── SectionHeader.tsx           # Section title with optional controls
├── ContentCard.tsx             # Styled content container
├── ExperienceSection.tsx       # Experience display and editing
├── EducationSection.tsx        # Education display and editing
├── ContactSection.tsx          # Contact display and editing
├── SkillSection.tsx            # Skills display and editing
└── NotesSection.tsx            # Notes display and editing
```

## Components

### `Pager`
Reusable navigation component with:
- Left/right arrows (conditionally shown at boundaries)
- Current page indicator (X/Y format)
- Optional Add/Delete buttons for editing mode

**Props:**
- `currentPage`, `totalPages`: Page state
- `onPrevious`, `onNext`: Navigation callbacks
- `onAdd`, `onDelete`: Optional CRUD callbacks
- `canDelete`: Disable delete button

### `ConfirmationModal`
Generic confirmation dialog for destructive actions.

**Props:**
- `title`, `message`: Dialog content
- `confirmLabel`, `cancelLabel`: Button text
- `onConfirm`, `onCancel`: Callbacks
- `isDanger`: Style as dangerous action

### `SectionHeader`
Consistent section title with optional controls (e.g., Pager).

**Props:**
- `title`: Section name
- `children`: Optional controls (e.g., Pager component)

### `ContentCard`
Styled card container for section content.

**Props:**
- `children`: Card content

### Section Components
Each section (Experience, Education, Contact, Skill, Notes) handles:
- Display mode (read-only view)
- Edit mode (input fields)
- Paging (where applicable)
- Add/Delete operations (in edit mode)

## Usage

```typescript
import { PersonCircleNode } from "@/app/components/PersonNode";
// Or import individual components:
import { Pager, ConfirmationModal } from "@/app/components/PersonNode";
```

## Benefits

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Pager, ConfirmationModal, etc. can be used elsewhere
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testability**: Smaller components are easier to unit test
5. **Readability**: Main PersonNode.tsx is now ~400 lines vs ~700 lines

## Type Safety

All components use proper TypeScript types from:
- `@/types/person`, `/contact`, `/education`, `/experience`
- `@/app/graph/types` for ReactFlow integration
- `@xyflow/react` for node props
