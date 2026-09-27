# Public / Private Security Boundary

## Safe to publish

- Product identity
- Public website links
- Public-facing screenshots
- Sanitized documentation
- High-level architecture
- Placeholder configuration examples
- Selected code only after explicit security review

## Must remain private

- API keys and access tokens
- OAuth client secrets and refresh tokens
- Private keys and certificates
- Database credentials and connection strings
- Supplier authentication
- Payment-provider secrets
- Webhook and signing secrets
- Production environment values
- Customer and order data
- Internal dashboards and private analytics
- Private origin details and deployment credentials

If there is uncertainty about whether material is safe to publish, keep it private and review it before committing.
