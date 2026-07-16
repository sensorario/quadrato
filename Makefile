.PHONY: deploy deploy-log

deploy:
	@nohup ./scripts/deploy.sh >/dev/null 2>&1 & disown
	@echo "Deploy started in background — tail progress with: make deploy-log"

deploy-log:
	@tail -f log/deploy/latest.log
