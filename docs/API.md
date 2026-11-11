# QUIK API

Тестовый сервер: `http://172.23.10.85:5000/`
Swagger: `http://172.23.10.85:5000/api-docs`

## Важно

**Время.** Позиции (лимиты) можно отправлять с 9:00.

**Условия, чтобы брокер мог торговать в QUIK за клиента:**

1. **Указан конечный клиент.** В поле `ClientCode` (`CLIENT_CODE` в лимитах) передаётся код клиента, за которого торгует брокер.
2. **Есть позиция по инструменту с торговым счётом.** По инструменту должна быть загружена позиция (`POST /api/depolimits`) с торговым счётом в поле `TRDACCID`. Именно эта позиция даёт брокеру право торговать в QUIK через этот счёт.
3. **Позиция может быть нулевой.** Если у клиента нет бумаг, позицию всё равно загружают с `OPEN_BALANCE = 0` и `OPEN_LIMIT = 0`.

## Общее

- Формат запросов и ответов — JSON.
- Фильтры передаются в query-параметрах. Где указано «любой столбец», параметр с именем столбца даёт условие `столбец = значение`; неизвестные параметры игнорируются.

### Ошибки

`400` — тело не прошло проверку:
```json
{
  "success": false,
  "message": "Ошибка валидации данных",
  "errors": [{ "field": "FirmCode", "message": "Required" }]
}
```

`409` — операция отклонена (например, запись уже существует):
```json
{ "success": false, "message": "Процедура NewTradeAccount вернула ошибку", "reason": "..." }
```

`404` — маршрут или таблица не найдены. `500` — внутренняя ошибка сервера.

### Авторизация

Торговые счета (`GET /api/trdaccs`), позиции (`/api/depolimits`, `/api/moneylimits`) и сделки (`GET /api/trades`) доступны только с API-ключом депозитария в заголовке `X-API-Key`. Ключ выдаёт биржа.

```bash
curl -H "X-API-Key: <ваш ключ>" "http://172.23.10.85:5000/api/depolimits"
```

Депозитарий видит и загружает только свои данные:

| Данные | Признак принадлежности |
|---|---|
| Торговые счета (`GET /api/trdaccs`) | торговый счёт `TrdAccId` |
| Позиции по инструментам (`/api/depolimits`) | торговый счёт `Trdacc` / `TRDACCID` |
| Денежные позиции (`/api/moneylimits`) | тэг `Tag` / `TAG` |
| Сделки (`GET /api/trades`) | класс `ClassCode` |

Свои значения можно узнать заранее:

| Эндпоинт | Что возвращает |
|---|---|
| `GET /api/depolimits/accounts` | ваши торговые счета |
| `GET /api/moneylimits/tags` | ваши тэги |
| `GET /api/trades/classes` | ваши классы |

```json
{ "success": true, "data": ["EQTV", "FX"] }
```

Чужие строки в ответе не возвращаются. Если в POST есть хотя бы один чужой счёт или тэг, отклоняется весь пакет, файл лимитов не формируется. Если в `GET /api/trades` запрошен чужой `ClassCode`, тоже возвращается `403`.

`401` — ключа нет или он неверный. `403` — депозитарий отключён или данные чужие. В ответе сказано, какие значения чужие, и перечислены доступные вам:
```json
{
  "success": false,
  "message": "Торговый счёт L-400-83 не принадлежит вашему депозитарию. Доступные вам счета: 1-3101-2002. Файл не сформирован.",
  "error": "FORBIDDEN_ACCOUNT",
  "accounts": ["L-400-83"],
  "available_accounts": ["1-3101-2002"]
}
```

| `error` | Чужие значения | Доступные значения |
|---|---|---|
| `FORBIDDEN_ACCOUNT` | `accounts` | `available_accounts` |
| `FORBIDDEN_TAG` | `tags` | `available_tags` |
| `FORBIDDEN_CLASS` | `classes` | `available_classes` |

В тексте `message` перечисляется не больше 20 значений, полный список — в поле `available_*`.

---

## Справочники

### GET `/api/securities`

Список инструментов.

Параметры: любой столбец, например `ClassCode`, `SecCode`, `TradeDate`, `FaceUnit`.

Поля ответа: `TradeDate, ClassCode, SecCode, FaceUnit, SecShortName, SecFullName`. Сортировка по `TradeDate` по убыванию.

```bash
curl "http://172.23.10.85:5000/api/securities?ClassCode=TQBR&SecCode=GAZP"
```

### GET `/api/currency-info`

Список валют.

Параметры: любой столбец — `TradeDate`, `CurrCode`, `CurrFullName`.

Поля ответа: `TradeDate, CurrCode, CurrFullName`.

### GET `/api/params/actual/exists`

Открыт ли торговый день на КФБ.

Ответ: `true` или `false`.

---

## Фирмы

### GET `/api/firms`

Параметры: `firmId`.

Поля ответа: `Exchange, FirmId, FirmName, Status, StatusFlag`.

### POST `/api/firms`

Добавить фирму.

| Поле | Тип | Обязательно |
|---|---|---|
| `FirmCode` | строка до 12 | да |
| `FirmName` | строка до 128 | да |
| `Permissions` | целое | да |
| `Exchange` | строка до 12 | да |

