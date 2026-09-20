package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// OpenAPI structures for parsing
type OpenAPISpec struct {
	Components ComponentsSpec         `yaml:"components"`
	Paths      map[string]interface{} `yaml:"paths"`
}

type ComponentsSpec struct {
	Schemas map[string]SchemaSpec `yaml:"schemas"`
}

type SchemaSpec struct {
	Type       string                 `yaml:"type"`
	Properties map[string]interface{} `yaml:"properties"`
	Required   []string               `yaml:"required"`
	AllOf      []SchemaSpec           `yaml:"allOf"`
}

// Field info for comparison
type FieldInfo struct {
	Name     string
	JsonTag  string
	GoType   string
	Location string
}

func main() {
	fmt.Println("🔍 WorkConnect API Contract Validator")
	fmt.Println("=====================================\n")

	// Read OpenAPI spec
	specPath := "openapi.yaml"
	if _, err := os.Stat(specPath); err != nil {
		fmt.Printf("❌ Error: openapi.yaml not found at %s\n", specPath)
		os.Exit(1)
	}

	spec, err := parseOpenAPISpec(specPath)
	if err != nil {
		fmt.Printf("❌ Error parsing openapi.yaml: %v\n", err)
		os.Exit(1)
	}

	// Find all Go struct files with DTOs and models
	backendStructs, err := scanBackendStructs()
	if err != nil {
		fmt.Printf("❌ Error scanning backend structs: %v\n", err)
		os.Exit(1)
	}

	// Validate
	mismatches := validateContract(spec, backendStructs)

	// Report results
	if len(mismatches) > 0 {
		fmt.Printf("\n❌ VALIDATION FAILED: %d mismatch(es) found\n\n", len(mismatches))
		for _, mismatch := range mismatches {
			fmt.Printf("  • %s\n", mismatch)
		}
		os.Exit(1)
	}

	fmt.Println("✅ VALIDATION PASSED: API contract is properly aligned")
	fmt.Printf("✅ Validated %d struct(s) against openapi.yaml\n", len(backendStructs))
	os.Exit(0)
}

// parseOpenAPISpec reads and parses the OpenAPI YAML file
func parseOpenAPISpec(path string) (*OpenAPISpec, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var spec OpenAPISpec
	if err := yaml.Unmarshal(data, &spec); err != nil {
		return nil, err
	}

	return &spec, nil
}

// scanBackendStructs finds all relevant Go struct definitions
func scanBackendStructs() (map[string][]FieldInfo, error) {
	structs := make(map[string][]FieldInfo)

	// Scan DTO files
	dtoFiles := []string{
		"backend/internal/model/dto/user_dto.go",
	}

	// Scan model files
	modelFiles := []string{
		"backend/internal/model/db/models.go",
	}

	for _, file := range dtoFiles {
		if fields, err := parseStructFile(file); err == nil {
			for structName, fieldList := range fields {
				structs[structName] = fieldList
			}
		}
	}

	for _, file := range modelFiles {
		if fields, err := parseStructFile(file); err == nil {
			for structName, fieldList := range fields {
				structs[structName] = fieldList
			}
		}
	}

	return structs, nil
}

// parseStructFile parses a Go file and extracts struct definitions with JSON tags
func parseStructFile(filepath string) (map[string][]FieldInfo, error) {
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, filepath, nil, parser.AllErrors)
	if err != nil {
		return nil, err
	}

	structs := make(map[string][]FieldInfo)

	ast.Inspect(file, func(n ast.Node) bool {
		typeSpec, ok := n.(*ast.TypeSpec)
		if !ok {
			return true
		}

		structType, ok := typeSpec.Type.(*ast.StructType)
		if !ok {
			return true
		}

		var fields []FieldInfo
		for _, field := range structType.Fields.List {
			if len(field.Names) == 0 {
				continue // Skip embedded fields
			}

			fieldName := field.Names[0].Name
			jsonTag := extractJsonTag(field.Tag)
			goType := fmt.Sprintf("%v", field.Type)

			fields = append(fields, FieldInfo{
				Name:     fieldName,
				JsonTag:  jsonTag,
				GoType:   goType,
				Location: fmt.Sprintf("%s:%d", filepath, fset.Position(field.Pos()).Line),
			})
		}

		if len(fields) > 0 {
			structs[typeSpec.Name.Name] = fields
		}

		return true
	})

	return structs, nil
}

// extractJsonTag extracts the JSON tag from a struct field
func extractJsonTag(tag *ast.BasicLit) string {
	if tag == nil {
		return ""
	}

	tagStr := strings.Trim(tag.Value, "`")
	tagMap := parseTag(tagStr)
	return tagMap["json"]
}

// parseTag parses struct tags into a map
func parseTag(tag string) map[string]string {
	result := make(map[string]string)
	for _, part := range strings.Split(tag, " ") {
		if strings.Contains(part, ":") {
			kv := strings.Split(part, ":")
			if len(kv) == 2 {
				key := kv[0]
				value := strings.Trim(strings.Trim(kv[1], `"`), " ")
				result[key] = value
			}
		}
	}
	return result
}

// validateContract compares backend structs against OpenAPI schemas
func mergeSchemaProperties(schema SchemaSpec) map[string]interface{} {
	merged := map[string]interface{}{}

	var visit func(SchemaSpec)
	visit = func(current SchemaSpec) {
		for key, value := range current.Properties {
			merged[key] = value
		}
		for _, child := range current.AllOf {
			visit(child)
		}
	}

	visit(schema)
	return merged
}

