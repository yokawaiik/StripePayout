# Документация к модулю 

## Установка

1. Добавить в [Secret Manager](https://console.cloud.google.com/security/secret-manager/secret) переменные окружения: STRIPE_WEBHOOK_SECRET и STRIPE_API_KEY
2. cd ./functions
3. npm run deploy


## Описание функций
### Фундаментальная информация
Для создания запросов к FB CF требуется установить в заголовки запросов jwt токены (это есть в FF). Это должно выглядеть следующим образом (пример в Postman можно посмотреть):

    Authorization: ey43634t34534634634

### GET: createUserPayoutAccount
Создание Standard аккаунта для выплат в Stripe. Добавляет в коллецию stripe_payout_accounts новый документ с ID подключенного пользователя из Stripe.

#### Объект положительного ответа
    {
        "message": "User payout account created successfully."
    }


### GET: createUserPayoutAccountLink
Создание ссылки для регистрации пользователя в платформе заказчика. После того как пользователь заполнит нужные данные в профиле в коллеции **stripe_payout_accounts** поле **status** будет изменено на Active, то есть пополнение баланса пользователя с платформы заказчика будет доступно
#### Объект положительного ответа
    {
        "accountLink": {
            "object": "account_link",
            "created": 1686919829,
            "expires_at": 1686920129,
            "url": "https://connect.stripe.com/setup/s/acct_1NJc6bPgzpeBKWre/L1O5MW7YuWuy"
        }
    }

При повторном создании ссылки для текущего пользователя выдается такой же ответ. При переходе по ссылке пользователь может изменить свои данные.


### PUT: userMoneyRequest
#### Требуемые параметры в body
    {
        amount: number (integer) 
    } 
    // amount - количество долларов в центах для пополнения аккаунта в Stripe подключенного пользователя

#### Ограничения на вывод:
- Запрещен вывод менее чем 10 центов

#### Объект положительного ответа
    {
        "message": "Money transfer successful.",
        "transferResponse": {
            "id": "tr_1NJfcRBN1aTtxwGT63eppBIu",
            "object": "transfer",
            "amount": 50,
            "amount_reversed": 0,
            "balance_transaction": "txn_1NJfcRBN1aTtxwGTCY4w4x0H",
            "created": 1686933327,
            "currency": "usd",
            "description": "The user has requested a withdrawal.",
            "destination": "acct_1NJc6bPgzpeBKWre",
            "destination_payment": "py_1NJfcRPgzpeBKWre6RKUfgju",
            "livemode": false,
            "metadata": {},
            "reversals": {
                "object": "list",
                "data": [],
                "has_more": false,
                "total_count": 0,
                "url": "/v1/transfers/tr_1NJfcRBN1aTtxwGT63eppBIu/reversals"
            },
            "reversed": false,
            "source_transaction": null,
            "source_type": "card",
            "transfer_group": null
        }
    }


### GET: checkUserPayoutStripeAccountExists
Запрос нужен для того, чтобы проверить есть ли аккаунт пользователя на платформе Stripe или он был удален. Это актуально для тех случаев, когда пользователь удалил аккаунт и пытается сделать вывод средств. Можно проверять перед нажатием действия вывода средств существует ли аккаунт и если нет, то делаем пометку в документе **stripe_payout_accounts** в поле **status**, что аккаунт Inactive или вообще удалить документ, а после дать пользователю ответ, что требуется создать новый аккаунт.
#### Объект положительного ответа
{ 
    result: true, // or false if not found (removed from Stripe platform)
    message: "User connected account exists." // or another message
}

### POST: stripeWebhook
Смысл метода в том, чтобы обновлять документ пользователя в коллеции **stripe_payout_accounts**, а именно поле **status** для того, чтобы отслеживать если подключенный пользовательский аккаунт может осуществлять вывод средств (выплаты).
#### Настройка
Необходимо создать Webhook в Stripe с событием: 
- account.updated


## Ссылки на функции
Function URL (feature_pay_back:createUserPayoutAccount(us-central1)): https://createuserpayoutaccount-6brgh4tqza-uc.a.run.app
Function URL (feature_pay_back:createUserPayoutAccountLink(us-central1)): https://createuserpayoutaccountlink-6brgh4tqza-uc.a.run.app
Function URL (feature_pay_back:userMoneyRequest(us-central1)): https://usermoneyrequest-6brgh4tqza-uc.a.run.app
Function URL (feature_pay_back:stripeWebhook(us-central1)): https://stripewebhook-6brgh4tqza-uc.a.run.app
Function URL (feature_pay_back:checkUserPayoutStripeAccountExists(us-central1)): https://checkuserpayoutstripeaccountexists-6brgh4tqza-uc.a.run.app


## Коллекции
Большинство событий и чеков в Stripe сохраняются там только месяц, поэтому имеет смысл дублировать их сюда

### stripe_events
Содержание события соответсвует оригиналу: https://stripe.com/docs/api/events/object

### stripe_payout_accounts
    ID: STRIPE CONNECT USER ID
    id: string
    updatedAt: Date
    createdAt: Date
    status: string (Inactive/Active)

### stripe_withdrawal_checks
ID: transferObject ID
amount: string
createdAt: Date
customerUID: string
transferObject: Содержание события соответсвует оригиналу: https://stripe.com/docs/api/transfers/object

### stripe_errors
    ID: random UUID
    customerUID: string
    createdAt: Date
    text: string
