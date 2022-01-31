build:
	@docker compose build

up:
	@docker compose up -d

down:
	@docker compose down

ps:
	@docker compose ps

php:
	@docker compose exec -w /tmp/src php bash

php-log:
	@docker compose logs php -f

db:
	@docker compose exec db bash -c 'mysql -h localhost -u hoge -ppassword event'

