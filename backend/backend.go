package main

import (
	"backend/api"
	"backend/config"
	"flag"
	"log"
)

func main() {
	flagConfig := flag.String("config", "config.toml", "config file")
	flag.Parse()

	cfg, err := config.LoadConfig(*flagConfig)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	svc := api.NewServer(cfg.API, cfg.WebDataAPI)
	if err := svc.ListenAndServe(); err != nil {
		log.Fatalf("api server crashed: %v", err)
	}
}
