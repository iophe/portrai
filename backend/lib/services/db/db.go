package db

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	Pool *pgxpool.Pool
}

type DBCfg struct {
	Port    string
	Address string
	Name    string
	User    string
}

var DB Database = Database{}

func (db *Database) Connect(password string, cfg *DBCfg) error {
	uri := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", cfg.User, password, cfg.Address, cfg.Port, cfg.Name)
	slog.Info("attempting connection to the db at", "uri", strings.Replace(uri, password, "*secret*", 1))
	config, err := pgxpool.ParseConfig(uri)
	if err != nil {
		return fmt.Errorf("failed to connect to PostgresDB: %w", err)
	}
	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = 1 * time.Hour
	config.MaxConnIdleTime = 30 * time.Minute
	config.HealthCheckPeriod = 1 * time.Minute

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return fmt.Errorf("failed to ping database: %w", err)
	}

	db.Pool = pool
	slog.Info("Db connection succeeded")
	return nil
}

func StringToUUID(s string) (uuid.UUID, error) {
	var pgUUID uuid.UUID

	// Parse the string into a UUID
	parsedUUID, err := uuid.Parse(s)
	if err != nil {
		return pgUUID, err
	}
	return parsedUUID, nil
}

func UUIDToString(id uuid.UUID) string {
	return id.String()
}

func StringToTimestampz(s string) (pgtype.Timestamptz, error) {
	// Parse the string to time.Time
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}, err
	}

	// Convert to pgtype.Timestamptz
	var ts pgtype.Timestamptz
	ts.Time = t
	ts.Valid = true

	return ts, nil
}

func StringToDate(s string) (pgtype.Date, error) {
	var date pgtype.Date

	if s == "" {
		date.Valid = false
		return date, nil
	}

	// Parse the YYYY-MM-DD string to time.Time
	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return date, fmt.Errorf("failed to parse date: %w", err)
	}

	date.Valid = true
	date.Time = t

	return date, nil
}
func Int64ToTimestamptz(unix_timestamp int64) pgtype.Timestamptz {
	if unix_timestamp == 0 {
		return pgtype.Timestamptz{}
	}

	return pgtype.Timestamptz{
		Time:  time.Unix(unix_timestamp, 0),
		Valid: true,
	}
}

func IntervalToDuration(interval pgtype.Interval) time.Duration {
	days := interval.Days + (interval.Months * 30)
	duration := time.Duration(days)*24*time.Hour +
		time.Duration(interval.Microseconds)*time.Microsecond
	return duration
}

func DurationToInterval(d time.Duration) pgtype.Interval {
	microseconds := d.Microseconds()

	days := microseconds / (24 * 60 * 60 * 1000000)
	microseconds %= (24 * 60 * 60 * 1000000)

	interval := pgtype.Interval{
		Microseconds: microseconds,
		Days:         int32(days),
		Months:       0, // time.Duration doesn't have a concept of months
		Valid:        true,
	}

	return interval
}
