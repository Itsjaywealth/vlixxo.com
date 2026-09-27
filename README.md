# Vlixxo

**Vlixxo** is a modern ecommerce storefront for discovering and shopping products across supported markets.

**Live product:** https://www.vlixxo.com

Vlixxo is part of the **BrandVerse Ventures** ecosystem. This repository is its public GitHub home and is intentionally limited to information that is safe to publish.

## About

Vlixxo focuses on a straightforward shopping experience across desktop and mobile. The live product combines catalogue discovery, search, category browsing, product detail pages, cart flows and a secure checkout handoff.

## Key capabilities

The current product includes:

- Public ecommerce storefront
- Product catalogue and category browsing
- Text search and product discovery
- Visual product search
- Product detail pages
- Cart and checkout handoff
- Regional shopping experience for supported markets
- Responsive desktop and mobile layouts
- Shipping, delivery, return and policy information
- Analytics and commerce attribution
- Search-engine discoverability and structured product metadata

## Technology

Verified high-level technologies used by the production application include:

- React 18
- Vite
- Node.js
- Express
- MongoDB with Mongoose
- Shopify commerce integration

Production credentials, supplier authentication, payment secrets, database credentials and deployment configuration are deliberately excluded from this repository.

## Architecture

The public architecture is intentionally documented at a high level:

    Shopper
      |
      v
    React / Vite storefront
      |
      v
    Node.js / Express application layer
      |
      +--> Catalogue and product data
      +--> Search and visual-search services
      +--> Shopify-backed commerce / checkout handoff
      +--> Analytics and discoverability integrations

See [docs/architecture.md](docs/architecture.md) for the public-safe architecture boundary.

## Screenshots

Public storefront screenshots are available in [screenshots/](screenshots/).

## Security

This repository must never contain production credentials or confidential operational data.

- No production `.env` files
- No API keys, access tokens or OAuth secrets
- No private keys or certificates
- No database credentials
- No supplier or payment credentials
- No customer, order or private analytics data
- No private infrastructure endpoints

See [SECURITY.md](SECURITY.md) and [docs/security-boundary.md](docs/security-boundary.md).

## Configuration examples

[.env.example](.env.example) contains variable names/placeholders only. It is documentation, not a production configuration file.

## BrandVerse Ventures

Vlixxo is built and operated within the BrandVerse Ventures product ecosystem.

## Repository scope

This public repository is a product showcase and documentation surface. The authoritative production source and operational tooling remain private by design.
