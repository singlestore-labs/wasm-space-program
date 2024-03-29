package config

import (
	"bytes"
	"fmt"
	"log"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/caarlos0/env/v6"
)

type Config struct {
	API        APIConfig        `toml:"api" envPrefix:"API_"`
	Worker     WorkerConfig     `toml:"worker" envPrefix:"WORKER_"`
	Database   DatabaseConfig   `toml:"database" envPrefix:"DATABASE_"`
	WebDataAPI WebDataAPIConfig `toml:"web" envPrefix:"WEB_"`
}

type APIConfig struct {
	Port int `env:"PORT"`
}

type WorkerConfig struct {
	MinShips       int  `env:"MIN_SHIPS"`
	MinEnergyNodes int  `env:"MIN_ENERGY_NODES"`
	DisableSpawn   bool `env:"DISABLE_SPAWN"`
}

type DatabaseConfig struct {
	Host     string `env:"HOST"`
	Port     int    `env:"PORT"`
	Username string `env:"USERNAME"`
	Password string `env:"PASSWORD"`
	Database string `env:"DB" toml:"db"`
}

type WebDataAPIConfig struct {
	Endpoints []string `env:"ENDPOINTS"`
	Username  string   `env:"USERNAME"`
	Password  string   `env:"PASSWORD"`
	Database  string   `env:"DB" toml:"db"`
}

func (c *Config) String() string {
	buf := new(bytes.Buffer)
	enc := toml.NewEncoder(buf)
	err := enc.Encode(c)
	if err != nil {
		log.Fatalf("failed to serialize config to string: %v", err)
	}
	return buf.String()
}

func (c *APIConfig) Validate() error {
	if c.Port == 0 {
		return fmt.Errorf("port is required")
	}
	return nil
}

func (c *DatabaseConfig) Validate() error {
	if len(c.Host) == 0 {
		return fmt.Errorf("no host specified")
	}
	if c.Port == 0 {
		return fmt.Errorf("no port specified")
	}
	if c.Username == "" {
		return fmt.Errorf("no username specified")
	}
	if c.Password == "" {
		return fmt.Errorf("no password specified")
	}
	if c.Database == "" {
		return fmt.Errorf("no database name specified")
	}
	return nil
}

func (c *WebDataAPIConfig) Validate() error {
	if len(c.Endpoints) == 0 {
		return fmt.Errorf("no endpoints specified")
	}
	if c.Username == "" {
		return fmt.Errorf("no username specified")
	}
	if c.Password == "" {
		return fmt.Errorf("no password specified")
	}
	if c.Database == "" {
		return fmt.Errorf("no database name specified")
	}
	return nil
}

func LoadTOMLFiles(out *Config, filename string) error {
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		log.Printf("config file `%s` not found, skipping", filename)
		return nil
	}
	_, err := toml.DecodeFile(filename, out)
	if err != nil {
		return fmt.Errorf("failed to load config file `%s`: %w", filename, err)
	}
	return nil
}

func LoadConfig(filename string) (*Config, error) {
	out := Config{}

	// defaults
	out.API.Port = 3001

	if err := LoadTOMLFiles(&out, filename); err != nil {
		return nil, err
	}
	if err := env.Parse(&out); err != nil {
		return nil, fmt.Errorf("failed to load config from environment: %w", err)
	}

	log.Printf("validating config:\n%s", &out)

	// check required fields
	if err := out.API.Validate(); err != nil {
		return nil, fmt.Errorf("invalid api config: %w", err)
	}
	if err := out.Database.Validate(); err != nil {
		return nil, fmt.Errorf("invalid database config: %w", err)
	}
	if err := out.WebDataAPI.Validate(); err != nil {
		return nil, fmt.Errorf("invalid web data api config: %w", err)
	}

	log.Printf("config is valid.")

	return &out, nil
}
