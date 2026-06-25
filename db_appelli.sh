#!/bin/bash
SERVER="postgres_appelli"
PW="PWS"
DB="appelli_db"

echo "Stopping old container"
docker kill $SERVER 2>/dev/null
docker rm $SERVER 2>/dev/null

echo "Starting postgres container"
docker run --name $SERVER \
  -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5433:5432 \
  -d postgres

echo "Waiting for postgres"
sleep 3

echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $SERVER psql -U postgres
echo "\l" | docker exec -i $SERVER psql -U postgres
