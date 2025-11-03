.PHONY: help dev build lint lint-fix format test typecheck deploy clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server
	npm run dev

build: ## Build the application for production
	npm run build

lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

test: ## Run tests
	npm run test

typecheck: ## Run TypeScript type checking
	npm run typecheck

deploy: ## Deploy to production (Cloudflare Pages)
	npm run deploy:prod

clean: ## Clean build artifacts and node_modules
	rm -rf .next .open-next .vercel node_modules
