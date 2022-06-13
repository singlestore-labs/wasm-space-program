package api

import (
	"backend/config"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	cfg     config.APIConfig
	dataapi config.WebDataAPIConfig
}

func NewServer(cfg config.APIConfig, dataapi config.WebDataAPIConfig) *Server {
	return &Server{
		cfg:     cfg,
		dataapi: dataapi,
	}
}

func (s *Server) ListenAndServe() error {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"*"},
		MaxAge:           12 * time.Hour,
		AllowCredentials: true,
	}))

	r.GET("/connect", func(c *gin.Context) {
		// MUST match ConnectConfig in web/src/data/backend.ts
		c.JSON(http.StatusOK, gin.H{
			"endpoints": s.dataapi.Endpoints,
			"username":  s.dataapi.Username,
			"password":  s.dataapi.Password,
			"database":  s.dataapi.Database,
		})
	})

	return r.Run(fmt.Sprintf(":%d", s.cfg.Port))
}
