# Security Policy

## Reporting a security issue

Please do not publish credentials, tokens, private keys, customer information, vulnerability details, or production configuration in a public issue.

For security-sensitive reports, use a private contact channel associated with BrandVerse Ventures or Vlixxo.

## Repository policy

This public repository must not contain production secrets or confidential operational data.

Before publishing changes, contributors should verify that commits do not contain:

- API keys or access tokens
- OAuth credentials or refresh tokens
- Private keys or certificates
- Database connection strings or passwords
- Webhook signing secrets
- Supplier or payment-provider credentials
- Customer, order, or private analytics data
- Production environment files

If a secret is ever committed, treat it as compromised: revoke or rotate it first, then remove it from repository history.
