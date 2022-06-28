package game

import (
	"backend/config"
	"log"
	"time"
)

type Worker struct {
	cfg config.WorkerConfig
	db  *Database
}

func NewWorker(cfg config.WorkerConfig, db *Database) *Worker {
	return &Worker{cfg: cfg, db: db}
}

func (w *Worker) RunTurns() {
	for {
		start := time.Now()
		err := w.db.RunTurn()
		if err != nil {
			log.Printf("failed to run turn: %v", err)
			time.Sleep(time.Second)
			continue
		}

		delta := time.Since(start)
		if delta > time.Second {
			log.Printf("WARNING: turn took more than one second (%s)", delta)
		}

		time.Sleep(time.Second)
	}
}

func (w *Worker) RunSpawn() {
	for {
		start := time.Now()
		err := w.db.Spawn(w.cfg.MinShips, w.cfg.MinEnergyNodes)
		if err != nil {
			log.Printf("failed to run spawn: %v", err)
			time.Sleep(time.Second)
			continue
		}

		delta := time.Since(start)
		if delta > time.Second {
			log.Printf("WARNING: spawn took more than one second (%s)", delta)
		}

		time.Sleep(time.Second)
	}
}
