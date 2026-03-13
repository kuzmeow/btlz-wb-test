# Шаблон для выполнения тестового задания

## Описание
Шаблон подготовлен для того, чтобы попробовать сократить трудоемкость выполнения тестового задания.

В шаблоне настоены контейнеры для `postgres` и приложения на `nodejs`.  
Для взаимодействия с БД используется `knex.js`.  
В контейнере `app` используется `build` для приложения на `ts`, но можно использовать и `js`.

Шаблон не является обязательным!\
Можно использовать как есть или изменять на свой вкус.

Все настройки можно найти в файлах:
- compose.yaml
- dockerfile
- package.json
- tsconfig.json
- src/config/env/env.ts
- src/config/knex/knexfile.ts

## Команды:

Запуск базы данных:
```bash
docker compose up -d --build postgres
```

Для выполнения миграций и сидов не из контейнера:
```bash
npm run knex:dev migrate latest
```

```bash
npm run knex:dev seed run
```
Также можно использовать и остальные команды (`migrate make <name>`,`migrate up`, `migrate down` и т.д.)

Для запуска приложения в режиме разработки:
```bash
npm run dev
```

Запуск проверки самого приложения:
```bash
docker compose up -d --build app
```

Для финальной проверки рекомендую:
```bash
docker compose down --rmi local --volumes
docker compose up --build
```

### Работа с таблицами

Для регистрации таблицы по spreadsheet_id:
```bash
npm run spreadsheets:dev register spreadsheet_id
```

По умолчанию в эту таблицу будут регулярно приходить акутальные данные

Можно указать конкретную дату в прошлом, чтобы создать лист с данными за эту дату (если когда-то данные обновятся в бд снова, например при регистрации ещё одной таблицы на эту дату, то они также обновятся во всех таблицах для этой даты)

```bash
npm run spreadsheets:dev register spreadsheet_id -- --tariff-date YYYY-MM-DD
```

Если таблица создана на конкретную дату, которая является актуальной на данный момент, то в течении этого дня она ещё будет регулярно обновляться

Чтобы сервис мог работать с googleapis и googleSheets необходимо включить для проекта Google Сloud Google Sheets API https://console.cloud.google.com/apis/api/sheets.googleapis.com
После этого создать Service Account и добавить его как editor в ваш spreadsheet
Так же необходимо занести свои credentials в google-credentials.json, пример его содержания можно найти в example.google-credentials.json

Для удаления таблицы с spreadsheet_id:
```bash
npm run spreadsheets:dev unregister spreadsheet_id
```