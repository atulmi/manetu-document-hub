# Manetu Policy Engine — Document Access Domain
#
# Evaluates MCP tool calls against role-based access rules.
# Default-deny: if no rule explicitly allows, the request is denied.
#
# Usage:
#   POST /v1/data/docs/authz
#   { "input": { "principal": "viewer", "resource": "mrn:mcp:docs:resource:public:readme", "operation": "read" } }
#
# Response:
#   { "result": { "allow": true, "rule": "viewer-public-read", "reason": "..." } }

package docs.authz

import rego.v1

default allow := false
default rule := "default-deny"
default reason := "No policy rule matched — access denied by default"

# Look up the principal's allowed MRN patterns from role data
role_grants := data.roles[input.principal].grants

# Admin — unrestricted wildcard access
allow if {
	some grant in role_grants
	grant.mrn == "mrn:mcp:*"
}

rule := "admin-unrestricted" if {
	some grant in role_grants
	grant.mrn == "mrn:mcp:*"
}

reason := "Admin role has unrestricted access to all MCP resources" if {
	some grant in role_grants
	grant.mrn == "mrn:mcp:*"
}

# Exact MRN match
allow if {
	some grant in role_grants
	grant.mrn == input.resource
	valid_operation(grant, input.operation)
}

rule := matched_rule if {
	some grant in role_grants
	grant.mrn == input.resource
	valid_operation(grant, input.operation)
	matched_rule := grant.rule
}

reason := matched_reason if {
	some grant in role_grants
	grant.mrn == input.resource
	valid_operation(grant, input.operation)
	matched_reason := grant.reason
}

# Wildcard MRN match (e.g. mrn:mcp:docs:resource:public:* matches mrn:mcp:docs:resource:public:readme)
allow if {
	some grant in role_grants
	endswith(grant.mrn, ":*")
	prefix := trim_suffix(grant.mrn, "*")
	startswith(input.resource, prefix)
	valid_operation(grant, input.operation)
}

rule := matched_rule if {
	some grant in role_grants
	endswith(grant.mrn, ":*")
	prefix := trim_suffix(grant.mrn, "*")
	startswith(input.resource, prefix)
	valid_operation(grant, input.operation)
	matched_rule := grant.rule
}

reason := matched_reason if {
	some grant in role_grants
	endswith(grant.mrn, ":*")
	prefix := trim_suffix(grant.mrn, "*")
	startswith(input.resource, prefix)
	valid_operation(grant, input.operation)
	matched_reason := grant.reason
}

# Operation validation — if grant specifies operations, check; otherwise allow any
valid_operation(grant, _op) if {
	not grant.operations
}

valid_operation(grant, op) if {
	some allowed_op in grant.operations
	allowed_op == op
}
