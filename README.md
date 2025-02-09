# 📌 API Management System

This project provides a **full-stack API management system**, allowing users to **create, test, and monitor API endpoints dynamically**. It consists of:

- **Backend**: A NestJS-based API that dynamically generates and executes SQL queries.
- **Frontend**: A Next.js-based UI for managing APIs and databases.
- **Docker Setup**: A `docker-compose.yml` file to run the backend, frontend, and database services.

---

## 📂 Project Structure

api_management/ 

backend/        # NestJS Backend (API Management)

frontend/       # Next.js Frontend (Dashboard & UI)

docker-compose.yml  # Docker Compose Configuration

README.md       # Project Documentation

---

## 🚀 Features

✅ **Dynamically Create APIs**
- Users can define API endpoints with custom SQL queries.
- Supports `GET` and `POST` methods.
- APIs are stored in a database and exposed via NestJS.

✅ **Test APIs in Real-Time**
- APIs execute the stored SQL queries against a database.
- Results are returned directly to the frontend.

✅ **Track API Usage**
- Each API call increases a **hit counter**, tracking API usage.
- The frontend dashboard displays **total API hits**.

✅ **Manage Databases**
- Users can add database connections (MySQL for now).
- API queries execute against selected databases.

✅ **Modern UI with Next.js**
- User-friendly web interface for managing APIs.
- Displays a list of available APIs with real-time stats.

✅ **Docker-Ready Deployment**
- Run everything using `docker-compose up --build`.
- Configured to work on any machine.

---

## 🔧 Setup & Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/YOUR_USERNAME/api_management.git
cd api_management
```

### 2️⃣ Set Up Environment Variables

Copy the example .env files and configure them:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit the .env files and set database credentials, API ports, etc.

### 3️⃣ Start the Services

```sh
docker-compose up --build
```

🚀 This will start:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000
- MySQL Database on localhost:3306

### 🔌 API Endpoints

| Method |       Endpoint       |      Description      |
|:------:|:--------------------:|:---------------------:|
|  GET   |      /api/list       | List all created APIs |
|  POST  |     /api/create      |   Create a new API    |
|  POST  |      /api/test       |      Test an API      |
|  GET   | /api/{your-endpoint} | Calls a dynamically created API |
|  POST   |      /api/create-database       | Add a database connection |

Example API Creation Request:

```sh
curl -X POST "http://localhost:3001/api/create" \
     -H "Content-Type: application/json" \
     --data '{ "path": "/users", "method": "GET", "sqlQuery": "SELECT * FROM users", "tokenProtected": false, "databaseId": 1 }'
```

### 🖥️ Frontend Dashboard

Visit http://localhost:3000 to access the API Management Dashboard.

### 📊 Features:

- View all registered APIs & databases. 
- Test API endpoints directly from the UI.
- Monitor API hit counts and usage statistics.
- Create new APIs dynamically.

### 🐳 Docker Compose Configuration

```sh
version: '3.8'
services:
backend:
build: ./backend
ports:
- "3001:3001"
depends_on:
- database
environment:
DATABASE_HOST: database

frontend:
build: ./frontend
ports:
- "3000:3000"
depends_on:
- backend

database:
image: mysql:8
environment:
MYSQL_ROOT_PASSWORD: root
MYSQL_DATABASE: mydb
ports:
- "3306:3306"
```

### ⚠️ Troubleshooting

### ❌ Backend Doesn’t Start?

Check logs:

```sh
docker-compose logs backend
```

### ❌ Frontend Fails to Load?

Try:

```sh
docker-compose restart frontend
```

Ensure API_BASE_URL in the frontend .env matches the backend.

### ❌ Database Connection Issues?

Check .env inside backend/:

```sh
DATABASE_HOST=database
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=mydb
```

Use container name (database) instead of localhost inside Docker.

### 👨‍💻 Contributing

1.	Fork the repository
2. Create a new branch: git checkout -b feature-branch
3.	Commit changes: git commit -m "Add new feature"
4.	Push to GitHub: git push origin feature-branch
5.	Open a Pull Request

### 📜 License
This project is open-source under the MIT License.

### ✅ Next Steps

- Add support for more databases (PostgreSQL, MongoDB, etc.).
- Implement user authentication (JWT, OAuth).
- Add API request logging and analytics.