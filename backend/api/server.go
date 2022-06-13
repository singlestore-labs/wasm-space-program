package api

import (
	"backend/config"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Server struct {
	cfg   config.APIConfig
	dbcfg config.DatabaseConfig
}

func NewServer(cfg config.APIConfig, dbcfg config.DatabaseConfig) *Server {
	return &Server{
		cfg:   cfg,
		dbcfg: dbcfg,
	}
}

func (s *Server) ListenAndServe() error {
	r := gin.Default()
	r.GET("/connect", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"host": s.dbcfg.Hosts[rand.Intn(len(s.dbcfg.Hosts))],
			"port": s.dbcfg.Port,
			"user": s.dbcfg.Username,
			"pass": s.dbcfg.Password,
			"db":   s.dbcfg.Database,
		})
	})
	return r.Run(fmt.Sprintf(":%d", s.cfg.Port))
}
