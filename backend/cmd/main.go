package main

import (
        "database/sql"
        "encoding/json"
        "fmt"
        "log"
        "net/http"
        "os"
        "strconv"
        "strings"
        "time"

        _ "github.com/lib/pq"
)

// FormField represents a field in a form
type FormField struct {
        ID          string            `json:"id"`
        Type        string            `json:"type"`
        Label       string            `json:"label"`
        Placeholder string            `json:"placeholder,omitempty"`
        Required    bool              `json:"required"`
        Options     []string          `json:"options,omitempty"`
        Validation  map[string]interface{} `json:"validation,omitempty"`
}

// Form represents a form definition
type Form struct {
        ID               int         `json:"id"`
        Title            string      `json:"title"`
        Description      string      `json:"description,omitempty"`
        Fields           []FormField `json:"fields"`
        SubmitButtonText string      `json:"submitButtonText,omitempty"`
        IsActive         bool        `json:"isActive"`
        CreatedAt        time.Time   `json:"createdAt"`
        UpdatedAt        time.Time   `json:"updatedAt"`
}

// FormResponse represents a form submission
type FormResponse struct {
        ID           int                    `json:"id"`
        FormID       int                    `json:"formId"`
        PhoneNumber  string                 `json:"phoneNumber"`
        ResponseData map[string]interface{} `json:"responseData"`
        SubmittedAt  time.Time              `json:"submittedAt"`
}

// Database connection
var db *sql.DB

