package monitor

import (
	"fmt"
	"runtime"
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
	request_counter        *prometheus.CounterVec
	request_duration       *prometheus.HistogramVec
	request_in_flight      *prometheus.GaugeVec
	error_counter          *prometheus.CounterVec
	system_memory          prometheus.Gauge
	goroutines_count       prometheus.Gauge
	cv_generation_counter  *prometheus.CounterVec
	cv_generation_duration *prometheus.HistogramVec
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
		// CV generator specific metrics
		cv_generation_counter: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "cv_generator_cv_generation_total",
				Help: "Total number of CVs generated",
			},
			[]string{"success"},
		),
		cv_generation_duration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "cv_generator_cv_generation_duration_seconds",
				Help:    "CV generation time in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"template_type"},
		),
	}

	// Register all metrics with Prometheus
	if err := prometheus.Register(MONITOR.request_counter); err != nil {
		return fmt.Errorf("prometheus cannot register request_counter: %v", err)
	}
	if err := prometheus.Register(MONITOR.request_duration); err != nil {
		return fmt.Errorf("prometheus cannot register request_duration: %v", err)
	}
	if err := prometheus.Register(MONITOR.request_in_flight); err != nil {
		return fmt.Errorf("prometheus cannot register request_in_flight: %v", err)
	}
	if err := prometheus.Register(MONITOR.error_counter); err != nil {
		return fmt.Errorf("prometheus cannot register error_counter: %v", err)
	}
	if err := prometheus.Register(MONITOR.system_memory); err != nil {
		return fmt.Errorf("prometheus cannot register system_memory: %v", err)
	}
	if err := prometheus.Register(MONITOR.goroutines_count); err != nil {
		return fmt.Errorf("prometheus cannot register goroutines_count: %v", err)
	}
	if err := prometheus.Register(MONITOR.cv_generation_counter); err != nil {
		return fmt.Errorf("prometheus cannot register cv_generation_counter: %v", err)
	}
	if err := prometheus.Register(MONITOR.cv_generation_duration); err != nil {
		return fmt.Errorf("prometheus cannot register cv_generation_duration: %v", err)
	}

	// Start the goroutine to update system metrics
	go updateSystemMetrics()

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

func RecordError(errorType string) {
	MONITOR.error_counter.WithLabelValues(errorType).Inc()
}

// TrackCVGeneration is a helper function to measure CV generation time
func TrackCVGeneration(templateType string, fn func() error) error {
	startTime := time.Now()

	// Execute CV generation
	err := fn()

	// Record metrics
	duration := time.Since(startTime).Seconds()
	success := "true"
	if err != nil {
		success = "false"
		MONITOR.error_counter.WithLabelValues("cv_generation").Inc()
	}

	MONITOR.cv_generation_counter.WithLabelValues(success).Inc()
	MONITOR.cv_generation_duration.WithLabelValues(templateType).Observe(duration)

	return err
}

func updateSystemMetrics() {
	for {
		// Update goroutine count
		MONITOR.goroutines_count.Set(float64(runtime.NumGoroutine()))

		// Update memory usage
		var memStats runtime.MemStats
		runtime.ReadMemStats(&memStats)
		MONITOR.system_memory.Set(float64(memStats.Alloc))

		// Wait before next update
		time.Sleep(15 * time.Second)
	}
}
