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
		Host:     getEnvOrDefault("DB_HOST", "localhost"),
		User:     getEnvOrDefault("DB_USER", "root"),
		Password: getEnvOrDefault("DB_PASSWORD", ""),
		DBName:   getEnvOrDefault("DB_NAME", "test"),
		URL:      getEnvOrDefault("DATABASE_URL", ""),
	}

	// Parse port with default
	portStr := getEnvOrDefault("DB_PORT", "3306")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 3306
	}
	config.Port = port

	return config
}

// GetConnectionString returns the MySQL connection string
func (c *DatabaseConfig) GetConnectionString() string {
	if c.URL != "" {
		return c.URL
	}
	// MySQL DSN: user:password@tcp(host:port)/dbname?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci",
		c.User, c.Password, c.Host, c.Port, c.DBName)
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}