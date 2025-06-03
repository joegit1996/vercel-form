package config

import (
	"fmt"
	"os"
	"strconv"
)

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	URL      string
}

// LoadDatabaseConfig loads database configuration from environment variables
func LoadDatabaseConfig() *DatabaseConfig {
	config := &DatabaseConfig{
		Host:     getEnvOrDefault("PGHOST", "localhost"),
		User:     getEnvOrDefault("PGUSER", "postgres"),
		Password: getEnvOrDefault("PGPASSWORD", ""),
		DBName:   getEnvOrDefault("PGDATABASE", "postgres"),
		URL:      getEnvOrDefault("DATABASE_URL", ""),
	}

	// Parse port with default
	portStr := getEnvOrDefault("PGPORT", "5432")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 5432
	}
	config.Port = port

	return config
}

// GetConnectionString returns the database connection string
func (c *DatabaseConfig) GetConnectionString() string {
	if c.URL != "" {
		return c.URL
	}
	
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		c.Host, c.Port, c.User, c.Password, c.DBName)
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}