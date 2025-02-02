// monitor_utils.go
package monitor

import (
	"runtime"
	"time"
)

// StartSystemMetricsCollection starts collecting system metrics in the background
func StartSystemMetricsCollection(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for range ticker.C {
			CollectSystemMetrics()
		}
	}()
}

// CollectSystemMetrics updates system-related metrics
func CollectSystemMetrics() {
	var mem_stats runtime.MemStats
	runtime.ReadMemStats(&mem_stats)

	MONITOR.system_memory.Set(float64(mem_stats.Alloc))
	MONITOR.goroutines_count.Set(float64(runtime.NumGoroutine()))
}

// IncrementErrorCounter increments the error counter for a specific error type
func IncrementErrorCounter(error_type string) {
	MONITOR.error_counter.WithLabelValues(error_type).Inc()
}
