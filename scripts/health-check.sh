#!/bin/bash
echo "🔍 Checking Sportora V2 API Health..."
curl -s http://localhost:5000/health | grep '"status":"ok"' && echo -e "\n✅ API is Healthy and Online!" || echo -e "\n❌ API Health Check Failed!"
