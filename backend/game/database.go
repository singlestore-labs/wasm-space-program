package game

import (
	"backend/config"
	"database/sql"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

type Database struct {
	*sqlx.DB
}

func NewDatabase(config config.DatabaseConfig) (*Database, error) {
	// We use NewConfig here to set default values. Then we override what we need to.
	mysqlConf := mysql.NewConfig()
	mysqlConf.User = config.Username
	mysqlConf.Passwd = config.Password
	mysqlConf.DBName = config.Database
	mysqlConf.Addr = fmt.Sprintf("%s:%d", config.Hosts[0], config.Port)
	mysqlConf.ParseTime = true
	mysqlConf.Timeout = 10 * time.Second
	mysqlConf.InterpolateParams = true
	mysqlConf.AllowNativePasswords = true
	mysqlConf.MultiStatements = false

	mysqlConf.Params = map[string]string{
		"collation_server":    "utf8_general_ci",
		"sql_select_limit":    "18446744073709551615",
		"compile_only":        "false",
		"enable_auto_profile": "false",
		"sql_mode":            "'STRICT_ALL_TABLES'",
	}

	connector, err := mysql.NewConnector(mysqlConf)
	if err != nil {
		return nil, err
	}

	db := sql.OpenDB(connector)

	err = db.Ping()
	if err != nil {
		db.Close()
		return nil, err
	}

	db.SetConnMaxLifetime(time.Hour)
	db.SetMaxIdleConns(20)

	return &Database{DB: sqlx.NewDb(db, "mysql")}, nil
}
