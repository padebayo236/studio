# **App Name**: AgriPro Manager

## Core Features:

- User Authentication & Role Management: Secure user registration, login, and role-based access control (Admin, Manager, Worker) using Firebase Authentication, ensuring appropriate permissions for each role.
- Worker & Field Management: Create and manage detailed worker profiles (name, age, gender, contact, wage rate, photo, status) and define farm fields with crops and sizes. All data will be stored in Firestore.
- Attendance Tracking: Implement a daily clock-in/clock-out system for workers, automatically calculating total hours worked, and providing attendance history and monthly summaries per worker using Firestore for data storage.
- Task Assignment & Status Tracking: Managers can create and assign detailed farm tasks (field, crop, type, description, expected output, deadline) to single or multiple workers, with a system to track task status stored in Firestore.
- Productivity Dashboard & Analytics: Record and calculate worker output metrics (quantity harvested, area covered, output per hour/worker, cost per unit), presented through visual dashboards with charts (bar, line, pie) showing farm-wide and individual productivity trends from Firestore data.
- Payroll Estimation & Reporting: Automated calculation of daily, weekly, and monthly earnings based on total hours and wage rates or task-based payments. Generates downloadable payroll, productivity, and field performance reports (PDF, CSV) from Firestore data.
- AI Task Description Assistant: A generative AI tool that helps farm managers create detailed and effective task descriptions by suggesting relevant details and instructions based on selected crop type and task category.

## Style Guidelines:

- Primary color: #468C4E (a professional, earthy sage green), evoking growth and reliability, chosen to represent the natural agricultural environment.
- Background color: #EDF5EE (a very light, desaturated green-beige), providing a clean and breathable canvas that complements the primary color and fits a 'light scheme' aesthetic.
- Accent color: #DC7E2A (a warm, rustic orange), used to highlight calls to action and important data, adding an energetic and earthy contrast to the primary green.
- Headline and body font: 'Inter' (sans-serif), for its clean, modern, and highly legible appearance, which is ideal for data-dense dashboards and reports.
- Use clear, professional, and slightly stylized icons relevant to farm activities and management tasks to ensure quick visual recognition within the dashboard and navigation.
- Adopt a clean and organized dashboard layout featuring a persistent sidebar navigation, prominent top summary cards for key performance indicators, and filterable data tables, suitable for both desktop and mobile field use. The homepage will provide overview statistics and quick action buttons.
- Implement subtle, functional animations for UI transitions, data loading, and chart updates to enhance user experience without distraction, reinforcing a professional feel.