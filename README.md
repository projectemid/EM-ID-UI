# EM-ID: Smart Home Energy Monitoring System

A Next.js web application for monitoring and analyzing home energy consumption through EMI data collection.

## Table of Contents

- [Project Structure](#project-structure)
  - [Root Configuration Files](#root-configuration-files)
  - [Source Code (`/src`)](#source-code-src)
    - [App Pages](#app-pages)
    - [Components](#components)
      - [Tab Components](#tab-components)
      - [UI Components](#ui-components)
    - [Cloud Functions](#cloud-functions)
  - [Documentation](#documentation)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Context](#project-context)
- [License](#license)

## Project Structure

### Root Configuration Files

- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme settings
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules and settings
- `components.json` - Component configuration for shadcn/ui
- `package.json` - Project dependencies and scripts

### Source Code (`/src`)

#### App Pages

- `/app/page.tsx` - Landing page with authentication
- `/app/layout.tsx` - Root layout with global styles
- `/app/dashboard/page.tsx` - Main dashboard after authentication
- `/app/globals.css` - Global CSS styles and Tailwind directives

#### Components

- `/components/auth/auth-page.tsx` - Authentication page with login/signup forms
- `/components/energy-monitor.tsx` - Main dashboard layout and navigation
- `/components/new-device-modal.tsx` - Modal for adding new devices

##### Tab Components

- `/components/tabs/home-tab.tsx` - Home dashboard with device orbs and timeline
- `/components/tabs/devices-tab.tsx` - Device management and details
- `/components/tabs/analytics-tab.tsx` - Energy usage analytics and charts
- `/components/tabs/settings-tab.tsx` - User and system settings
- `/components/tabs/meter-tab.tsx` - Meter readings display

##### UI Components

- `/components/ui/` - Reusable UI components (accordion, card, dialog, table, etc.)
- `/components/graph-helpers/` - Chart and data visualization components

#### Cloud Functions

- `/cloud_functions/prod_add_new_device.py` - AWS Lambda function for device addition
- `/cloud_functions/prod_edit_user_info.py` - AWS Lambda function for user data management

### Documentation

- `/components/context.md` - Detailed project context and architecture documentation

## Key Features

- **Real-time Device Monitoring:** Track energy consumption through EMI data in real-time.
- **Interactive Visualization:** Device state visualization with interactive orbs.
- **Analytics & Cost Tracking:** Comprehensive energy usage analytics and cost tracking.
- **User Management:** User account management with customizable preferences.
- **Dark Mode:** Support for dark mode to enhance user experience.
- **Responsive Design:** Optimized for all screen sizes and devices.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** React Context
- **Charts:** Recharts
- **Authentication:** Custom implementation (AWS ready)
- **Cloud Services:** AWS (DynamoDB, Lambda, API Gateway)

## Getting Started

Follow these steps to set up the project locally:

1. **Install Dependencies:**

    Open your terminal and run:

    ```bash
    npm install
    ```

2. **Run the Development Server:**

    Start the development server with:

    ```bash
    npm run dev
    ```

3. **Access the Application:**

    Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Context

For detailed information about the project architecture, data flow, and features, please refer to the [context documentation](src/components/context.md).


