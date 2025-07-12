# Portfolio Website – Core Version 1.0

A full-stack MERN application consisting of:

* **React 19** front-end (Create React App) – `src/`  
* **Node/Express** API – `backend/`  
* **MongoDB** database  

This README documents how to clone, run, and contribute so other teammates (e.g. the Admin / Sub-Admin auth feature owner) can start immediately.

---

## Directory Structure
```
final-project/
 ├── backend/            # Express API & Mongoose models
 │   └── README.md       # Detailed API reference
 ├── public/             # CRA static assets
 ├── src/                # React components & pages
 ├── .env.example        # Environment variable template (frontend)
 ├── package.json        # Front-end dependencies & scripts
 └── README.md           # ← you are here
```

## Quick Start
### 1. Clone & install
```bash
# clone repo
git clone <repo-url>
cd final-project

# install front-end deps
npm install

# install back-end deps
cd backend
npm install
```

### 2. Configure environment
Copy the example files and fill in secrets **(DO NOT commit real secrets)**.
```bash
cp .env.example .env            # front-end
cd backend && cp .env.example .env  # back-end
```
Back-end `.env` required keys:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/portfolio
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=email@example.com
EMAIL_PASS=yourEmailPassword
ADMIN_EMAIL=admin@example.com
```

### 3. Run in development
Open two terminals:
```bash
# Terminal 1 – front-end (http://localhost:3000)
npm start

# Terminal 2 – back-end (http://localhost:5000)
cd backend
npm run dev
```
CRA proxies API calls to port 5000 via `package.json → proxy`.

---

## Contribution Workflow
1. **Create a branch** off `main`  
   `git checkout -b feature/admin-auth`
2. Commit work regularly.
3. Open a Pull Request for review.
4. Rebase / squash before merge.

### Currently Open Tasks
- [ ] Admin / Sub-Admin authentication & role-based authorization.
- [ ] Admin dashboards (React pages) using the protected API.

See `backend/README.md` for detailed API endpoints already implemented.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
