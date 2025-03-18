package monitor

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// MONITOR is the global monitor instance accessible throughout the application
var MONITOR *Monitor

// Monitor contains all the Prometheus metrics
type Monitor struct {
	request_counter   *prometheus.CounterVec
	request_duration  *prometheus.HistogramVec
	request_in_flight *prometheus.GaugeVec
	error_counter     *prometheus.CounterVec
	system_memory     prometheus.Gauge
	goroutines_count  prometheus.Gauge
}

// InitMonitor initializes the global monitor instance
func InitMonitor() error {
	MONITOR = &Monitor{
		request_counter: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_total",
				Help: "Total number of HTTP requests by method and path",
			},
			[]string{"method", "path", "status"},
		),
		request_duration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_duration_seconds",
				Help:    "HTTP request duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "path"},
		),
		request_in_flight: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "http_requests_in_flight",
				Help: "Current number of HTTP requests being processed",
			},
			[]string{"method"},
		),
		error_counter: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "application_errors_total",
				Help: "Total number of application errors by type",
			},
			[]string{"error_type"},
		),
		system_memory: prometheus.NewGauge(
			prometheus.GaugeOpts{
				Name: "system_memory_bytes",
				Help: "Current system memory usage in bytes",
			},
		),
		goroutines_count: prometheus.NewGauge(
			prometheus.GaugeOpts{
				Name: "goroutines_total",
				Help: "Current number of goroutines",
			},
		),
	}

	// Register all metrics with Prometheus
	err := prometheus.Register(MONITOR.request_counter)
	if err != nil {
		return fmt.Errorf("prometheus could not register request_counter")
	}
	err = prometheus.Register(MONITOR.request_duration)
	if err != nil {
		return fmt.Errorf("prometheus could not register request_duration")
	}
	err = prometheus.Register(MONITOR.request_in_flight)
	if err != nil {
		return fmt.Errorf("prometheus could not register request_in_flight")
	}
	err = prometheus.Register(MONITOR.error_counter)
	if err != nil {
		return fmt.Errorf("prometheus could not register error_counter")
	}
	err = prometheus.Register(MONITOR.system_memory)
	if err != nil {
		return fmt.Errorf("prometheus could not register system_memory")
	}
	err = prometheus.Register(MONITOR.goroutines_count)
	if err != nil {
		return fmt.Errorf("prometheus could not register goroutines_count")
	}
	return nil
}

// MonitorMiddleware creates a Fiber middleware for monitoring HTTP requests
func MonitorMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start_time := time.Now()
		method := c.Method()
		path := c.Path()

		// Increment in-flight requests
		MONITOR.request_in_flight.WithLabelValues(method).Inc()
		defer MONITOR.request_in_flight.WithLabelValues(method).Dec()

		// Process request
		err := c.Next()

		// Record metrics
		status := strconv.Itoa(c.Response().StatusCode())
		duration := time.Since(start_time).Seconds()

		MONITOR.request_counter.WithLabelValues(method, path, status).Inc()
		MONITOR.request_duration.WithLabelValues(method, path).Observe(duration)

		return err
	}
}

// RegisterMonitoringRoutes sets up the metrics endpoint for Prometheus scraping
func RegisterMonitoringRoutes(app *fiber.App) {
	// Use Fiber's built-in adapter for HTTP handlers
	promHandler := adaptor.HTTPHandler(promhttp.Handler())

	// Register the endpoint
	app.Get("/metrics", promHandler)
}
