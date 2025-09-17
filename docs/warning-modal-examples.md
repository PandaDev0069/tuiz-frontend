# Warning Modal Usage Examples

The `WarningModal` component provides a universal confirmation dialog for dangerous actions, warnings, and informational confirmations.

## Basic Usage

### Using the Hook (Recommended)

```tsx
import { useConfirmation } from '@/hooks/useConfirmation';

function MyComponent() {
  const { confirmDelete, confirmAction, confirmInfo, WarningModalComponent } = useConfirmation();

  const handleDelete = () => {
    confirmDelete('My Item', async () => {
      // Perform deletion
      await deleteItem();
    });
  };

  const handlePublish = () => {
    confirmAction('公開', 'このクイズ', async () => {
      // Perform publish action
      await publishQuiz();
    });
  };

  const handleInfo = () => {
    confirmInfo('情報確認', 'この操作を実行しますか？', async () => {
      // Perform action
      await performAction();
    });
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handlePublish}>Publish</button>
      <button onClick={handleInfo}>Info Action</button>

      {/* Always include the modal component */}
      <WarningModalComponent />
    </div>
  );
}
```

### Using the Component Directly

```tsx
import { WarningModal } from '@/components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Show Warning</button>

      <WarningModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          // Handle confirmation
          setIsOpen(false);
        }}
        title="確認が必要です"
        description="この操作を実行しますか？"
        confirmText="実行"
        cancelText="キャンセル"
        variant="danger"
      />
    </div>
  );
}
```

## Variants

- `danger` (default): Red theme for destructive actions
- `warning`: Yellow theme for cautionary actions
- `info`: Blue theme for informational confirmations

## Props

| Prop          | Type                              | Default        | Description                           |
| ------------- | --------------------------------- | -------------- | ------------------------------------- |
| `isOpen`      | `boolean`                         | -              | Whether the modal is open             |
| `onClose`     | `() => void`                      | -              | Called when modal is closed           |
| `onConfirm`   | `() => void`                      | -              | Called when confirm button is clicked |
| `title`       | `string`                          | -              | Modal title                           |
| `description` | `string`                          | -              | Modal description text                |
| `confirmText` | `string`                          | `'確認'`       | Confirm button text                   |
| `cancelText`  | `string`                          | `'キャンセル'` | Cancel button text                    |
| `variant`     | `'danger' \| 'warning' \| 'info'` | `'danger'`     | Visual variant                        |
| `isLoading`   | `boolean`                         | `false`        | Show loading state                    |
| `className`   | `string`                          | -              | Additional CSS classes                |

## Specialized Hooks

### useQuizDeletion

For quiz deletion specifically:

```tsx
import { useQuizDeletion } from '@/hooks/useQuizDeletion';

function QuizCard({ quiz }) {
  const { confirmDeleteQuiz, isDeleting, WarningModalComponent } = useQuizDeletion();

  return (
    <div>
      <button onClick={() => confirmDeleteQuiz(quiz)} disabled={isDeleting}>
        Delete Quiz
      </button>
      <WarningModalComponent />
    </div>
  );
}
```

### useConfirmation

For general confirmations:

```tsx
import { useConfirmation } from '@/hooks/useConfirmation';

function MyComponent() {
  const { confirm, confirmDelete, confirmAction, WarningModalComponent } = useConfirmation();

  // Custom confirmation
  const handleCustom = () => {
    confirm({
      title: 'カスタム確認',
      description: 'この操作を実行しますか？',
      confirmText: '実行',
      cancelText: 'キャンセル',
      variant: 'warning',
      onConfirm: async () => {
        // Handle confirmation
      },
    });
  };

  return (
    <div>
      <button onClick={handleCustom}>Custom Action</button>
      <WarningModalComponent />
    </div>
  );
}
```

## Best Practices

1. **Always include the modal component**: Don't forget to render `<WarningModalComponent />` in your JSX
2. **Use appropriate variants**: Use `danger` for destructive actions, `warning` for cautionary actions, `info` for informational confirmations
3. **Provide clear descriptions**: Make sure users understand what will happen
4. **Handle loading states**: Use the `isLoading` prop to show loading states during async operations
5. **Use specialized hooks**: Use `useQuizDeletion` for quiz deletions, `useConfirmation` for general confirmations