Если фирма с таким `FirmCode` уже есть, возвращается `200` с `"alreadyExists": true` и данными фирмы.

```json
{ "FirmCode": "2002", "FirmName": "Брокер", "Permissions": 0, "Exchange": "KSE" }
```

---

## Торговые счета

### GET `/api/trdaccs`

Торговые счета вашего депозитария (нужен `X-API-Key`).

Параметры: `FirmId`.

Поля ответа: `TrdAccId, Type, FirmId, LoadDate, Description, Status, BankAccId, DepAccId`.

### POST `/api/trade-accounts`

Добавить торговый счёт.

| Поле | Тип | Обязательно |
|---|---|---|
| `FirmCode` | строка до 12 | да |
| `Account` | строка до 12 | да |

```json
{ "FirmCode": "2002", "Account": "1-3101-2002" }
```

Ответ `200`:
```json
{ "success": true, "message": "Торговый счет успешно добавлен" }
```

---

## Позиции и лимиты

Позиции можно отправлять с 9:00.

POST-методы принимают **массив** записей (минимум одна). Все поля обязательны; числовые значения можно передавать строкой или числом.

Ответ `200`:
```json
{ "success": true, "fileName": "...", "outputLog": "..." }
```
Если QUIK не принял лимиты — `500` с тем же форматом и `"success": false`; причина в `outputLog`.

### GET `/api/depolimits`

Позиции по инструментам.

Параметры: `firmId`.

Поля ответа: `LoadDate, FirmId, ClientCode, SecCode, Trdacc, LimitKind, LockedBuy, CurrentBal, CurrentLimit`.

### GET `/api/depolimits/accounts`

Торговые счета, закреплённые за вашим депозитарием. В `POST /api/depolimits` принимаются только они, на чужой счёт — `403 FORBIDDEN_ACCOUNT` (см. «Авторизация»).

### POST `/api/depolimits`

Установить позиции по инструментам.

| Поле | Описание |
|---|---|
| `FIRM_ID` | Код фирмы |
| `SECCODE` | Код инструмента |
| `CLIENT_CODE` | Код конечного клиента |
| `LIMIT_KIND` | Вид лимита (срок расчётов), например `0` |
| `OPEN_BALANCE` | Количество бумаг, может быть `0` |
| `OPEN_LIMIT` | Лимит, может быть `0` |
| `TRDACCID` | Торговый счёт, через который брокер будет торговать |

```json
[
  {
    "FIRM_ID": "2002",
    "SECCODE": "GD0528",
    "CLIENT_CODE": "12",
    "LIMIT_KIND": "0",
    "OPEN_BALANCE": "0",
    "OPEN_LIMIT": "0",
    "TRDACCID": "1-3101-2002"
  }
]
```

### GET `/api/moneylimits`

Денежные позиции.

Параметры: `firmId`.

Поля ответа: `LoadDate, FirmId, ClientCode, Tag, CurrCode, LimitKind, CurrentBal, CurrentLimit, OpenBal, OpenLimit`.

### GET `/api/moneylimits/tags`

Тэги, закреплённые за вашим депозитарием. В `POST /api/moneylimits` принимаются только они, на чужой тэг — `403 FORBIDDEN_TAG` (см. «Авторизация»).

### POST `/api/moneylimits`

Установить денежные позиции.

| Поле | Описание |
|---|---|
| `FIRM_ID` | Код фирмы |
| `TAG` | Код позиции, например `EQTV` |
| `CURR_CODE` | Валюта, например `KGS` |
| `CLIENT_CODE` | Код конечного клиента |
| `LIMIT_KIND` | Вид лимита, например `0` |
| `OPEN_BALANCE` | Сумма, дробная часть через запятую |
| `OPEN_LIMIT` | Лимит |
| `LEVERAGE` | Плечо, `-1` — без плеча |

```json
[
  {
    "FIRM_ID": "2002",
    "TAG": "EQTV",
    "CURR_CODE": "KGS",
    "CLIENT_CODE": "12",
    "LIMIT_KIND": "0",
    "OPEN_BALANCE": "2000000,00",
    "OPEN_LIMIT": "0",
    "LEVERAGE": "-1"
  }
]
```

---

## Заявки и сделки

### GET `/api/orders`

Активные заявки (статус «Активна»).

Параметры: `OrderNum, ClassCode, SecCode, Price, Qty, Value, OrderDateTime, Operation`.

Поля ответа: `OrderNum, ClassCode, SecCode, Price, Qty, Value, OrderDateTime, Operation, State`. Сортировка по времени заявки, новые сверху.

### GET `/api/trades/classes`

Классы, закреплённые за вашим депозитарием. `GET /api/trades` возвращает сделки только по ним.

### GET `/api/trades`

Сделки (только по вашим классам).

Параметры: любой столбец таблицы сделок, например `FirmId`, `SecCode`, `ClassCode`. Если указан чужой `ClassCode` — `403 FORBIDDEN_CLASS` со списком доступных классов.

Ответ: массив сделок со всеми полями.

```bash
curl "http://172.23.10.85:5000/api/trades?SecCode=GAZP"
```