// Initialize database connection
func initDB() {
        var err error
        databaseURL := os.Getenv("DATABASE_URL")
        if databaseURL == "" {
                log.Fatal("DATABASE_URL environment variable is required")
        }

        db, err = sql.Open("postgres", databaseURL)
        if err != nil {
                log.Fatalf("Error connecting to database: %v", err)
        }

        if err = db.Ping(); err != nil {
                log.Fatalf("Error pinging database: %v", err)
        }

        fmt.Println("Successfully connected to database")
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Access-Control-Allow-Origin", "*")
                w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

                if r.Method == "OPTIONS" {
                        w.WriteHeader(http.StatusOK)
                        return
                }

                next.ServeHTTP(w, r)
        })
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"status": "healthy"}`)
}

// Create a new form
func createFormHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "POST" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        var formData struct {
                Title            string      `json:"title"`
                Description      string      `json:"description"`
                Fields           []FormField `json:"fields"`
                SubmitButtonText string      `json:"submitButtonText"`
        }

        if err := json.NewDecoder(r.Body).Decode(&formData); err != nil {
                http.Error(w, "Invalid JSON", http.StatusBadRequest)
                return
        }

        fieldsJSON, err := json.Marshal(formData.Fields)
        if err != nil {
                http.Error(w, "Error encoding fields", http.StatusInternalServerError)
                return
        }

        var form Form
        err = db.QueryRow(`
                INSERT INTO forms (title, description, fields, submit_button_text, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, true, NOW(), NOW())
                RETURNING id, title, description, fields, submit_button_text, is_active, created_at, updated_at
        `, formData.Title, formData.Description, fieldsJSON, formData.SubmitButtonText).Scan(
                &form.ID, &form.Title, &form.Description, &fieldsJSON, &form.SubmitButtonText, &form.IsActive,
                &form.CreatedAt, &form.UpdatedAt,
        )

        if err != nil {
                http.Error(w, "Error creating form", http.StatusInternalServerError)
                return
        }

        if err := json.Unmarshal(fieldsJSON, &form.Fields); err != nil {
                http.Error(w, "Error parsing fields", http.StatusInternalServerError)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(form)
}

// Get all forms
func getFormsHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        rows, err := db.Query(`
                SELECT id, title, description, fields, submit_button_text, is_active, created_at, updated_at
                FROM forms
                ORDER BY created_at DESC
        `)
        if err != nil {
                http.Error(w, "Error fetching forms", http.StatusInternalServerError)
                return
        }
        defer rows.Close()

        var forms []Form
        for rows.Next() {
                var form Form
                var fieldsJSON []byte

                err := rows.Scan(
                        &form.ID, &form.Title, &form.Description, &fieldsJSON, &form.SubmitButtonText,
                        &form.IsActive, &form.CreatedAt, &form.UpdatedAt,
                )
                if err != nil {
                        http.Error(w, "Error scanning form", http.StatusInternalServerError)
                        return
                }

                if err := json.Unmarshal(fieldsJSON, &form.Fields); err != nil {
                        http.Error(w, "Error parsing fields", http.StatusInternalServerError)
                        return
                }

                forms = append(forms, form)
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(forms)
}

// Get a specific form by ID
func getFormHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        // Extract form ID from URL path
        path := strings.TrimPrefix(r.URL.Path, "/api/forms/")
        formID, err := strconv.Atoi(path)
        if err != nil {
                http.Error(w, "Invalid form ID", http.StatusBadRequest)
                return
        }

        var form Form
        var fieldsJSON []byte

        err = db.QueryRow(`
                SELECT id, title, description, fields, submit_button_text, is_active, created_at, updated_at
                FROM forms
                WHERE id = $1 AND is_active = true
        `, formID).Scan(
                &form.ID, &form.Title, &form.Description, &fieldsJSON, &form.SubmitButtonText,
                &form.IsActive, &form.CreatedAt, &form.UpdatedAt,
        )

        if err == sql.ErrNoRows {
                http.Error(w, "Form not found", http.StatusNotFound)
                return
        } else if err != nil {
                http.Error(w, "Error fetching form", http.StatusInternalServerError)
                return
        }

        if err := json.Unmarshal(fieldsJSON, &form.Fields); err != nil {
                http.Error(w, "Error parsing fields", http.StatusInternalServerError)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(form)
}

// Submit form response
func submitFormHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "POST" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        var submission struct {
                FormID       int                    `json:"formId"`
                PhoneNumber  string                 `json:"phoneNumber"`
                ResponseData map[string]interface{} `json:"responseData"`
        }

        if err := json.NewDecoder(r.Body).Decode(&submission); err != nil {
                http.Error(w, "Invalid JSON", http.StatusBadRequest)
                return
        }

        if submission.PhoneNumber == "" {
                http.Error(w, "Phone number is required", http.StatusBadRequest)
                return
        }

        responseDataJSON, err := json.Marshal(submission.ResponseData)
        if err != nil {
                http.Error(w, "Error encoding response data", http.StatusInternalServerError)
                return
        }

        var response FormResponse
        err = db.QueryRow(`
                INSERT INTO form_responses (form_id, phone_number, response_data, submitted_at)
                VALUES ($1, $2, $3, NOW())
                RETURNING id, form_id, phone_number, response_data, submitted_at
        `, submission.FormID, submission.PhoneNumber, responseDataJSON).Scan(
                &response.ID, &response.FormID, &response.PhoneNumber,
                &responseDataJSON, &response.SubmittedAt,
        )

        if err != nil {
                http.Error(w, "Error submitting form", http.StatusInternalServerError)
                return
        }

        if err := json.Unmarshal(responseDataJSON, &response.ResponseData); err != nil {
                http.Error(w, "Error parsing response data", http.StatusInternalServerError)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
}

// Update form
func updateFormHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "PUT" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        // Extract form ID from URL path
        path := strings.TrimPrefix(r.URL.Path, "/api/forms/")
        formID, err := strconv.Atoi(path)
        if err != nil {
                http.Error(w, "Invalid form ID", http.StatusBadRequest)
                return
        }

        var formData struct {
                Title            string      `json:"title"`
                Description      string      `json:"description"`
                Fields           []FormField `json:"fields"`
                SubmitButtonText string      `json:"submitButtonText"`
        }

        if err := json.NewDecoder(r.Body).Decode(&formData); err != nil {
                http.Error(w, "Invalid JSON", http.StatusBadRequest)
                return
        }

        fieldsJSON, err := json.Marshal(formData.Fields)
        if err != nil {
                http.Error(w, "Error encoding fields", http.StatusInternalServerError)
                return
        }

        var form Form
        err = db.QueryRow(`
                UPDATE forms 
                SET title = $1, description = $2, fields = $3, submit_button_text = $4, updated_at = NOW()
                WHERE id = $5 AND is_active = true
                RETURNING id, title, description, fields, submit_button_text, is_active, created_at, updated_at
        `, formData.Title, formData.Description, fieldsJSON, formData.SubmitButtonText, formID).Scan(
                &form.ID, &form.Title, &form.Description, &fieldsJSON, &form.SubmitButtonText, &form.IsActive,
                &form.CreatedAt, &form.UpdatedAt,
        )

        if err == sql.ErrNoRows {
                http.Error(w, "Form not found", http.StatusNotFound)
                return
        } else if err != nil {
                http.Error(w, "Error updating form", http.StatusInternalServerError)
                return
        }

        if err := json.Unmarshal(fieldsJSON, &form.Fields); err != nil {
                http.Error(w, "Error parsing fields", http.StatusInternalServerError)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(form)
}

// Delete form
func deleteFormHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "DELETE" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        // Extract form ID from URL path
        path := strings.TrimPrefix(r.URL.Path, "/api/forms/")
        formID, err := strconv.Atoi(path)
        if err != nil {
                http.Error(w, "Invalid form ID", http.StatusBadRequest)
                return
        }

        // Soft delete by setting is_active to false
        result, err := db.Exec(`
                UPDATE forms 
                SET is_active = false, updated_at = NOW()
                WHERE id = $1 AND is_active = true
        `, formID)

        if err != nil {
                http.Error(w, "Error deleting form", http.StatusInternalServerError)
                return
        }

        rowsAffected, err := result.RowsAffected()
        if err != nil {
                http.Error(w, "Error checking deletion result", http.StatusInternalServerError)
                return
        }

        if rowsAffected == 0 {
                http.Error(w, "Form not found", http.StatusNotFound)
                return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"message": "Form deleted successfully"}`)
}

