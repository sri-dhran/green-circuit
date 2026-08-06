# Green Circuit

Green Circuit is an end-to-end platform for managing E-Waste pickup requests.

## Deployment

The application is fully containerized using Docker. To deploy the entire stack (Frontend, Backend, and MySQL database), simply run:

```bash
docker-compose up --build -d
```

### Services
- **Frontend (React/Vite)**: `http://localhost:80`
- **Backend (Spring Boot)**: `http://localhost:8080`
- **Database (MySQL)**: `localhost:3306`

*Make sure to configure your Google Maps API key in `frontend/.env` before building the frontend container.*
