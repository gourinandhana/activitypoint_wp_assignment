# Activity Points Management System

A minimal green-themed front-end Activity Points Management System built with React.js and Vite.

## Features

- Student login using UID and password
- Dashboard with total, target and remaining activity points
- Activity list with category, date, claimed/approved points and status
- Add Activity form
- Activity categories
- Student profile and points summary
- JSON files used as the sample data source
- React components, JSX, props, useState, useEffect, React Router, conditional rendering and form handling
- GitHub Pages deployment support

## Demo Accounts

All three sample students use the password `123456`.

| Student | UID |
|---|---|
| Gouri Nandhana | u2408001 |
| Aegis MS | u2408002 |
| Sithaara Jubab Roshan | u2408003 |

## Run locally

Install Node.js, then in the project folder:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

1. Create a new GitHub repository, for example `activity-points-management`.
2. Upload/push all files from this project.
3. Make sure Git and Node.js are installed.
4. Run:

```bash
npm install
npm run deploy
```

5. In GitHub, open **Settings → Pages** and ensure the site is served from the `gh-pages` branch if GitHub asks you to configure it.
6. Your site will normally be available at:

`https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

## Important front-end note

This assignment intentionally has no backend/database. Login credentials and activity data are stored in JSON files and the browser's localStorage is used to retain newly added activities. This is suitable for a front-end assignment/demo, but it is not secure authentication for a real production system.

## Project structure

```text
activity-points-react/
├── src/
│   ├── data/
│   │   ├── students.json
│   │   ├── activities.json
│   │   └── categories.json
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```