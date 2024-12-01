# Project Context: Smart Home Energy Monitoring System

## Table of Contents
- [Overview](#overview)
- [Product Functionality](#product-functionality)
- [Data Collection and Structure](#data-collection-and-structure)
- [System Architecture](#system-architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Machine Learning Integration](#machine-learning-integration)
- [Current Features](#current-features)
  - [User Account Management](#user-account-management)
  - [Home Tab](#home-tab)
    - [Event Timeline Panel](#event-timeline-panel)
    - [Device Orbs Panel](#device-orbs-panel)
  - [Devices Tab](#devices-tab)
  - [Analytics Tab](#analytics-tab)
  - [Settings Tab](#settings-tab)
- [Technology Stack](#technology-stack)
- [Future Considerations](#future-considerations)
  - [Data Design for kWh Calculations](#data-design-for-kwh-calculations)
  - [Database Structure Optimization](#database-structure-optimization)
- [Extremely Relevant Information](#extremely-relevant-information)

## Overview

The **Smart Home Energy Monitoring System** is a device and web-based solution designed to monitor and analyze the energy consumption of various household devices. By connecting a specialized device to a home outlet, the system captures Electromagnetic Interference (EMI) data to determine which devices are active and their energy usage patterns. This data is then visualized through an intuitive user portal, providing actionable insights into energy consumption, cost savings, and device usage behaviors.

## Product Functionality

- **Device Connection**: The core hardware connects to a home outlet and continuously monitors EMI data.
- **Device Detection**: Identifies which devices from a predefined list are currently on or off.
- **Data Attributes**: For each detected device, the system records:
  - **Wattage (Active)**: Power consumption when the device is in use.
  - **Wattage (Standby)**: Power consumption when the device is on standby.
  - **Brand and Model**: Manufacturer details for each device.
  - **Usage Patterns**: Historical data to estimate energy usage over time.
- **User Portal**: A web interface that displays:
  - **Graphs**: Visual representations of energy consumption, cost, and usage frequency.
  - **Statistics**: Aggregated data on total energy used, costs, and device activity.

## Data Collection and Structure

The system collects EMI data every 2 seconds using a machine learning model that outputs:
- **Device Label**: Identifier for the device.
- **Probability of Being On**: Confidence score (typically >0.9 accuracy).

### Data Attributes
- **Device ID**: Unique identifier for each device.
- **Wattage On**: Power consumption when the device is active.
- **Wattage Standby**: Power consumption when the device is idle.
- **Brand**: Manufacturer of the device.
- **Model**: Specific model identifier.
- **State**: Current state (`on` or `off`).
- **Classification**: Device type for appropriate iconography.

## System Architecture

### Frontend

- **Frameworks & Libraries**:
  - **React**: For building user interfaces.
  - **Tailwind CSS**: For styling and responsive design.
  - **TypeScript**: For type-safe JavaScript development.
  - **Next.js**: For server-side rendering and routing.
  - **UI Collaboration**: Designed in collaboration with V0.

- **Website Structure**:
  - **User Authentication**: Account creation, device linking, and login.
  - **Tabs**: Home, Devices, Analytics, Settings.

### Backend

- **Current Implementations**:
  - **DynamoDB**: Stores device data with columns: `deviceId`, `wattage`, `label`, `state`, `classification`.
  - **Lambda Functions**: Handles API requests and backend logic.
  - **API Gateway**: Manages API endpoints.
  - **Amplify**: Facilitates frontend-backend integration.
  - **IAM**: Manages access and permissions.

- **Existing Backend Functionality**:
  - **Device Orbs**: Displays active devices with real-time updates from DynamoDB.
  - **Toggle Web App**: Separate application to change device states, reflecting on the main website.

### Machine Learning Integration

- **Model Output**: Every 2 seconds, the ML model provides:
  - **Device Label**
  - **Probability of Being On**

- **Accuracy**: Typically exceeds 90%.

## Current Features

### User Account Management

- **Account Creation**: Users can create accounts and link their monitoring device.
- **Login**: Secure authentication for accessing the portal.
- **Device Setup**: Users can set up and label their devices.

### Home Tab

#### Event Timeline Panel

- **Location**: Left side of the Home tab.
- **Functionality**: Displays key events in a vertical timeline for selected devices.
- **Example Events**:
  - 12:15 PM: iPad started charging
  - 12:18 PM: Air fryer turned on
  - 12:28 PM: Air fryer turned off
  - 1:00 PM: Television in room X turned on
  - 1:30 PM: iPad stopped charging
  - 3:00 PM: Television in room X turned off

#### Device Orbs Panel

- **Main Screen**: Shows glowing orbs representing active devices.
- **Orb Details**:
  - **Label**: Device name.
  - **Wattage**: Current power consumption.
  - **Hover Info**: Displays detailed device information.
- **Visual Indicators**:
  - **Size**: Relative to the device's wattage.
  - **Real-Time Updates**: Orbs appear/disappear based on device state from DynamoDB.

### Devices Tab

- **Device List**: Left column displays all registered devices as clickable buttons.
- **Sorting Order**:
  1. Devices currently on (with a green dot).
  2. Sorted by wattage number.
- **Device Details**: Clicking a device shows relevant statistics, graphs, and recorded data.
- **Settings Button**: Opens a modal to:
  - Edit device information (brand, model, wattage range).
  - Configure timeline appearance.
  - Set up alerts (e.g., device on during specific times or exceeding usage duration).

### Analytics Tab

- **Aggregate Data**: Displays data encompassing all devices.
- **Interactive Graphs**: Visualize overall energy consumption and trends.
- **Statistics**: Provide insights into total energy used, costs, and usage patterns across all devices.

### Settings Tab

- **User Preferences**: Standard settings for account management and portal customization.

## Technology Stack

- **Frontend**:
  - React
  - Tailwind CSS
  - TypeScript
  - Next.js

- **Backend**:
  - AWS DynamoDB
  - AWS Lambda
  - AWS API Gateway
  - AWS Amplify
  - AWS IAM

- **Machine Learning**:
  - Custom ML model for device state detection.

## Future Considerations

### Data Design for kWh Calculations

To enable accurate kWh reporting based on historical data and wattage ranges:
- **Data Requirements**:
  - Historical wattage data for active and standby states.
  - Time stamps for state changes.
  - Formulas to estimate energy usage from wattage over time.

- **Design Approach**:
  - Create data schemas that store wattage ranges and historical usage patterns.
  - Develop algorithms to calculate kWh based on continuous monitoring data.

### Database Structure Optimization

Efficient data storage is crucial for scalability and performance:
- **Current Structure**:
  - DynamoDB table `devicedemo` with columns: `deviceId`, `wattage`, `label`, `state`, `classification`.

- **Recommendations**:
  - **Normalization**: Separate tables for devices, users, and usage logs.
  - **Indexing**: Implement secondary indexes for quick queries on device state and classification.
  - **Time-Series Data**: Use optimized storage for historical usage data, possibly leveraging DynamoDB's time-to-live (TTL) features or integrating with AWS Timestream for better time-series data handling.

## Extremely Relevant Information

- **Real-Time Data Processing**:
  - The ML model outputs device labels and their probabilities every 2 seconds with over 90% accuracy.
  - Efficient storage strategies are needed to handle this high-frequency data influx.

- **AWS-Centric Infrastructure**:
  - The entire system leverages AWS services extensively, including DynamoDB, Lambda, API Gateway, Amplify, and IAM.
  - Future backend developments should continue to utilize AWS for consistency and scalability.

- **Current Backend Mechanics**:
  - The `devicedemo` DynamoDB table is central to device state management.
  - The frontend polls an API to fetch devices with `state` set to `on`, ensuring real-time responsiveness.
  - A separate web application exists to toggle device states, directly affecting the main website's UI.

- **Scalability and Future Features**:
  - The existing frontend architecture is robust, built with React and Next.js, allowing for seamless integration of new features.
  - Emphasis on designing a scalable database structure to support advanced analytics and real-time data visualization.

---

This context file provides a comprehensive overview of the Smart Home Energy Monitoring System, detailing its current state, technological foundation, and future directions. It is intended to assist other language models or team members in understanding the project's scope, functionalities, and technical requirements.

