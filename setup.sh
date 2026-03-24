#!/bin/bash
set -e

echo "======================================"
echo " Kottakkal Arya Vaidya Sala - Setup"
echo "======================================"

# Backend setup
echo ""
echo ">>> Setting up Django backend..."
cd backend
pip install -r requirements.txt
python manage.py makemigrations catalog cart orders auth_app admin_panel
python manage.py migrate
python manage.py shell < seed_data.py
echo "✅ Backend ready!"

echo ""
echo ">>> Starting Django server on port 8000..."
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!
echo "Django PID: $DJANGO_PID"

# Frontend setup
echo ""
echo ">>> Setting up React frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed!"

echo ""
echo ">>> Starting Vite dev server on port 5173..."
npm run dev &
VITE_PID=$!

echo ""
echo "======================================"
echo " 🌿 All done! Open:"
echo "   Store:  http://localhost:5173"
echo "   Admin:  http://localhost:5173/admin"
echo "   API:    http://localhost:8000/api/"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "   Admin login: admin / admin123"
echo "======================================"

wait
