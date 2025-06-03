package config

import (
	"os"
)

// Config holds all configuration for the application
type Config struct {
	Database *DatabaseConfig
	Server   *ServerConfig
	Env      string
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Host string
	Port string
}

// Load loads all configuration from environment variables
func Load() *Config {
	return &Config{
		Database: LoadDatabaseConfig(),
		Server: &ServerConfig{
			Host: getEnvOrDefault("SERVER_HOST", "0.0.0.0"),
			Port: getEnvOrDefault("SERVER_PORT", "5000"),
		},
		Env: getEnvOrDefault("ENV", "development"),
	}
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}