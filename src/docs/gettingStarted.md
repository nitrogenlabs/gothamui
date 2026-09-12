# Getting Started with GothamUI

This guide will help you quickly set up a new project with GothamUI and understand its core concepts.

## Installation

Start by installing GothamUI and its peer dependencies:

```bash
# Using npm
npm install @nlabs/gothamui @nlabs/arkhamjs @nlabs/arkhamjs-middleware-logger @nlabs/arkhamjs-storage-browser @nlabs/arkhamjs-utils-react zod react-i18next i18next

# Using yarn
yarn add @nlabs/gothamui @nlabs/arkhamjs @nlabs/arkhamjs-middleware-logger @nlabs/arkhamjs-storage-browser @nlabs/arkhamjs-utils-react zod react-i18next i18next
```

## Creating Your First App

### 1. Set up your entry point

Create an `index.tsx` (or `index.jsx`) file:

```jsx
import { createRoot } from 'react-dom/client';
import { Gotham } from '@nlabs/gothamui';
import { HomeView } from './views/HomeView';

// Define your application configuration
const config = {
  app: {
    name: 'my-app',
    title: 'My First GothamUI App'
  },
  routes: [
    {
      path: '/',
      element: <HomeView />,
      index: true
    }
  ]
};

// Render your application
const root = createRoot(document.getElementById('root'));
root.render(<Gotham config={config} />);
```

### 2. Create a simple view

Create `views/HomeView.tsx`:

```jsx
import { Button } from '@nlabs/gothamui';
import { GothamActions } from '@nlabs/gothamui';

export const HomeView = () => {
  const handleClick = () => {
    GothamActions.notify({
      message: 'Welcome to GothamUI!',
      severity: 'success'
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to GothamUI</h1>
      <p className="mb-4">This is your first GothamUI application.</p>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        Show Notification
      </Button>
    </div>
  );
};
```

## Core Concepts

### Configuration

The `config` object passed to the `<Gotham>` component is the heart of your application setup:

```jsx
const config = {
  // Application metadata
  app: {
    name: 'my-app',
    title: 'My Application',
    titleBarSeparator: '|'
  },

  // Routes configuration
  routes: [
    {
      path: '/',
      element: <HomeView />,
      index: true
    },
    {
      path: '/dashboard',
      element: <DashboardView />,
      authenticate: true // Protected route
    }
  ],

  // Authentication check function
  isAuth: () => Boolean(localStorage.getItem('token')),

  // Storage type for persisted state
  storageType: 'local', // 'local' or 'session'

  // Internationalization
  translations: {
    en: {
      welcome: 'Welcome to GothamUI'
    },
    es: {
      welcome: 'Bienvenido a GothamUI'
    }
  }
};
```

### Routing

GothamUI uses React Router under the hood. Define your routes in the config object:

```jsx
const config = {
  routes: [
    {
      path: '/',
      element: <HomeView />,
      index: true
    },
    {
      path: '/dashboard',
      element: <DashboardView />,
      children: [
        {
          path: 'profile',
          element: <ProfileView />
        },
        {
          path: 'settings',
          element: <SettingsView />
        }
      ]
    }
  ]
};
```

Navigate programmatically using `GothamActions`:

```jsx
import { GothamActions } from '@nlabs/gothamui';

// Navigate to a new route
GothamActions.navGoto('/dashboard');

// Navigate with parameters
GothamActions.navGoto('/user', { id: 123 });

// Replace current route
GothamActions.navReplace('/login');

// Navigate back
GothamActions.navBack();
```

### Forms

GothamUI provides a powerful form system built on React Hook Form and Zod:

```jsx
import { Form, TextField, Button } from '@nlabs/gothamui';
import { z } from 'zod';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// Create form component
const LoginForm = () => {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <Form
      schema={loginSchema}
      onSubmit={handleSubmit}
      defaultValues={{ email: '', password: '' }}
    >
      <TextField
        name="email"
        label="Email"
        placeholder="Enter your email"
      />
      <TextField
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        label="Sign In"
      />
    </Form>
  );
};
```

### State Management

GothamUI uses ArkhamJS for state management, a Flux implementation:

```jsx
import { useFlux } from '@nlabs/arkhamjs-utils-react';

const MyComponent = () => {
  const flux = useFlux();

  // Get state from store
  const title = flux.getState(['app', 'title']);

  // Dispatch an action
  const handleClick = () => {
    flux.dispatch({
      type: 'MY_ACTION',
      data: { value: 'Hello World' }
    });
  };

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Update State</button>
    </div>
  );
};
```

### Notifications

Show notifications using `GothamActions`:

```jsx
import { GothamActions } from '@nlabs/gothamui';

// Show a success notification
GothamActions.notify({
  message: 'Operation completed successfully!',
  severity: 'success'
});

// Show an error notification
GothamActions.notify({
  message: 'An error occurred.',
  severity: 'error'
});

// Show a notification with actions
GothamActions.notify({
  message: 'Do you want to continue?',
  severity: 'info',
  actions: [
    {
      label: 'Yes',
      onClick: () => console.log('Yes clicked')
    },
    {
      label: 'No',
      onClick: () => console.log('No clicked')
    }
  ]
});

// Close the current notification
GothamActions.notifyClose();
```

### Internationalization

GothamUI includes i18next for internationalization. You can import i18n utilities directly from GothamUI:

```jsx
import { useTranslation } from '@nlabs/gothamui';

const MyComponent = () => {
  const { t, i18n } = useTranslation();

  // Change language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
};
```

You can also import other i18n utilities:

```jsx
import { useTranslation, Trans, i18n } from '@nlabs/gothamui';

// useTranslation - Hook for translation
// Trans - Component for complex translations
// i18n - Direct access to i18next instance
```

## Next Steps

Now that you have a basic understanding of GothamUI, explore the following:

1. **Component Library** - Discover all the available UI components
2. **Advanced Routing** - Learn about nested routes and route guards
3. **Custom Stores** - Create your own Flux stores for application state
4. **Middleware** - Add custom middleware for logging, analytics, etc.
5. **Theming** - Customize the look and feel of your application

For more detailed information, check out the [API Reference](./api-reference.md) and [official documentation](http://gothamui.io).
