build:
	@docker compose build

up:
	@docker compose up -d

down:
	@docker compose down

ps:
	@docker compose ps

app:
	@docker compose exec app bash

app-log:
	@docker compose logs app -f

db:
	@docker compose exec db bash -c 'mysql -h localhost -u hoge -ppassword event'