func validateContract(spec *OpenAPISpec, backendStructs map[string][]FieldInfo) []string {
	var mismatches []string

	// Known struct-to-schema mappings
	mappings := map[string]string{
		"RegisterRequest":           "RegisterRequest",
		"LoginRequest":              "LoginRequest",
		"CreateServiceRequest":      "CreateServiceRequest",
		"WorkerDecisionRequest":     "WorkerDecisionRequest",
		"UpdateAvailabilityRequest": "UpdateAvailabilityRequest",
		"SubmitReviewRequest":       "SubmitReviewRequest",
		"InitiatePaymentRequest":    "InitiatePaymentRequest",
		"SendMessageRequest":        "SendMessageRequest",
		"User":                      "User",
		"WorkerProfile":             "WorkerProfile",
		"WorkerCard":                "WorkerCard",
		"WorkerDetails":             "WorkerDetails",
		"ServiceRequest":            "ServiceRequest",
		"ServiceRequestView":        "ServiceRequestView",
		"Payment":                   "Payment",
		"MessageConversation":       "MessageConversation",
		"Message":                   "Message",
		"CustomerDashboard":         "CustomerDashboard",
		"WorkerDashboard":           "WorkerDashboard",
		"AdminDashboard":            "AdminDashboard",
	}

	for structName, expectedSchemaName := range mappings {
		backendFields, ok := backendStructs[structName]
		if !ok {
			continue // Skip if struct not found
		}

		schema, ok := spec.Components.Schemas[expectedSchemaName]
		if !ok {
			mismatches = append(mismatches,
				fmt.Sprintf("Schema %s not found in openapi.yaml", expectedSchemaName))
			continue
		}

		schemaProperties := mergeSchemaProperties(schema)

		// Check each backend field
		for _, backendField := range backendFields {
			jsonTag := backendField.JsonTag
			if jsonTag == "" {
				continue // Skip fields without JSON tags
			}

			jsonFieldName := strings.Split(jsonTag, ",")[0]
			if jsonFieldName == "-" {
				continue // Excluded from JSON serialization by Go's encoding/json
			}

			// Check if field exists in OpenAPI schema
			if _, hasProperty := schemaProperties[jsonFieldName]; !hasProperty {
				mismatches = append(mismatches,
					fmt.Sprintf("Field %q in struct %s (%s) not found in OpenAPI schema %s",
						jsonFieldName, structName, backendField.Location, expectedSchemaName))
			}
		}

		// Check each OpenAPI property exists in backend
		for propName := range schemaProperties {
			found := false
			for _, backendField := range backendFields {
				jsonTag := strings.Split(backendField.JsonTag, ",")[0]
				if jsonTag == "-" {
					continue
				}
				if jsonTag == propName {
					found = true
					break
				}
			}

			if !found && !isOptionalProperty(propName) {
				// Some properties might be computed, so we warn but don't fail
				fmt.Printf("⚠️  OpenAPI property %q in %s not found in struct %s\n",
					propName, expectedSchemaName, structName)
			}
		}
	}

	// Check for snake_case in JSON tags (not allowed)
	fmt.Println("\n🔍 Checking for camelCase compliance...")
	for structName, fields := range backendStructs {
		for _, field := range fields {
			if field.JsonTag == "" {
				continue
			}
			jsonTag := strings.Split(field.JsonTag, ",")[0]
			if jsonTag == "-" {
				continue
			}

			// Check if contains underscore (snake_case indicator)
			if strings.Contains(jsonTag, "_") {
				mismatches = append(mismatches,
					fmt.Sprintf("Field %q in struct %s uses snake_case; must use camelCase per spec (%s)",
						jsonTag, structName, field.Location))
			}

			// Check if contains uppercase after lowercase (PascalCase indicator)
			if hasInternalCapitals(jsonTag) && strings.Contains(jsonTag, "Etb") {
				// Etb suffix is allowed
				continue
			} else if hasInternalCapitals(jsonTag) && !isCamelCase(jsonTag) {
				mismatches = append(mismatches,
					fmt.Sprintf("Field %q in struct %s is not camelCase (%s)",
						jsonTag, structName, field.Location))
			}
		}
	}

	return mismatches
}

// isOptionalProperty checks if a property is likely computed/optional
func isOptionalProperty(name string) bool {
	optionalPatterns := []string{
		"Meta", "meta",
		"Error", "error",
		"Message", "message",
		"Status", "status",
	}

	for _, pattern := range optionalPatterns {
		if strings.Contains(name, pattern) {
			return true
		}
	}

	return false
}

// hasInternalCapitals checks if string has capitals after the first letter
func hasInternalCapitals(s string) bool {
	for i := 1; i < len(s); i++ {
		if s[i] >= 'A' && s[i] <= 'Z' {
			return true
		}
	}
	return false
}

// isCamelCase validates camelCase format (first char lowercase, rest mixed)
func isCamelCase(s string) bool {
	if len(s) == 0 {
		return false
	}

	// First char must be lowercase
	if s[0] < 'a' || s[0] > 'z' {
		return false
	}

	// Must match pattern: lowercase start, optional camelCase middle, optional unit suffix
	// Examples: workerId, categoryId, budgetEtb, hourlyRateEtb
	pattern := regexp.MustCompile(`^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*(Etb|Usd|Chf)?$`)
	return pattern.MatchString(s)
}
