.PHONY: dev build lint format test test-watch test-coverage deploy typecheck help

# Default target
help:
	@echo "Available make targets:"
	@echo "  make dev            - Start the Next.js development server"
	@echo "  make build          - Build the Next.js application for production"
	@echo "  make lint           - Run ESLint to check code quality"
	@echo "  make format         - Format code with Prettier"
	@echo "  make test           - Run tests with Vitest"
	@echo "  make test-watch     - Run tests in watch mode"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo "  make deploy         - Deploy to Cloudflare Pages (production)"
	@echo ""
	@echo "Additional commands:"
	@echo "  make typecheck      - Run TypeScript type checking"

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Run linter
lint:
	npm run lint

# Format code with Prettier
format:
	npm run format

# Run tests with Vitest
test:
	npm run test

# Run tests in watch mode
test-watch:
	npm run test:watch

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Deploy to production
deploy:
	npm run deploy:prod

# Run TypeScript type checking
typecheck:
	npm run typecheck