// Get form responses
func getFormResponsesHandler(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                return
        }

        // Extract form ID from URL path
        path := strings.TrimPrefix(r.URL.Path, "/api/forms/")
        parts := strings.Split(path, "/")
        if len(parts) != 2 || parts[1] != "responses" {
                http.Error(w, "Invalid URL format", http.StatusBadRequest)
                return
        }

        formID, err := strconv.Atoi(parts[0])
        if err != nil {
                http.Error(w, "Invalid form ID", http.StatusBadRequest)
                return
        }

        rows, err := db.Query(`
                SELECT id, form_id, phone_number, response_data, submitted_at
                FROM form_responses
                WHERE form_id = $1
                ORDER BY submitted_at DESC
        `, formID)
        if err != nil {
                http.Error(w, "Error fetching responses", http.StatusInternalServerError)
                return
        }
        defer rows.Close()

        var responses []FormResponse
        for rows.Next() {
                var response FormResponse
                var responseDataJSON []byte

                err := rows.Scan(
                        &response.ID, &response.FormID, &response.PhoneNumber,
                        &responseDataJSON, &response.SubmittedAt,
                )
                if err != nil {
                        http.Error(w, "Error scanning response", http.StatusInternalServerError)
                        return
                }

                if err := json.Unmarshal(responseDataJSON, &response.ResponseData); err != nil {
                        http.Error(w, "Error parsing response data", http.StatusInternalServerError)
                        return
                }

                responses = append(responses, response)
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(responses)
}

// Route handler
func setupRoutes() {
        // Health check
        http.HandleFunc("/health", healthHandler)
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusOK)
                fmt.Fprintf(w, `{"message": "Dynamic Form Creator API", "status": "ok"}`)
        })

        // API routes
        http.HandleFunc("/api/forms", func(w http.ResponseWriter, r *http.Request) {
                if r.Method == "POST" {
                        createFormHandler(w, r)
                } else if r.Method == "GET" {
                        getFormsHandler(w, r)
                } else {
                        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                }
        })

        http.HandleFunc("/api/forms/", func(w http.ResponseWriter, r *http.Request) {
                path := strings.TrimPrefix(r.URL.Path, "/api/forms/")
                if strings.Contains(path, "/responses") {
                        getFormResponsesHandler(w, r)
                } else {
                        if r.Method == "GET" {
                                getFormHandler(w, r)
                        } else if r.Method == "PUT" {
                                updateFormHandler(w, r)
                        } else if r.Method == "DELETE" {
                                deleteFormHandler(w, r)
                        } else {
                                http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
                        }
                }
        })

        http.HandleFunc("/api/submit", submitFormHandler)
}

// main is the entry point of the Dynamic Form Creator API
func main() {
        fmt.Println("Dynamic Form Creator API")
        fmt.Println("========================")

        // Initialize database
        initDB()
        defer db.Close()

        // Setup routes
        setupRoutes()

        // Get port from environment variable, default to 5000 for Replit compatibility
        port := os.Getenv("PORT")
        if port == "" {
                port = "5000"
        }

        // Create server with CORS middleware
        handler := corsMiddleware(http.DefaultServeMux)

        // Start the HTTP server
        fmt.Printf("Server starting on port %s...\n", port)
        fmt.Printf("API Documentation:\n")
        fmt.Printf("  POST   /api/forms - Create a new form\n")
        fmt.Printf("  GET    /api/forms - Get all forms\n")
        fmt.Printf("  GET    /api/forms/{id} - Get specific form\n")
        fmt.Printf("  PUT    /api/forms/{id} - Update existing form\n")
        fmt.Printf("  DELETE /api/forms/{id} - Delete form (soft delete)\n")
        fmt.Printf("  POST   /api/submit - Submit form response\n")
        fmt.Printf("  GET    /api/forms/{id}/responses - Get form responses\n")
        
        if err := http.ListenAndServe("0.0.0.0:"+port, handler); err != nil {
                log.Fatalf("Server failed to start: %v", err)
        }
}
