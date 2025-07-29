#!/bin/bash

# Form Generator Docker Build and Run Script
echo "🚀 Building and starting Form Generator with Docker..."
echo "=================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Error: Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to stop existing containers
cleanup() {
    echo "🧹 Cleaning up existing containers..."
    docker-compose down --remove-orphans
    echo "✅ Cleanup complete"
}

# Function to build and start containers
build_and_start() {
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        echo "✅ Docker images built successfully"
        echo "🚀 Starting containers..."
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            echo "✅ Containers started successfully"
            echo ""
            echo "🌐 Application URLs:"
            echo "  Frontend: http://localhost"
            echo "  Backend API: http://localhost:5001"
            echo "  Health Check: http://localhost/health"
            echo ""
            echo "📊 To view logs:"
            echo "  All services: docker-compose logs -f"
            echo "  Backend only: docker-compose logs -f backend"
            echo "  Frontend only: docker-compose logs -f frontend"
            echo ""
            echo "🛑 To stop:"
            echo "  docker-compose down"
        else
            echo "❌ Failed to start containers"
            exit 1
        fi
    else
        echo "❌ Failed to build Docker images"
        exit 1
    fi
}

# Function to show container status
show_status() {
    echo ""
    echo "📋 Container Status:"
    docker-compose ps
}

# Main execution
main() {
    check_docker
    cleanup
    build_and_start
    show_status
    
    echo ""
    echo "🎉 Form Generator is now running in Docker!"
    echo "   Visit http://localhost to access the application"
}

# Run main function
main 