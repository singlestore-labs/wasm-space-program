package main

import (
	"backend/api"
	"backend/config"
	"backend/game"
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

	db, err := game.NewDatabase(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	worker := game.NewWorker(cfg.Worker, db)
	go worker.RunTurns()
	go worker.RunSpawn()

	svc := api.NewServer(cfg.API, cfg.WebDataAPI)
	if err := svc.ListenAndServe(); err != nil {
		log.Fatalf("api server crashed: %v", err)
	}
}
