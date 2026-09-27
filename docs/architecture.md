# Public Architecture

This document describes Vlixxo at a deliberately high level. It is not an infrastructure runbook.

## Application shape

The production product uses a React/Vite customer interface backed by a Node.js/Express application layer. Product and catalogue data are persisted in a MongoDB-backed data layer, while commerce flows integrate with Shopify for supported checkout operations.

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
        +-- SEO / discoverability

## Security boundary

The public repository intentionally omits private hostnames and origin details, database connection strings, API and OAuth credentials, supplier authentication, payment secrets, signing/webhook secrets, internal admin surfaces, deployment credentials and security-sensitive network configuration.

The production source of truth remains private.
