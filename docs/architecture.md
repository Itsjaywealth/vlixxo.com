# Public Architecture

This document describes Vlixxo at a deliberately high level. It is not an infrastructure runbook.

## Application shape

The production product uses a React/Vite customer interface backed by a Node.js/Express application layer. Product and catalogue data are persisted in a document-database-backed data layer, while commerce flows integrate with a commerce platform for supported checkout operations.

This public repository includes optional storefront and application entry points for error monitoring and product analytics. Both stay inactive when their environment variables are unset. Trace sampling is limited to 0.1, and session replay is off. Production credentials remain outside the repository.

## Public request flow

    Customer browser
        |
        v
    Vlixxo storefront
        |
        v
    Application API
        |
        +-- Product and catalogue data
        +-- Search / visual search
        +-- Commerce integration
        +-- Analytics / attribution
        +-- Error monitoring
        +-- SEO / discoverability

## Security boundary

The public repository intentionally omits private hostnames and origin details, database connection strings, API and OAuth credentials, supplier authentication, payment secrets, signing/webhook secrets, internal admin surfaces, deployment credentials and security-sensitive network configuration.

The production source of truth remains private.
