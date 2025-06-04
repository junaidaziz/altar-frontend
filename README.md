# 🚀 Altar Frontend (Angular)

This is the **Angular frontend** for the Altar.io Full-Stack Exercise.  
It consumes the backend API for real-time grid/code updates and payments, and features modern Angular SPA design.

---

## 🖥️ Live Demo

> After deployment, your app will be available at:  
> **https://junaidaziz.github.io/altar-frontend/**

---

## ⚡ Quick Start (Development)

1. **Install dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2. **Start the Angular development server:**
    ```bash
    npm start
    ```
    - **Default port:** `http://localhost:4200/`

    > **Note:** Make sure your backend API is running at the URL defined by the `API_URL` environment variable (defaults to `http://localhost:3000`).

3. **Build for production:**
    ```bash
    npm run build
    ```
    - The output will be in `frontend/dist/<your-project-name>`

---

## ⚙️ Scripts

- `npm start` &rarr; Runs `ng serve` (development server, hot reload)
- `npm run build` &rarr; Builds app for production (outputs to `/dist/`)
- `npm run lint` &rarr; Lints the codebase

---

## 🌐 Backend API

- The Angular app expects the backend API URL to come from the `API_URL` environment variable.
    - If not provided, it falls back to `http://localhost:3000/`.
- You can override this by setting `API_URL` before running or building the application.

---

## 🏗️ CI/CD

- **CI:** On every push/PR to `frontend/`, the app is built automatically (`.github/workflows/frontend-ci.yml`)
- **CD:** On every push to `main`/`master`, the app is deployed to **GitHub Pages** (`.github/workflows/frontend-cd.yml`)

---

## 🗂️ Project Structure

