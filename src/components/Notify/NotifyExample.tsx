import {GothamActions} from '../../actions/GothamActions.js';

export const NotifyExample = () => {
  // Basic notification
  const showBasicNotification = () => {
    GothamActions.notify({
      autoHideDuration: 5000,
      message: 'This is a basic notification'
    });
  };

  // Success notification
  const showSuccessNotification = () => {
    GothamActions.notify({
      message: 'Operation completed successfully',
      severity: 'success'
    });
  };

  // Error notification
  const showErrorNotification = () => {
    GothamActions.notify({
      message: 'An error occurred',
      severity: 'error'
    });
  };

  // Warning notification
  const showWarningNotification = () => {
    GothamActions.notify({
      message: 'This is a warning message',
      severity: 'warning'
    });
  };

  // Info notification
  const showInfoNotification = () => {
    GothamActions.notify({
      message: 'This is an informational message',
      severity: 'info'
    });
  };

  // Notification with custom position
  const showTopRightNotification = () => {
    GothamActions.notify({
      anchorOrigin: {
        horizontal: 'right',
        vertical: 'top'
      },
      message: 'This appears in the top right'
    });
  };

  // Notification with actions
  const showActionNotification = () => {
    GothamActions.notify({
      actions: [
        {
          label: 'Undo',
          onClick: (key) => {
            console.log('Undo clicked', key);
            // Perform undo action
          }
        },
        {
          icon: 'close',
          onClick: (key) => {
            console.log('Close clicked', key);
            GothamActions.notifyClose();
          }
        }
      ],
      message: 'Would you like to undo?'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notify Component Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Basic Notifications</h2>
          <div className="space-y-2">
            <button
              onClick={showBasicNotification}
              className="cursor-pointer w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Basic Notification
            </button>
            <button
              onClick={showSuccessNotification}
              className="cursor-pointer w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md"
            >
              Success Notification
            </button>
            <button
              onClick={showErrorNotification}
              className="cursor-pointer w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md"
            >
              Error Notification
            </button>
            <button
              onClick={showWarningNotification}
              className="cursor-pointer w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md"
            >
              Warning Notification
            </button>
            <button
              onClick={showInfoNotification}
              className="cursor-pointer w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md"
            >
              Info Notification
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Advanced Options</h2>
          <div className="space-y-2">
            <button
              onClick={showTopRightNotification}
              className="cursor-pointer w-full px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md"
            >
              Top Right Position
            </button>
            <button
              onClick={showActionNotification}
              className="cursor-pointer w-full px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md"
            >
              With Action Buttons
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Example</h2>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
          {`// Import the GothamActions
import {GothamActions} from '@actions/GothamActions';

// Show a notification
GothamActions.notify({
  message: 'Hello World',
  severity: 'success',
  autoHideDuration: 5000
});

// Close all notifications
GothamActions.notifyClose();`}
        </pre>
      </div>
    </div>
  );
};